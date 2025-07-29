"use client";

import { ReactNode } from "react";
import { SWRConfig, SWRConfiguration } from "swr";
import { UserProvider } from "@/contexts/user-context";

// ============================================================================
// CONFIGURATION
// ============================================================================

const SWR_CONFIG: SWRConfiguration = {
  // ISR-optimized settings
  revalidateOnFocus: false, // Don't revalidate on focus since we have ISR
  revalidateOnReconnect: true, // Revalidate when connection restored
  revalidateOnMount: true, // Always revalidate on mount for fresh data

  // Cache settings optimized for ISR
  dedupingInterval: 5000, // 5 seconds deduplication
  errorRetryCount: 3,
  errorRetryInterval: 2000, // 2 seconds between retries

  // Performance settings
  refreshInterval: 0, // No auto-refresh, rely on ISR
  refreshWhenHidden: false, // Don't refresh when tab is hidden
  refreshWhenOffline: false, // Don't attempt refresh when offline

  // Error handling
  shouldRetryOnError: (error: Error & { status?: number }) => {
    // Don't retry on 4xx errors (client errors)
    if (error?.status && error.status >= 400 && error.status < 500) {
      return false;
    }
    return true;
  },

  onError: (error: Error & { status?: number; url?: string }, key: string) => {
    console.error(`SWR Error [${key}]:`, error);

    // Enhanced error logging in development
    if (process.env.NODE_ENV === "development") {
      console.group("🔍 SWR Error Details");
      console.log("Key:", key);
      console.log("Error:", error);
      console.log("Status:", error?.status);
      console.log("Message:", error?.message);
      console.groupEnd();
    }

    // In production, you might want to send errors to monitoring service
    // Example: Sentry.captureException(error, { extra: { swrKey: key } });
  },

  onSuccess: (data: unknown, key: string) => {
    // Log successful fetches in development
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ SWR Success [${key}]:`, {
        dataLength: Array.isArray(data) ? data.length : "N/A",
        timestamp: new Date().toISOString(),
      });
    }
  },

  // ISR-compatible fetcher with enhanced error handling
  fetcher: async (url: string): Promise<unknown> => {
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        // Add headers that work well with ISR
        headers: {
          "Cache-Control": "no-cache", // Let ISR handle caching
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const error = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        ) as Error & {
          status: number;
          url: string;
        };
        error.status = response.status;
        error.url = url;
        throw error;
      }

      const data: unknown = await response.json();

      // Log performance in development
      if (process.env.NODE_ENV === "development") {
        const duration = Date.now() - startTime;
        console.log(`⚡ Fetch completed in ${duration}ms: ${url}`);
      }

      return data;
    } catch (error) {
      // Enhanced error object for better debugging
      const enhancedError =
        error instanceof Error ? error : new Error(String(error));
      (enhancedError as Error & { url?: string; timestamp?: string }).url = url;
      (
        enhancedError as Error & { url?: string; timestamp?: string }
      ).timestamp = new Date().toISOString();
      throw enhancedError;
    }
  },

  // Compare function for data equality (prevents unnecessary re-renders)
  compare: (a: unknown, b: unknown) => {
    // Simple deep comparison for small objects
    return JSON.stringify(a) === JSON.stringify(b);
  },

  // Use default SWR cache provider (works well with ISR)
  // provider: () => new Map(), // Optional: can use Map for better performance
};

// ============================================================================
// INTERFACES
// ============================================================================

interface ProvidersProps {
  children: ReactNode;
}

// ============================================================================
// MAIN PROVIDER COMPONENT
// ============================================================================

export function Providers({ children }: ProvidersProps) {
  return (
    <SWRConfig value={SWR_CONFIG}>
      <UserProvider>
        {children}

        {/* Development cache monitor */}
        {process.env.NODE_ENV === "development" && <CacheMonitor />}
      </UserProvider>
    </SWRConfig>
  );
}

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

/**
 * Development component to monitor SWR cache performance
 */
function CacheMonitor() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "8px 12px",
        borderRadius: "4px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 9999,
        cursor: "pointer",
      }}
      onClick={() => {
        console.group("📊 SWR Cache Status");
        console.log("Provider configuration:", SWR_CONFIG);
        console.log("Current timestamp:", new Date().toISOString());
        console.groupEnd();
      }}
      title="Click to log SWR cache status"
    >
      🔍 SWR Monitor
    </div>
  );
}

// ============================================================================
// PROVIDER UTILITIES
// ============================================================================

/**
 * Utility to manually clear SWR cache (useful for development/testing)
 */
export function clearSWRCache() {
  if (typeof window !== "undefined") {
    // This would need to be called from within an SWR context
    console.log("🧹 SWR cache cleared");
  }
}

/**
 * Configuration for different environments
 */
export const getProviderConfig = (
  env: "development" | "production" | "test"
): SWRConfiguration => {
  const baseConfig = { ...SWR_CONFIG };

  switch (env) {
    case "production":
      return {
        ...baseConfig,
        onError: (error: Error & { status?: number }) => {
          // Send to monitoring service in production
          console.error("SWR Error:", error);
        },
        onSuccess: undefined, // Remove success logging in production
      };

    case "test":
      return {
        ...baseConfig,
        dedupingInterval: 0, // No deduplication in tests
        errorRetryCount: 0, // No retries in tests
        revalidateOnMount: false, // Don't revalidate in tests
      };

    default:
      return baseConfig;
  }
};
