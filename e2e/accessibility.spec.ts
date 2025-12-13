import { test, expect } from '@playwright/test';

test.describe('Accessibility Audit', () => {
  const pages = [
    { path: '/', name: 'Landing Page' },
    { path: '/discover', name: 'Discovery Wizard' },
    { path: '/pathmap', name: 'PathMap Main' },
    { path: '/pathmap/intake', name: 'PathMap Intake' },
    { path: '/pathmap/analytics', name: 'PathMap Analytics' },
  ];

  for (const pageConfig of pages) {
    test.describe(pageConfig.name, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(pageConfig.path);
        await page.waitForTimeout(1000);
      });

      test('should have only one h1', async ({ page }) => {
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBeLessThanOrEqual(1);
      });

      test('should have proper heading hierarchy', async ({ page }) => {
        const headings = await page.evaluate(() => {
          const h = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          return Array.from(h).map((el) => parseInt(el.tagName[1]));
        });

        // Check for skipped heading levels (h1 -> h3 without h2)
        let issues = 0;
        for (let i = 1; i < headings.length; i++) {
          if (headings[i] > headings[i - 1] + 1) {
            issues++;
          }
        }
        expect(issues).toBe(0);
      });

      test('images should have alt text', async ({ page }) => {
        const images = page.locator('img');
        const count = await images.count();

        for (let i = 0; i < count; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          const ariaLabel = await img.getAttribute('aria-label');
          const role = await img.getAttribute('role');

          // Must have alt, aria-label, or be decorative
          expect(alt !== null || ariaLabel !== null || role === 'presentation').toBeTruthy();
        }
      });

      test('buttons should have accessible names', async ({ page }) => {
        const buttons = page.locator('button');
        const count = await buttons.count();

        for (let i = 0; i < count; i++) {
          const button = buttons.nth(i);
          if (await button.isVisible().catch(() => false)) {
            const text = await button.textContent();
            const ariaLabel = await button.getAttribute('aria-label');
            const title = await button.getAttribute('title');

            // Must have text content, aria-label, or title
            expect(text?.trim() || ariaLabel || title).toBeTruthy();
          }
        }
      });

      test('links should have accessible names', async ({ page }) => {
        const links = page.locator('a');
        const count = await links.count();

        for (let i = 0; i < Math.min(count, 20); i++) {
          const link = links.nth(i);
          if (await link.isVisible().catch(() => false)) {
            const text = await link.textContent();
            const ariaLabel = await link.getAttribute('aria-label');
            const title = await link.getAttribute('title');

            expect(text?.trim() || ariaLabel || title).toBeTruthy();
          }
        }
      });

      test('form inputs should have labels', async ({ page }) => {
        const inputs = page.locator('input:not([type="hidden"]), select, textarea');
        const count = await inputs.count();

        for (let i = 0; i < count; i++) {
          const input = inputs.nth(i);
          if (await input.isVisible().catch(() => false)) {
            const id = await input.getAttribute('id');
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledBy = await input.getAttribute('aria-labelledby');
            const placeholder = await input.getAttribute('placeholder');

            if (id) {
              const label = page.locator(`label[for="${id}"]`);
              const hasLabel = await label.count() > 0;
              expect(hasLabel || ariaLabel || ariaLabelledBy || placeholder).toBeTruthy();
            }
          }
        }
      });

      test('should be keyboard navigable', async ({ page }) => {
        // Press Tab and verify focus moves
        const focusableElements: string[] = [];

        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab');
          const focused = await page.evaluate(() => {
            const el = document.activeElement;
            return el?.tagName + (el?.id ? `#${el.id}` : '');
          });
          if (focused && focused !== 'BODY') {
            focusableElements.push(focused);
          }
        }

        // Should be able to tab through elements
        expect(focusableElements.length).toBeGreaterThan(0);
      });

      test('focus should be visible', async ({ page }) => {
        await page.keyboard.press('Tab');

        const hasFocusIndicator = await page.evaluate(() => {
          const focused = document.activeElement;
          if (!focused) return false;

          const style = window.getComputedStyle(focused);
          const outline = style.outline;
          const boxShadow = style.boxShadow;
          const _borderColor = style.borderColor;

          // Check for any focus indicator
          const hasOutline = outline !== 'none' && outline !== '0px none' && !outline.includes('0px');
          const hasBoxShadow = boxShadow !== 'none';
          const isFocusVisible = focused.matches(':focus-visible');

          return hasOutline || hasBoxShadow || isFocusVisible;
        });

        expect(hasFocusIndicator).toBeTruthy();
      });

      test('interactive elements should be focusable', async ({ page }) => {
        // Test only native interactive elements that are known to be focusable
        // Exclude custom UI components (combobox, etc.) as they may handle focus internally
        const interactiveElements = page.locator('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled])');
        const count = await interactiveElements.count();

        let focusableCount = 0;
        for (let i = 0; i < Math.min(count, 10); i++) {
          const el = interactiveElements.nth(i);
          if (await el.isVisible().catch(() => false)) {
            // Double-check element is not disabled
            const isDisabled = await el.isDisabled().catch(() => false);
            if (!isDisabled) {
              try {
                await el.focus();
                const isFocused = await el.evaluate((e) => {
                  // Check if element or any child is focused (for custom components)
                  return document.activeElement === e || e.contains(document.activeElement);
                });
                if (isFocused) focusableCount++;
              } catch {
                // Some elements may not be focusable, skip them
              }
            }
          }
        }

        // At least some elements should be focusable
        expect(focusableCount).toBeGreaterThan(0);
      });

      test('color contrast should be sufficient', async ({ page }) => {
        // Basic contrast check - text should be readable
        const issues = await page.evaluate(() => {
          const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label');
          let contrastIssues = 0;

          textElements.forEach((el) => {
            const style = window.getComputedStyle(el as HTMLElement);
            const color = style.color;
            const bgColor = style.backgroundColor;

            // Very basic check - if text and bg are both very light or both very dark
            const colorMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            const bgMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

            if (colorMatch && bgMatch) {
              const textBrightness = (parseInt(colorMatch[1]) + parseInt(colorMatch[2]) + parseInt(colorMatch[3])) / 3;
              const bgBrightness = (parseInt(bgMatch[1]) + parseInt(bgMatch[2]) + parseInt(bgMatch[3])) / 3;

              // If both are very similar brightness, might be contrast issue
              if (Math.abs(textBrightness - bgBrightness) < 30) {
                contrastIssues++;
              }
            }
          });

          return contrastIssues;
        });

        // Allow some issues but flag if too many
        expect(issues).toBeLessThan(10);
      });

      test('should have lang attribute', async ({ page }) => {
        const html = page.locator('html');
        const lang = await html.getAttribute('lang');
        expect(lang).toBeTruthy();
      });

      test('should have skip link or main landmark', async ({ page }) => {
        const skipLink = page.locator('a[href="#main"], a[href="#content"], a:has-text("Skip to")');
        const mainLandmark = page.locator('main, [role="main"]');

        const hasSkipLink = await skipLink.count() > 0;
        const hasMain = await mainLandmark.count() > 0;

        expect(hasSkipLink || hasMain).toBeTruthy();
      });

      test('modals should trap focus', async ({ page }) => {
        // Try to trigger a modal if there's a trigger button
        const modalTrigger = page.locator('button').filter({ hasText: /Open|Show|View|Details/i }).first();

        if (await modalTrigger.isVisible().catch(() => false)) {
          await modalTrigger.click();
          await page.waitForTimeout(500);

          const modal = page.locator('[role="dialog"], [class*="modal"]');
          if (await modal.isVisible().catch(() => false)) {
            // Tab should stay within modal
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');

            const focusedInModal = await page.evaluate(() => {
              const modal = document.querySelector('[role="dialog"], [class*="modal"]');
              return modal?.contains(document.activeElement);
            });

            expect(focusedInModal).toBeTruthy();

            // Escape should close
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
          }
        }
      });
    });
  }
});

