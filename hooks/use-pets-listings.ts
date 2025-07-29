import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { fetchPetListings } from "@/lib/api/pets";
import {
  BaseApiError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  NetworkError,
  ServerError,
} from "@/lib/api/errors";
import { PetListing } from "@/lib/types/pets";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ErrorType =
  | "validation"
  | "network"
  | "unauthorized"
  | "server"
  | "unknown"
  | null;

export interface UsePetListingsResult {
  petListings: PetListing[];
  isLoading: boolean;
  isRetrying: boolean;
  error: string | null;
  errorType: ErrorType;
  fieldErrors: Record<string, string[]>;
  refreshPetListings: () => Promise<void>;
  totalCount: number;
  // Performance metrics
  performance: {
    lastFetchTime: number;
    requestCount: number;
    avgResponseTime: number;
  };
}

interface CachedPetData {
  data: PetListing[];
  totalCount: number;
  params: string;
  timestamp: number;
  ttl: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Cache settings
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes client-side cache
  MAX_CACHE_SIZE: 10, // Maximum cached queries

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 2000, 4000], // Exponential backoff

  // Request throttling
  MIN_REQUEST_INTERVAL: 500, // Minimum time between requests
} as const;

// ============================================================================
// CACHE MANAGER
// ============================================================================

class PetListingsCache {
  private cache = new Map<string, CachedPetData>();
  private accessOrder: string[] = [];

  get(key: string): CachedPetData | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check TTL
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.delete(key);
      return null;
    }

    // Update access order (LRU)
    this.updateAccessOrder(key);
    return cached;
  }

  set(key: string, value: Omit<CachedPetData, "params">): void {
    // Remove oldest if at capacity
    if (this.cache.size >= CONFIG.MAX_CACHE_SIZE && !this.cache.has(key)) {
      const oldest = this.accessOrder[0];
      if (oldest) {
        this.delete(oldest);
      }
    }

    this.cache.set(key, { ...value, params: key });
    this.updateAccessOrder(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    this.accessOrder.push(key);
  }

  getStats() {
    return {
      size: this.cache.size,
      hitRate: 0, // Could be implemented with counters
      oldestEntry: this.accessOrder[0],
      newestEntry: this.accessOrder[this.accessOrder.length - 1],
    };
  }
}

// Global cache instance
const globalCache = new PetListingsCache();

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

