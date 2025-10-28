/**
 * Get current date in YYYY-MM-DD format using local timezone
 * This avoids issues with UTC conversion that can cause date to be off by one day
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format a date object to YYYY-MM-DD using local timezone
 */
export const formatLocalDate = (date: Date): string => {
  return getLocalDateString(date);
};
