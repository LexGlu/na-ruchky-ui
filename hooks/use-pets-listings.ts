import { useState, useEffect } from "react";
import { fetchPetListings, PetListingError } from "@/lib/api/pets";
import { PetListing } from "@/lib/types/pets";

/**
 * Custom hook to fetch and manage pet listings
 * @param searchParams URLSearchParams object for filtering results
 * @returns Object containing pet listings, loading state, and error information
 */
export function usePetListings(searchParams: URLSearchParams) {
  const [petListings, setPetListings] = useState<PetListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPetListings = async () => {
      setIsLoading(true);
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
        setPetListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPetListings();
  }, [searchParams]);

  return { petListings, isLoading, error };
}