function categorizeError(error: unknown): {
  message: string;
  type: ErrorType;
  fieldErrors: Record<string, string[]>;
} {
  if (error instanceof ValidationError) {
    return {
      message: error.message,
      type: "validation",
      fieldErrors: error.fieldErrors,
    };
  }

  if (error instanceof NetworkError) {
    return {
      message:
        "Network connection failed. Please check your internet connection and try again.",
      type: "network",
      fieldErrors: {},
    };
  }

  if (error instanceof UnauthorizedError) {
    return {
      message: "Authentication required. Please log in to view pet listings.",
      type: "unauthorized",
      fieldErrors: {},
    };
  }

  if (error instanceof NotFoundError) {
    return {
      message: "No pets found matching your search criteria.",
      type: "unknown",
      fieldErrors: {},
    };
  }

  if (error instanceof ServerError) {
    return {
      message:
        "Server temporarily unavailable. Please try again in a few moments.",
      type: "server",
      fieldErrors: {},
    };
  }

  if (error instanceof BaseApiError) {
    return {
      message: error.message,
      type: "server",
      fieldErrors: {},
    };
  }

  // Fallback for unexpected errors
  const message =
    error instanceof Error
      ? error.message
      : "An unexpected error occurred while loading pet listings";

  return {
    message,
    type: "unknown",
    fieldErrors: {},
  };
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function usePetListings(
  searchParams: URLSearchParams
): UsePetListingsResult {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [petListings, setPetListings] = useState<PetListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [totalCount, setTotalCount] = useState(0);

  // Performance tracking
  const [performance, setPerformance] = useState({
    lastFetchTime: 0,
    requestCount: 0,
    avgResponseTime: 0,
  });

  // Refs for request management
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestTimeRef = useRef(0);
  const retryCountRef = useRef(0);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const cacheKey = useMemo(() => searchParams.toString(), [searchParams]);

  const shouldSkipRequest = useMemo(() => {
    // Skip if no parameters (empty state)
    return !searchParams.toString();
  }, [searchParams]);

  // ============================================================================
  // FETCH FUNCTION WITH CACHING AND RETRY
  // ============================================================================

  const fetchPetListingsWithCache = useCallback(
    async (params: URLSearchParams, isRetryAttempt = false): Promise<void> => {
      // Check if should skip request inside the function
      if (!params.toString()) {
        setPetListings([]);
        setTotalCount(0);
        return;
      }

      const requestKey = params.toString();
      const startTime = Date.now();

      // Check cache first
      const cached = globalCache.get(requestKey);
      if (cached && !isRetryAttempt) {
        console.log("📦 Using cached pets data");
        setPetListings(cached.data);
        setTotalCount(cached.totalCount);
        return;
      }

      // Request throttling
      const timeSinceLastRequest = Date.now() - lastRequestTimeRef.current;
      if (timeSinceLastRequest < CONFIG.MIN_REQUEST_INTERVAL) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            CONFIG.MIN_REQUEST_INTERVAL - timeSinceLastRequest
          )
        );
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        console.log(`🔍 Fetching pets with params: ${params.toString()}`);

        const response = await fetchPetListings(params);

        // Update data
        setPetListings(response.items);
        setTotalCount(response.count);

        // Cache the result
        globalCache.set(requestKey, {
          data: response.items,
          totalCount: response.count,
          timestamp: Date.now(),
          ttl: CONFIG.CACHE_TTL,
        });

        // Update performance metrics
        const responseTime = Date.now() - startTime;
        setPerformance((prev) => ({
          lastFetchTime: responseTime,
          requestCount: prev.requestCount + 1,
          avgResponseTime:
            (prev.avgResponseTime * prev.requestCount + responseTime) /
            (prev.requestCount + 1),
        }));

        // Reset error state
        setError(null);
        setErrorType(null);
        setFieldErrors({});
        retryCountRef.current = 0;

        lastRequestTimeRef.current = Date.now();
      } catch (fetchError) {
        // Ignore aborted requests
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        const {
          message,
          type,
          fieldErrors: errors,
        } = categorizeError(fetchError);

        // Handle NotFound as empty state rather than error
        if (type === "unknown" && message.includes("No pets found")) {
          setPetListings([]);
          setTotalCount(0);
          setError(null);
          setErrorType(null);
          setFieldErrors({});
          return;
        }

        // Set error state
        setError(message);
        setErrorType(type);
        setFieldErrors(errors);

        console.error("❌ Pets fetch error:", {
          error: fetchError,
          params: params.toString(),
          type,
          retryCount: retryCountRef.current,
        });
      }
    },
    [] // Remove shouldSkipRequest dependency to stabilize the function
  );

  // ============================================================================
  // RETRY LOGIC
  // ============================================================================

  const retryWithBackoff = useCallback(async () => {
    if (retryCountRef.current >= CONFIG.MAX_RETRIES) {
      console.log("❌ Max retries reached");
      return;
    }

    const delay =
      CONFIG.RETRY_DELAYS[retryCountRef.current] ||
      CONFIG.RETRY_DELAYS[CONFIG.RETRY_DELAYS.length - 1];
    retryCountRef.current++;

    console.log(
      `🔄 Retrying request (${retryCountRef.current}/${CONFIG.MAX_RETRIES}) in ${delay}ms`
    );
    setIsRetrying(true);

    await new Promise((resolve) => setTimeout(resolve, delay));
    await fetchPetListingsWithCache(searchParams, true);
    setIsRetrying(false);
  }, [cacheKey]); // Use cacheKey instead of searchParams and fetchPetListingsWithCache

  // ============================================================================
  // MAIN FETCH EFFECT
  // ============================================================================

  useEffect(() => {
    if (shouldSkipRequest) {
      setPetListings([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    retryCountRef.current = 0;

    fetchPetListingsWithCache(searchParams).finally(() => {
      setIsLoading(false);
    });

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cacheKey, shouldSkipRequest]); // Use cacheKey instead of searchParams and remove fetchPetListingsWithCache

  // ============================================================================
  // AUTO-RETRY FOR NETWORK ERRORS
  // ============================================================================

  useEffect(() => {
    if (errorType === "network" && retryCountRef.current < CONFIG.MAX_RETRIES) {
      const timeoutId = setTimeout(() => {
        retryCountRef.current++;
        fetchPetListingsWithCache(searchParams, true);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [errorType]); // Remove retryWithBackoff from dependencies

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  const refreshPetListings = useCallback(async () => {
    if (shouldSkipRequest) return;

    // Clear cache for this request
    globalCache.delete(cacheKey);
    retryCountRef.current = 0;

    setIsRetrying(true);
    await fetchPetListingsWithCache(searchParams, true);
    setIsRetrying(false);
  }, [cacheKey, shouldSkipRequest]); // Remove searchParams and fetchPetListingsWithCache

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ============================================================================
  // RETURN API
  // ============================================================================

  return {
    petListings,
    isLoading,
    isRetrying,
    error,
    errorType,
    fieldErrors,
    refreshPetListings,
    totalCount,
    performance,
  };
}

// ============================================================================
// ENHANCED HOOK VARIANTS
// ============================================================================

/**
 * Hook with automatic retry on network errors
 */
export function usePetListingsWithAutoRetry(
  searchParams: URLSearchParams,
  maxRetries: number = CONFIG.MAX_RETRIES
): UsePetListingsResult & { retryCount: number } {
  const baseResult = usePetListings(searchParams);
  const [retryCount, setRetryCount] = useState(0);

  // Auto-retry logic with exponential backoff
  useEffect(() => {
    if (baseResult.errorType === "network" && retryCount < maxRetries) {
      const delay =
        CONFIG.RETRY_DELAYS[
          Math.min(retryCount, CONFIG.RETRY_DELAYS.length - 1)
        ];

      const timeoutId = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        baseResult.refreshPetListings();
      }, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [baseResult.errorType, retryCount, maxRetries]); // Remove baseResult.refreshPetListings from dependencies

  // Reset retry count on successful fetch
  useEffect(() => {
    if (!baseResult.error && !baseResult.isLoading) {
      setRetryCount(0);
    }
  }, [baseResult.error, baseResult.isLoading]);

  return {
    ...baseResult,
    retryCount,
  };
}

/**
 * Hook optimized for pagination
 */
export function usePaginatedPetListings(
  baseParams: URLSearchParams,
  pageSize: number = 20
) {
  const [page, setPage] = useState(1);
  const [allPets, setAllPets] = useState<PetListing[]>([]);

  const paginatedParams = useMemo(() => {
    const params = new URLSearchParams(baseParams.toString());
    params.set("limit", pageSize.toString());
    params.set("offset", ((page - 1) * pageSize).toString());
    return params;
  }, [baseParams, page, pageSize]);

  const baseResult = usePetListings(paginatedParams);

  // Accumulate pets for infinite scroll
  useEffect(() => {
    if (page === 1) {
      setAllPets(baseResult.petListings);
    } else if (baseResult.petListings.length > 0) {
      setAllPets((prev) => [...prev, ...baseResult.petListings]);
    }
  }, [baseResult.petListings, page]);

  // Reset when base params change
  useEffect(() => {
    setPage(1);
    setAllPets([]);
  }, [baseParams.toString()]);

  const loadMore = useCallback(() => {
    if (allPets.length < baseResult.totalCount) {
      setPage((prev) => prev + 1);
    }
  }, [allPets.length, baseResult.totalCount]);

  return {
    ...baseResult,
    petListings: allPets,
    currentPage: page,
    hasMore: allPets.length < baseResult.totalCount,
    loadMore,
  };
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

export const PetListingsCacheUtils = {
  clearCache: () => globalCache.clear(),
  getCacheStats: () => globalCache.getStats(),
  getCacheSize: () => globalCache.getStats().size,
};
