import { useState, useEffect, useCallback } from "react";
import { fetchPetListings, PetListingError } from "@/lib/api/pets";
import { PetListing } from "@/lib/types/pets";

/**
 * Custom hook to fetch and manage pet listings
 * @param searchParams URLSearchParams object for filtering results
 * @returns Object containing pet listings, loading state, error information, and refresh function
 */
export function usePetListings(searchParams: URLSearchParams) {
  const [petListings, setPetListings] = useState<PetListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPetListings = useCallback(
    async (isRetry = false) => {
      if (isRetry) {
        setIsRetrying(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const listings = await fetchPetListings(searchParams);
        setPetListings(listings);
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
    loadPetListings();
  }, [loadPetListings]);

  const refreshPetListings = useCallback(() => {
    return loadPetListings(true);
  }, [loadPetListings]);

  return {
    petListings,
    isLoading,
    isRetrying,
    error,
    refreshPetListings,
  };
}
