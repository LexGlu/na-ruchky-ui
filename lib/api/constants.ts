/**

 * Base URL for the API.

 * Ensure that NEXT_PUBLIC_API_BASE_URL is set in your environment variables.

 */

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is required");
}

export const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
