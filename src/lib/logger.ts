/**
 * Secure logging utility that prevents sensitive information leakage in production.
 * In development: logs full error details for debugging
 * In production: logs only generic messages to prevent exposing internal details
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Log an error safely - detailed in dev, generic in production
 */
export function logError(message: string, error?: unknown): void {
  if (isDevelopment) {
    console.error(message, error);
  } else {
    // In production, only log the generic message without error details
    console.error(message);
  }
}

/**
 * Log a warning safely - detailed in dev, generic in production
 */
export function logWarn(message: string, data?: unknown): void {
  if (isDevelopment) {
    console.warn(message, data);
  } else {
    console.warn(message);
  }
}

/**
 * Log info - only in development
 */
export function logDebug(message: string, data?: unknown): void {
  if (isDevelopment) {
    console.log(message, data);
  }
}
