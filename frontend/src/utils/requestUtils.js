/**
 * Request Utilities - Helpers for managing concurrent API requests
 * Prevents rate limiting by controlling request parallelization
 */

/**
 * Execute async tasks with limited concurrency
 * Useful for preventing rate limiting when making many API calls
 *
 * @param {Array<Promise>} tasks - Array of async functions/promises to execute
 * @param {number} limit - Max concurrent tasks (default: 3)
 * @returns {Promise<Array>} Results in the same order as input tasks
 *
 * @example
 * const dates = ['2026-01-19', '2026-01-20', ...];
 * const results = await limitConcurrency(
 *   dates.map(date => api.medications.getForDate(date)),
 *   3 // Max 3 concurrent requests
 * );
 */
export const limitConcurrency = async (tasks, limit = 3) => {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];

  const results = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const chunk = tasks.slice(i, i + limit);
    const chunkResults = await Promise.all(chunk);
    results.push(...chunkResults);
  }
  return results;
};

/**
 * Debounce a function to delay execution until user stops calling it
 * Useful for reducing repeated API calls during rapid interactions
 *
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Function} Debounced function
 *
 * @example
 * const debouncedSearch = debounce(query => api.search(query), 500);
 * input.onChange(e => debouncedSearch(e.target.value));
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle a function to limit how often it executes
 * Useful for preventing repeated API calls in rapid succession
 *
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Milliseconds between calls (default: 1000)
 * @returns {Function} Throttled function
 *
 * @example
 * const throttledScroll = throttle(() => api.loadMore(), 1000);
 * window.addEventListener('scroll', throttledScroll);
 */
export const throttle = (fn, limit = 1000) => {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Create a simple cache for API request results
 * Useful for avoiding duplicate requests for the same data
 *
 * @param {Function} fetchFn - Async function to cache
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 * @returns {Function} Cached function with same signature as fetchFn
 *
 * @example
 * const cachedGetUser = createRequestCache(api.users.get, 5 * 60 * 1000);
 * const user1 = await cachedGetUser(userId); // API call
 * const user2 = await cachedGetUser(userId); // From cache (if within TTL)
 */
export const createRequestCache = (fetchFn, ttl = 5 * 60 * 1000) => {
  const cache = new Map();

  return async (...args) => {
    const cacheKey = JSON.stringify(args);
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const data = await fetchFn(...args);
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  };
};

/**
 * Cancel in-flight requests using AbortController
 * Useful for canceling requests when component unmounts or user navigates away
 *
 * @returns {Object} Object with abort controller and helper methods
 *
 * @example
 * const { controller, fetch: cachedFetch } = createAbortable();
 *
 * useEffect(() => {
 *   cachedFetch('/api/data');
 *   return () => controller.abort(); // Cancel on unmount
 * }, []);
 */
export const createAbortable = () => {
  const controller = new AbortController();

  return {
    controller,
    fetch: (url, options = {}) =>
      fetch(url, { ...options, signal: controller.signal }),
  };
};
