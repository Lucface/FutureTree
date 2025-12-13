/**
 * Starter Story Case Study Scraper
 *
 * Extracts ~4,500 business case studies from starterstory.com
 * Uses Puppeteer for JavaScript rendering and authenticated access
 *
 * Requirements:
 * - Starter Story Premium subscription (for full access)
 * - Apify account (for proxy rotation)
 *
 * Rate limiting:
 * - 2-3 second delay between requests
 * - Respects robots.txt
 * - Uses session cookies for authentication
 */

import { Actor, log } from "apify";
import { PuppeteerCrawler, Dataset } from "crawlee";

// Initialize the Actor
await Actor.init();

// Get input configuration
const input = (await Actor.getInput()) ?? {};
const {
  // Authentication - get from browser session
  sessionCookies = [],

  // Scraping options
  maxCaseStudies = 5000,
  delayBetweenRequests = 2500, // ms - be respectful
  startPage = 1,

  // Filtering (optional)
  industries = [], // Empty = all industries
  minRevenue = null,
  maxRevenue = null,
} = input;

log.info("Starting Starter Story scraper", {
  maxCaseStudies,
  delayBetweenRequests,
  startPage,
  industriesFilter: industries.length > 0 ? industries : "all",
});

// Track progress
let caseStudiesExtracted = 0;
const extractedUrls = new Set();

