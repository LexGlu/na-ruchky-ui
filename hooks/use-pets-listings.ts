import { useState, useEffect, useCallback } from "react";
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

interface UsePetListingsResult {
  petListings: PetListing[];
  isLoading: boolean;
  isRetrying: boolean;
  error: string | null;
  errorType:
    | "validation"
    | "network"
    | "unauthorized"
    | "server"
    | "unknown"
    | null;
  fieldErrors: Record<string, string[]>;
  refreshPetListings: () => Promise<void>;
  totalCount: number;
  fetchPetListings: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage pet listings with enhanced error handling
 * @param searchParams URLSearchParams object for filtering results
 * @returns Object containing pet listings, loading state, detailed error information, and refresh function
 */
export function usePetListings(
  searchParams: URLSearchParams
): UsePetListingsResult {
  const [petListings, setPetListings] = useState<PetListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<
    "validation" | "network" | "unauthorized" | "server" | "unknown" | null
  >(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [totalCount, setTotalCount] = useState(0);

  const fetchPetListingsData = useCallback(
    async (isRetry = false) => {
      if (isRetry) {
        setIsRetrying(true);
      } else {
        setIsLoading(true);
      }

      // Clear previous errors
      setError(null);
      setErrorType(null);
      setFieldErrors({});

      try {
        const response = await fetchPetListings(searchParams);
        setPetListings(response.items);
        setTotalCount(response.count);
      } catch (err) {
        // Enhanced error handling with specific error types
        if (err instanceof ValidationError) {
          setError(err.message);
          setErrorType("validation");
          setFieldErrors(err.fieldErrors);
        } else if (err instanceof NetworkError) {
          setError(
            "Network connection failed. Please check your internet connection."
          );
          setErrorType("network");
        } else if (err instanceof UnauthorizedError) {
          setError("Please log in to view pet listings.");
          setErrorType("unauthorized");
        } else if (err instanceof NotFoundError) {
          setError("No pet listings found matching your criteria.");
          setErrorType("unknown");
          // For NotFound in listings, we might want to show empty state instead of error
          setPetListings([]);
          setTotalCount(0);
          setError(null); // Clear error since this is more of an empty state
        } else if (err instanceof ServerError) {
          setError("Server error occurred. Please try again later.");
          setErrorType("server");
        } else if (err instanceof BaseApiError) {
          // Catch any other API errors
          setError(err.message);
          setErrorType("server");
        } else {
          // Fallback for unexpected errors
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load pet listings";
          setError(errorMessage);
          setErrorType("unknown");
        }
      } finally {
        setIsLoading(false);
        setIsRetrying(false);
      }
    },
    [searchParams]
  );

  useEffect(() => {
    fetchPetListingsData();
  }, [fetchPetListingsData]);

  const refreshPetListings = useCallback(() => {
    return fetchPetListingsData(true);
  }, [fetchPetListingsData]);

  return {
    petListings,
    isLoading,
    isRetrying,
    error,
    errorType,
    fieldErrors,
    refreshPetListings,
    totalCount,
    fetchPetListings: fetchPetListingsData,
  };
}

// ============================================================================
// ENHANCED HOOK VARIATIONS
// ============================================================================

/**
 * Simplified version that auto-retries on network errors
 */
export function usePetListingsWithRetry(
  searchParams: URLSearchParams,
  maxRetries: number = 3
): UsePetListingsResult & { retryCount: number } {
  const [retryCount, setRetryCount] = useState(0);
  const baseResult = usePetListings(searchParams);

  // Auto-retry on network errors
  useEffect(() => {
    if (baseResult.errorType === "network" && retryCount < maxRetries) {
      const retryTimeout = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        baseResult.refreshPetListings();
      }, 2000 * (retryCount + 1)); // Exponential backoff

      return () => clearTimeout(retryTimeout);
    }
  }, [baseResult.errorType, retryCount, maxRetries, baseResult]);

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
 * Hook with pagination support
 */
interface UsePaginatedPetListingsResult
  extends Omit<UsePetListingsResult, "fetchPetListings"> {
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function usePaginatedPetListings(
  baseSearchParams: URLSearchParams,
  initialPageSize: number = 20
): UsePaginatedPetListingsResult {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // Combine base params with pagination
  const searchParams = new URLSearchParams(baseSearchParams);
  searchParams.set("page", page.toString());
  searchParams.set("page_size", pageSize.toString());

  const { fetchPetListings, ...baseResult } = usePetListings(searchParams);

  const hasNextPage = page * pageSize < baseResult.totalCount;
  const hasPreviousPage = page > 1;

  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const goToPreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  const goToPage = useCallback(
    (newPage: number) => {
      const maxPage = Math.ceil(baseResult.totalCount / pageSize);
      if (newPage >= 1 && newPage <= maxPage) {
        setPage(newPage);
      }
    },
    [baseResult.totalCount, pageSize]
  );

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1); // Reset to first page when changing page size
  }, []);

  return {
    ...baseResult,
    page,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    setPageSize,
  };
}