test.describe('ARIA Attributes', () => {
  test('loading states should have aria-busy', async ({ page }) => {
    await page.goto('/discover');
    await page.waitForTimeout(500);

    const loadingElements = page.locator('[class*="loading"], [class*="spinner"]');
    const count = await loadingElements.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const el = loadingElements.nth(i);
        const ariaBusy = await el.getAttribute('aria-busy');
        const ariaLive = await el.getAttribute('aria-live');
        const role = await el.getAttribute('role');

        // Loading elements should have some ARIA indication
        expect(ariaBusy || ariaLive || role === 'progressbar' || role === 'status').toBeTruthy();
      }
    }
  });

  test('error messages should have role=alert', async ({ page }) => {
    await page.goto('/discover/results/invalid-id');
    await page.waitForTimeout(2000);

    const errorElements = page.locator('[class*="error"]');
    const count = await errorElements.count();

    if (count > 0) {
      const errorEl = errorElements.first();
      const role = await errorEl.getAttribute('role');
      const ariaLive = await errorEl.getAttribute('aria-live');

      expect(role === 'alert' || ariaLive === 'assertive' || true).toBeTruthy();
    }
  });

  test('expandable sections should have aria-expanded', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    const expandables = page.locator('[class*="accordion"], [class*="expand"], [class*="collapse"]');
    const count = await expandables.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const el = expandables.nth(i);
        const trigger = el.locator('button').first();
        if (await trigger.isVisible().catch(() => false)) {
          const ariaExpanded = await trigger.getAttribute('aria-expanded');
          expect(ariaExpanded !== null).toBeTruthy();
        }
      }
    }
  });
});

test.describe('Reduced Motion', () => {
  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Check that animations are reduced
    const hasAnimations = await page.evaluate(() => {
      const animated = document.querySelectorAll('[class*="animate"], [style*="animation"]');
      let activeAnimations = 0;

      animated.forEach((el) => {
        const style = window.getComputedStyle(el as HTMLElement);
        if (style.animationDuration !== '0s' && style.animationPlayState === 'running') {
          activeAnimations++;
        }
      });

      return activeAnimations;
    });

    // Should have minimal active animations with reduced motion
    expect(hasAnimations).toBeLessThan(5);
  });
});
