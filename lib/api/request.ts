export interface FetchError extends Error {
    status?: number;
    info?: unknown;
  }
  
  export const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  export async function safeFetch<T>(url: string, init?: RequestInit): Promise<T> {
    try {
      const res = await fetch(url, init);
  
      if (!res.ok) {
        const error: FetchError = new Error("Network response was not ok");
        error.status = res.status;
        try {
          error.info = await res.json();
        } catch {
          console.error("Failed to parse error response");
        }
        throw error;
      }
  
      return (await res.json()) as T;
    } catch (error) {
      console.error("safeFetch error:", error);
      throw error;
    }
  }
  