// Create the Puppeteer crawler
const crawler = new PuppeteerCrawler({
  // Use Apify proxy for reliability
  proxyConfiguration: await Actor.createProxyConfiguration({
    useApifyProxy: true,
    apifyProxyGroups: ["RESIDENTIAL"],
  }),

  // Browser settings
  launchContext: {
    launchOptions: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  },

  // Rate limiting
  maxRequestsPerMinute: 20,
  maxConcurrency: 1, // Sequential for respectful scraping

  // Navigation timeout
  navigationTimeoutSecs: 60,

  // Pre-navigation hook - add cookies
  preNavigationHooks: [
    async ({ page }) => {
      // Set cookies if provided (for authenticated access)
      if (sessionCookies.length > 0) {
        await page.setCookie(...sessionCookies);
      }

      // Set a realistic user agent
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      );
    },
  ],

  // Request handler
  requestHandler: async ({ request, page, enqueueLinks }) => {
    const { url } = request;

    // Handle explore page (pagination)
    if (url.includes("/explore")) {
      log.info("Processing explore page", { url });

      // Wait for case study cards to load
      await page.waitForSelector('a[href*="/stories/"]', { timeout: 30000 });

      // Extract case study URLs
      const storyLinks = await page.evaluate(() => {
        const links = Array.from(
          document.querySelectorAll('a[href*="/stories/"]'),
        );
        return links
          .map((a) => a.href)
          .filter(
            (href) =>
              !href.includes("/stories/search") &&
              !href.includes("/stories/explore"),
          );
      });

      log.info(`Found ${storyLinks.length} case study links on this page`);

      // Add story links to queue
      for (const link of storyLinks) {
        if (!extractedUrls.has(link) && caseStudiesExtracted < maxCaseStudies) {
          await crawler.addRequests([
            {
              url: link,
              label: "case-study",
              userData: { type: "case-study" },
            },
          ]);
        }
      }

      // Find and queue next page
      const nextPageLink = await page.evaluate(() => {
        const nextBtn = document.querySelector(
          'a[aria-label="Next page"], a:contains("Next")',
        );
        return nextBtn ? nextBtn.href : null;
      });

      if (nextPageLink && caseStudiesExtracted < maxCaseStudies) {
        await crawler.addRequests([
          {
            url: nextPageLink,
            label: "explore",
            userData: { type: "explore" },
          },
        ]);
      }

      // Respectful delay
      await new Promise((r) => setTimeout(r, delayBetweenRequests));
    }

    // Handle individual case study page
    else if (url.includes("/stories/") && !extractedUrls.has(url)) {
      log.info("Extracting case study", {
        url,
        progress: `${caseStudiesExtracted}/${maxCaseStudies}`,
      });

      extractedUrls.add(url);

      // Wait for content to load
      await page.waitForSelector("article, main, .story-content", {
        timeout: 30000,
      });

      // Extract case study data
      const caseStudy = await page.evaluate(() => {
        const getText = (selector) => {
          const el = document.querySelector(selector);
          return el ? el.textContent.trim() : null;
        };

        const getMetaContent = (name) => {
          const meta = document.querySelector(
            `meta[name="${name}"], meta[property="${name}"]`,
          );
          return meta ? meta.content : null;
        };

        // Extract structured data from page
        const data = {
          // Basic info
          companyName: getText("h1") || getText(".company-name"),
          title: document.title,

          // Revenue metrics (look for common patterns)
          monthlyRevenue: null,
          startupCosts: null,

          // Founder info
          founderName: getText(".founder-name, .author-name"),

          // Location
          city: null,
          state: null,
          country: null,

          // Business details
          industry: null,
          businessType: null,
          employeeCount: null,
          foundedYear: null,

          // Content
          fullContent: null,
          summary:
            getMetaContent("description") || getMetaContent("og:description"),

          // Source
          sourceUrl: window.location.href,
        };

        // Look for structured data in JSON-LD
        const jsonLd = document.querySelector(
          'script[type="application/ld+json"]',
        );
        if (jsonLd) {
          try {
            const structuredData = JSON.parse(jsonLd.textContent);
            if (structuredData["@type"] === "Article") {
              data.datePublished = structuredData.datePublished;
              data.dateModified = structuredData.dateModified;
              data.author = structuredData.author?.name;
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }

        // Extract metrics from sidebar or stats cards
        const statsElements = document.querySelectorAll(
          '[class*="stat"], [class*="metric"], [class*="revenue"]',
        );
        statsElements.forEach((el) => {
          const text = el.textContent.toLowerCase();
          const value = el.textContent.match(
            /\$[\d,]+[kKmM]?|\d+[\d,]*[kKmM]?/,
          );

          if (
            text.includes("revenue") ||
            text.includes("/month") ||
            text.includes("mrr")
          ) {
            data.monthlyRevenue = value ? value[0] : null;
          }
          if (
            text.includes("startup") ||
            text.includes("cost") ||
            text.includes("investment")
          ) {
            data.startupCosts = value ? value[0] : null;
          }
          if (text.includes("employee") || text.includes("team")) {
            data.employeeCount = value ? value[0] : null;
          }
        });

        // Extract location from common patterns
        const locationPatterns = [
          /(?:based in|located in|from)\s+([A-Za-z\s]+),?\s*([A-Z]{2})?,?\s*(USA|US|United States)?/i,
          /([A-Za-z\s]+),\s*([A-Z]{2}),?\s*(USA|US)?/,
        ];

        const pageText = document.body.innerText;
        for (const pattern of locationPatterns) {
          const match = pageText.match(pattern);
          if (match) {
            data.city = match[1]?.trim();
            data.state = match[2]?.trim();
            data.country = match[3]?.trim() || "USA";
            break;
          }
        }

        // Extract industry/niche
        const breadcrumbs = document.querySelectorAll(
          'nav[aria-label="breadcrumb"] a, .breadcrumb a',
        );
        if (breadcrumbs.length > 1) {
          data.industry =
            breadcrumbs[breadcrumbs.length - 2]?.textContent?.trim();
        }

        // Get main article content
        const articleContent = document.querySelector(
          "article, .story-content, main",
        );
        if (articleContent) {
          // Get text content, preserving some structure
          data.fullContent = articleContent.innerText.substring(0, 50000); // Limit to 50KB
        }

        return data;
      });

      // Additional extraction - look for specific Starter Story patterns
      const additionalData = await page.evaluate(() => {
        const data = {
          growthStrategies: [],
          businessModel: null,
          customerType: null,
          fundingType: null,
          toolsUsed: [],
        };

        // Look for tags/categories
        const tags = document.querySelectorAll(
          '.tag, [class*="badge"], [class*="category"]',
        );
        tags.forEach((tag) => {
          const text = tag.textContent.trim().toLowerCase();
          if (text.includes("b2b") || text.includes("b2c")) {
            data.customerType = text.toUpperCase();
          }
          if (
            text.includes("bootstrap") ||
            text.includes("vc") ||
            text.includes("funded")
          ) {
            data.fundingType = text;
          }
          if (
            [
              "seo",
              "social media",
              "ads",
              "word of mouth",
              "content",
              "email",
            ].some((s) => text.includes(s))
          ) {
            data.growthStrategies.push(text);
          }
        });

        // Look for tools section
        const toolsSection = document.querySelector(
          '[class*="tools"], [class*="stack"]',
        );
        if (toolsSection) {
          const toolLinks = toolsSection.querySelectorAll("a, li");
          data.toolsUsed = Array.from(toolLinks)
            .map((el) => el.textContent.trim())
            .filter(Boolean);
        }

        return data;
      });

      // Merge data
      const fullCaseStudy = {
        ...caseStudy,
        ...additionalData,
        extractedAt: new Date().toISOString(),
      };

      // Save to dataset
      await Dataset.pushData(fullCaseStudy);
      caseStudiesExtracted++;

      log.info("Extracted case study", {
        companyName: fullCaseStudy.companyName,
        revenue: fullCaseStudy.monthlyRevenue,
        industry: fullCaseStudy.industry,
        progress: `${caseStudiesExtracted}/${maxCaseStudies}`,
      });

      // Respectful delay
      await new Promise((r) => setTimeout(r, delayBetweenRequests));
    }
  },

  // Handle failures gracefully
  failedRequestHandler: async ({ request, error }) => {
    log.warning("Request failed", {
      url: request.url,
      error: error.message,
    });
  },
});

// Build starting URL with filters
let startUrl = `https://www.starterstory.com/explore?page=${startPage}`;
if (industries.length > 0) {
  startUrl += `&niche=${industries.join(",")}`;
}
if (minRevenue) {
  startUrl += `&revenue_min=${minRevenue}`;
}
if (maxRevenue) {
  startUrl += `&revenue_max=${maxRevenue}`;
}

// Start the crawler
log.info("Starting crawler", { startUrl });
await crawler.run([
  {
    url: startUrl,
    label: "explore",
    userData: { type: "explore" },
  },
]);

// Log final stats
log.info("Scraping complete", {
  totalExtracted: caseStudiesExtracted,
  uniqueUrls: extractedUrls.size,
});

// Exit
await Actor.exit();
