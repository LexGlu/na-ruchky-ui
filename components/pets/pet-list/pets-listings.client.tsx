"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PetsFilter from "@/components/pets/pet-filter";
import PetList from "@/components/pets/pet-list";
import ErrorMessage from "@/components/ui/error-message";
import { PetCardSkeletons } from "@/components/ui/skeletons/pets";
import { usePetListings } from "@/hooks/use-pets-listings";
import { PetListing } from "@/lib/types/pets";
import { CachedPetsData } from "@/lib/cache/pets.cache";

// ============================================================================
// INTERFACES
// ============================================================================

interface PetsListingsClientProps {
  staticData: CachedPetsData;
  itemsPerPage?: number;
  enableApiFiltering?: boolean;
}

// ============================================================================
// FILTERING STRATEGIES
// ============================================================================

/**
 * Determines which filters require API calls vs client-side filtering
 */
const getFilteringStrategy = (searchParams: URLSearchParams) => {
  const complexFilters = [
    "min_age",
    "max_age",
    "price_min",
    "price_max",
    "is_vaccinated",
    "is_hypoallergenic",
    "special_needs",
    "created_after",
    "created_before",
  ];

  const hasComplexFilters = complexFilters.some((filter) =>
    searchParams.has(filter)
  );
  const hasSearch = searchParams.has("search");
  const totalParams = Array.from(searchParams.keys()).length;

  // Use client-side for simple filters, API for complex ones
  return {
    useClientSide: !hasComplexFilters && totalParams <= 3,
    complexity: hasComplexFilters ? "complex" : hasSearch ? "medium" : "simple",
  };
};

/**
 * Optimized client-side filtering function
 */
const filterPetsClientSide = (
  pets: PetListing[],
  params: URLSearchParams
): PetListing[] => {
  if (!params.toString()) return pets;

  return pets.filter((pet) => {
    // Species filter
    const species = params.get("species");
    if (species && species !== "all" && pet.pet.species !== species) {
      return false;
    }

    // Breed filter
    const breed = params.get("breed");
    if (
      breed &&
      !pet.pet.breed_name?.toLowerCase().includes(breed.toLowerCase())
    ) {
      return false;
    }

    // Location filter
    const location = params.get("location");
    if (
      location &&
      !pet.pet.location?.toLowerCase().includes(location.toLowerCase())
    ) {
      return false;
    }

    // Sex filter
    const sex = params.get("sex");
    if (sex && sex !== "all" && pet.pet.sex !== sex) {
      return false;
    }

    // Search query (title, breed, description, location)
    const search = params.get("search");
    if (search) {
      const searchLower = search.toLowerCase();
      const searchableFields = [
        pet.title,
        pet.pet.breed_name,
        pet.pet.short_description,
        pet.pet.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableFields.includes(searchLower)) {
        return false;
      }
    }

    // Age group filter (simplified client-side version)
    const ageGroup = params.get("age_group");
    if (ageGroup && pet.pet.birth_date) {
      const birthDate = new Date(pet.pet.birth_date);
      const ageInMonths = Math.floor(
        (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      );

      const ageRanges = {
        puppy_kitten: [0, 6],
        young: [6, 24],
        adult: [24, 84],
        senior: [84, Infinity],
      };

      const [min, max] = ageRanges[ageGroup as keyof typeof ageRanges] || [
        0,
        Infinity,
      ];
      if (ageInMonths < min || ageInMonths > max) {
        return false;
      }
    }

    return true;
  });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PetsListingsClient({
  staticData,
  itemsPerPage = 12,
  enableApiFiltering = true,
}: PetsListingsClientProps) {
  const searchParams = useSearchParams();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [displayedPets, setDisplayedPets] = useState<PetListing[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ============================================================================
  // FILTERING STRATEGY
  // ============================================================================

  const filteringStrategy = useMemo(
    () => getFilteringStrategy(searchParams),
    [searchParams]
  );

  // Client-side filtered pets (always computed for instant feedback)
  const clientFilteredPets = useMemo(
    () => filterPetsClientSide(staticData.pets, searchParams),
    [staticData.pets, searchParams]
  );

  // ============================================================================
  // API FALLBACK (only for complex filters)
  // ============================================================================

  const shouldUseApi = !filteringStrategy.useClientSide && enableApiFiltering;

  const apiParams = useMemo(() => {
    if (!shouldUseApi) return new URLSearchParams();

    const params = new URLSearchParams(searchParams.toString());
    params.set("offset", (currentPage * itemsPerPage).toString());
    params.set("limit", itemsPerPage.toString());
    return params;
  }, [shouldUseApi, searchParams, currentPage, itemsPerPage]);

  const {
    petListings: apiPets,
    isLoading: apiLoading,
    error: apiError,
    refreshPetListings,
    totalCount: apiTotalCount,
  } = usePetListings(shouldUseApi ? apiParams : new URLSearchParams());

  // ============================================================================
  // DISPLAY LOGIC
  // ============================================================================

  // Paginate client-side filtered pets
  const paginatedClientPets = useMemo(
    () => clientFilteredPets.slice(0, (currentPage + 1) * itemsPerPage),
    [clientFilteredPets, currentPage, itemsPerPage]
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(0);
    setDisplayedPets([]);
    setIsLoadingMore(false);
  }, [searchParams]);

  // Update displayed pets based on strategy
  useEffect(() => {
    if (shouldUseApi) {
      // API mode: append new results
      if (currentPage === 0) {
        setDisplayedPets(apiPets || []);
      } else if (apiPets) {
        setDisplayedPets((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPets = apiPets.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newPets];
        });
      }
    } else {
      // Client-side mode: show paginated results
      setDisplayedPets(paginatedClientPets);
    }
    setIsLoadingMore(false);
  }, [shouldUseApi, apiPets, paginatedClientPets, currentPage]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore) return;

    const hasMore = shouldUseApi
      ? displayedPets.length < apiTotalCount
      : displayedPets.length < clientFilteredPets.length;

    if (!hasMore) return;

    setIsLoadingMore(true);
    setCurrentPage((prev) => prev + 1);
  }, [
    isLoadingMore,
    shouldUseApi,
    displayedPets.length,
    apiTotalCount,
    clientFilteredPets.length,
  ]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasMoreItems = shouldUseApi
    ? displayedPets.length < apiTotalCount
    : displayedPets.length < clientFilteredPets.length;

  const isInitialLoading = shouldUseApi && apiLoading && currentPage === 0;
  const showLoadMoreSpinner =
    isLoadingMore || (shouldUseApi && apiLoading && currentPage > 0);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Filter Section */}
      <div className="flex justify-between items-center mb-4">
        <PetsFilter />
      </div>

      {/* Divider */}
      <div className="mb-4 pb-4 border-b border-gray-200"></div>

      {/* Content */}
      {apiError ? (
        <ErrorMessage
          error={apiError}
          onRetry={refreshPetListings}
          isRetrying={apiLoading}
        />
      ) : isInitialLoading ? (
        <PetCardSkeletons />
      ) : (
        <PetList
          petListings={displayedPets}
          onLoadMore={handleLoadMore}
          hasMoreListings={hasMoreItems}
          isLoadingMore={showLoadMoreSpinner}
          itemsPerPage={itemsPerPage}
          totalAdopted={245}
        />
      )}
    </>
  );
}
