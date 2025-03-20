import { useState, useEffect, useCallback } from "react";
import { fetchPetListings, PetListingError } from "@/lib/api/pets";
import { PetListing } from "@/lib/types/pets";

interface UsePetListingsResult {
  petListings: PetListing[];
  isLoading: boolean;
  isRetrying: boolean;
  error: string | null;
  refreshPetListings: () => Promise<void>;
  totalCount: number;
  fetchPetListings: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage pet listings
 * @param searchParams URLSearchParams object for filtering results
 * @returns Object containing pet listings, loading state, error information, and refresh function
 */
export function usePetListings(
  searchParams: URLSearchParams
): UsePetListingsResult {
  const [petListings, setPetListings] = useState<PetListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPetListingsData = useCallback(
    async (isRetry = false) => {
      if (isRetry) {
        setIsRetrying(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await fetchPetListings(searchParams);
        setPetListings(response.items);
        setTotalCount(response.count);
      } catch (err) {
        const errorMessage =
          err instanceof PetListingError
            ? err.message
            : "Failed to load pet listings";
        setError(errorMessage);
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
    refreshPetListings,
    totalCount,
    fetchPetListings: fetchPetListingsData,
  };
}
