/**
 * FutureTree Performance Utilities
 *
 * Utilities for optimizing performance across the application.
 * Includes debouncing, throttling, and lazy loading helpers.
 */

/**
 * Debounce - Delays function execution until after wait milliseconds have elapsed
 * since the last time it was invoked.
 *
 * @example
 * ```tsx
 * const debouncedSearch = debounce((query: string) => {
 *   fetchResults(query);
 * }, 300);
 *
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 * ```
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Throttle - Limits function execution to at most once per wait milliseconds.
 *
 * @example
 * ```tsx
 * const throttledScroll = throttle(() => {
 *   updateScrollPosition();
 * }, 100);
 *
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastTime = now;
      func(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now();
        timeoutId = null;
        func(...args);
      }, remaining);
    }
  };
}

/**
 * RAF Throttle - Limits function execution to animation frame rate.
 * Best for visual updates like scroll handling.
 *
 * @example
 * ```tsx
 * const rafScroll = rafThrottle(() => {
 *   updateParallax();
 * });
 *
 * window.addEventListener('scroll', rafScroll);
 * ```
 */
export function rafThrottle<T extends (...args: unknown[]) => void>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function rafThrottled(...args: Parameters<T>) {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          func(...(lastArgs as Parameters<T>));
        }
        rafId = null;
      });
    }
  };
}

/**
 * Lazy Load - Creates a lazy-loaded version of an async function.
 * Caches the result for subsequent calls.
 *
 * @example
 * ```tsx
 * const getConfig = lazyLoad(async () => {
 *   const res = await fetch('/api/config');
 *   return res.json();
 * });
 *
 * // First call fetches, subsequent calls return cached
 * const config = await getConfig();
 * ```
 */
export function lazyLoad<T>(loader: () => Promise<T>): () => Promise<T> {
  let cache: T | null = null;
  let loading: Promise<T> | null = null;

  return async () => {
    if (cache !== null) {
      return cache;
    }

    if (loading !== null) {
      return loading;
    }

    loading = loader().then((result) => {
      cache = result;
      loading = null;
      return result;
    });

    return loading;
  };
}

/**
 * Memoize - Caches function results based on arguments.
 * Uses JSON.stringify for cache key by default.
 *
 * @example
 * ```tsx
 * const expensiveCalc = memoize((data: number[]) => {
 *   return data.reduce((sum, n) => sum + n, 0);
 * });
 * ```
 */
export function memoize<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  keyFn?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Batch Updates - Batches multiple updates into a single animation frame.
 *
 * @example
 * ```tsx
 * const batcher = createBatcher<string>((items) => {
 *   // All items batched into single update
 *   items.forEach(id => updateElement(id));
 * });
 *
 * // Multiple calls batched
 * batcher.add('item-1');
 * batcher.add('item-2');
 * batcher.add('item-3');
 * // → Single callback with ['item-1', 'item-2', 'item-3']
 * ```
 */
export function createBatcher<T>(callback: (items: T[]) => void) {
  let items: T[] = [];
  let scheduled = false;

  return {
    add(item: T) {
      items.push(item);

      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(() => {
          const batch = items;
          items = [];
          scheduled = false;
          callback(batch);
        });
      }
    },
    clear() {
      items = [];
    },
  };
}

/**
 * Prefetch - Prefetches a URL in the background.
 * Uses link prefetch for documents, fetch for data.
 *
 * @example
 * ```tsx
 * // On hover, prefetch next page
 * onMouseEnter={() => prefetch('/next-page')}
 * ```
 */
export function prefetch(url: string, type: 'document' | 'data' = 'document'): void {
  if (typeof window === 'undefined') return;

  if (type === 'document') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  } else {
    fetch(url, { priority: 'low' as RequestPriority }).catch(() => {
      // Silently fail - prefetch is optional optimization
    });
  }
}

/**
 * Measure - Simple performance measurement utility.
 *
 * @example
 * ```tsx
 * const timer = measure('Component render');
 * // ... do work
 * timer.end(); // Logs: "Component render: 42ms"
 * ```
 */
export function measure(label: string) {
  const start = performance.now();

  return {
    end() {
      const duration = performance.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log(`${label}: ${duration.toFixed(2)}ms`);
      }
      return duration;
    },
  };
}
