/**
 * A wrapper around fetch that automatically retries the request on failure or 429/5xx status codes
 * using exponential backoff.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<Response> {
  let latestError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If successful (2xx) or a client error we shouldn't retry (400-403, 404), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }
      
      // If it's 429 (Too Many Requests) or a 5xx Server Error, we should throw to trigger a retry
      throw new Error(`Request failed with status: ${response.status}`);
      
    } catch (err) {
      latestError = err instanceof Error ? err : new Error(String(err));
      
      if (attempt < maxRetries) {
        // Exponential backoff: baseDelay * 2^attempt (e.g., 1s, 2s, 4s)
        const delay = baseDelayMs * Math.pow(2, attempt);
        // Add random jitter to prevent thundering herd (±20%)
        const jitter = delay * 0.2 * (Math.random() * 2 - 1);
        await new Promise((resolve) => setTimeout(resolve, delay + jitter));
      }
    }
  }

  throw latestError || new Error(`Failed to fetch ${url} after ${maxRetries} retries`);
}
