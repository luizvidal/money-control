/**
 * Utility functions for handling URL parameters
 */

/**
 * Get URL search params as an object
 */
export const getUrlParams = (): Record<string, string> => {
  const searchParams = new URLSearchParams(window.location.search);
  const params: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
};

/**
 * Update URL with new params without reloading the page
 */
export const updateUrlParams = (params: Record<string, string | undefined>): void => {
  const searchParams = new URLSearchParams(window.location.search);
  
  // Update or add new params
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
  });
  
  // Create the new URL
  const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  // Update the URL without reloading the page
  window.history.pushState({ path: newUrl }, '', newUrl);
};

/**
 * Clear all URL params
 */
export const clearUrlParams = (): void => {
  window.history.pushState({}, '', window.location.pathname);
};
