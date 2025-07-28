"use client";
import { Suspense, useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PetsFilter from "@/components/pets/pet-filter";
import PetList from "@/components/pets/pet-list";
import ErrorMessage from "@/components/ui/error-message";
import { PetCardSkeletons } from "@/components/ui/skeletons/pets";
import { usePetListings } from "@/hooks/use-pets-listings";
import { PetListing } from "@/lib/types/pets";

// ============================================================================
// INTERFACES
// ============================================================================

interface PetListingsSectionProps {
  className?: string;
  initialData?: {
    pets: PetListing[];
    totalCount: number;
    speciesCounts: {
      all: number;
      dog: number;
      cat: number;
    };
  };
}

interface PetsContentProps {
  initialData?: PetListingsSectionProps["initialData"];
}

// ============================================================================
// CONTENT COMPONENT
// ============================================================================

/**
 * Content component that manages pet listings data and UI states
 * Now supports both static initial data and client-side fetching
 */
const PetsContent = ({ initialData }: PetsContentProps) => {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const [allPetListings, setAllPetListings] = useState<PetListing[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isUsingStaticData, setIsUsingStaticData] = useState(!!initialData);
  const [staticDataFiltered, setStaticDataFiltered] = useState<PetListing[]>(
    []
  );
  const [staticTotalCount, setStaticTotalCount] = useState(
    initialData?.totalCount || 0
  );

  const ITEMS_PER_PAGE = 12;

  // Check if current search params represent the default state (no filters)
  const isDefaultState = useMemo(() => {
    const params = Array.from(searchParams.entries());
    // Remove pagination params for this check
    const nonPaginationParams = params.filter(
      ([key]) => key !== "offset" && key !== "limit"
    );
    return nonPaginationParams.length === 0;
  }, [searchParams]);

  // Build paginated params for API calls
  const paginatedParams = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("offset", (page * ITEMS_PER_PAGE).toString());
    params.set("limit", ITEMS_PER_PAGE.toString());
    return params;
  }, [searchParams, page, ITEMS_PER_PAGE]);

  // Hook for client-side data fetching (only used when not using static data)
  const {
    petListings,
    isLoading,
    isRetrying,
    error,
    refreshPetListings,
    totalCount,
  } = usePetListings(paginatedParams);

  // Filter static data based on search params
  useEffect(() => {
    if (initialData && isUsingStaticData && isDefaultState) {
      // For default state, use all static data
      setStaticDataFiltered(initialData.pets);
      setStaticTotalCount(initialData.totalCount);
    } else if (initialData && isUsingStaticData) {
      // Apply client-side filtering to static data
      const filtered = filterStaticData(initialData.pets, searchParams);
      setStaticDataFiltered(filtered);
      setStaticTotalCount(filtered.length);
    }
  }, [initialData, searchParams, isUsingStaticData, isDefaultState]);

  // Switch to client-side fetching when filters are applied (except default state)
  useEffect(() => {
    if (initialData && !isDefaultState && isUsingStaticData) {
      // Check if we need complex filtering that requires API
      const needsApiFiltering = hasComplexFiltering(searchParams);

      if (needsApiFiltering) {
        console.log(
          "🔄 Switching to client-side fetching due to complex filters"
        );
        setIsUsingStaticData(false);
        setPage(0);
        setAllPetListings([]);
      }
    }
  }, [searchParams, initialData, isDefaultState, isUsingStaticData]);

  // Reset pagination when search params change
  useEffect(() => {
    setPage(0);
    if (!isUsingStaticData) {
      setAllPetListings([]);
    }
  }, [searchParams, isUsingStaticData]);

  // Handle client-side data updates
  useEffect(() => {
    if (
      !isUsingStaticData &&
      !isLoading &&
      petListings &&
      petListings.length > 0
    ) {
      setAllPetListings((prev) => {
        if (page === 0) {
          return petListings;
        }
        // Append new unique listings
        const existingIds = new Set(prev.map((item) => item.id));
        const newListings = petListings.filter(
          (item) => !existingIds.has(item.id)
        );
        return [...prev, ...newListings];
      });

      if (isLoadingMore) {
        setIsLoadingMore(false);
      }
    } else if (
      !isUsingStaticData &&
      !isLoading &&
      page > 0 &&
      petListings.length === 0
    ) {
      setIsLoadingMore(false);
    }
  }, [isLoading, petListings, page, isLoadingMore, isUsingStaticData]);

  // Load more function
  const loadMore = useCallback(() => {
    if (isUsingStaticData) {
      // For static data, we show all results at once, so no "load more"
      return;
    }

    if (!isLoadingMore && !isLoading && allPetListings.length < totalCount) {
      setIsLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, [
    isLoadingMore,
    isLoading,
    totalCount,
    allPetListings.length,
    isUsingStaticData,
  ]);

  // Determine what data to show
  const displayedPets = isUsingStaticData ? staticDataFiltered : allPetListings;
  const displayedTotal = isUsingStaticData ? staticTotalCount : totalCount;
  const hasMoreListings = isUsingStaticData
    ? false
    : displayedTotal > allPetListings.length;

  // Handle pagination for static data
  const paginatedStaticPets = useMemo(() => {
    if (!isUsingStaticData) return displayedPets;

    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return staticDataFiltered.slice(0, endIndex);
  }, [
    staticDataFiltered,
    page,
    ITEMS_PER_PAGE,
    isUsingStaticData,
    displayedPets,
  ]);

  const finalDisplayedPets = isUsingStaticData
    ? paginatedStaticPets
    : displayedPets;

  // Loading state
  const isLoadingState = isUsingStaticData ? false : isLoading && page === 0;

  // Load more for static data
  const loadMoreStatic = useCallback(() => {
    if (
      isUsingStaticData &&
      (page + 1) * ITEMS_PER_PAGE < staticDataFiltered.length
    ) {
      setPage((prev) => prev + 1);
    }
  }, [isUsingStaticData, page, ITEMS_PER_PAGE, staticDataFiltered.length]);

  const finalLoadMore = isUsingStaticData ? loadMoreStatic : loadMore;
  const finalHasMore = isUsingStaticData
    ? (page + 1) * ITEMS_PER_PAGE < staticDataFiltered.length
    : hasMoreListings;

  const finalIsLoadingMore = isUsingStaticData
    ? false
    : isLoadingMore || (isLoading && page > 0);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <PetsFilter />

        {/* Data source indicator (development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {isUsingStaticData ? "Static Data" : "API Data"}
          </div>
        )}
      </div>

      <hr className="my-4 border-gray-200" />

      {error ? (
        <ErrorMessage
          error={error}
          onRetry={refreshPetListings}
          isRetrying={isRetrying}
        />
      ) : isLoadingState ? (
        <PetCardSkeletons />
      ) : (
        <PetList
          petListings={finalDisplayedPets}
          onLoadMore={finalLoadMore}
          hasMoreListings={finalHasMore}
          isLoadingMore={finalIsLoadingMore}
          itemsPerPage={ITEMS_PER_PAGE}
          totalAdopted={245} // Hardcoded for now
        />
      )}
    </>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Filter static data based on search parameters
 */
function filterStaticData(
  pets: PetListing[],
  searchParams: URLSearchParams
): PetListing[] {
  let filtered = [...pets];

  // Species filter
  const species = searchParams.get("species");
  if (species && species !== "all") {
    filtered = filtered.filter((pet) => pet.pet.species === species);
  }

  // Breed filter
  const breed = searchParams.get("breed");
  if (breed) {
    filtered = filtered.filter((pet) =>
      pet.pet.breed_name?.toLowerCase().includes(breed.toLowerCase())
    );
  }

  // Location filter
  const location = searchParams.get("location");
  if (location) {
    filtered = filtered.filter((pet) =>
      pet.pet.location?.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Sex filter
  const sex = searchParams.get("sex");
  if (sex && sex !== "all") {
    filtered = filtered.filter((pet) => pet.pet.sex === sex);
  }

  // Search query
  const search = searchParams.get("search");
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (pet) =>
        pet.title.toLowerCase().includes(searchLower) ||
        pet.pet.breed_name?.toLowerCase().includes(searchLower) ||
        pet.pet.short_description?.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

/**
 * Check if search params require complex API-side filtering
 */
function hasComplexFiltering(searchParams: URLSearchParams): boolean {
  // Define filters that require API-side processing
  const complexFilters = [
    "min_age",
    "max_age",
    "price_min",
    "price_max",
    "vaccinated",
    "hypoallergenic",
    "special_needs",
  ];

  return complexFilters.some((filter) => searchParams.has(filter));
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Container component for the pet listings section, wrapped in a Suspense boundary.
 * Now supports both static pre-rendered data and client-side fetching.
 */
export default function PetListingsSection({
  className = "",
  initialData,
}: PetListingsSectionProps) {
  return (
    <div
      className={`flex flex-col w-full py-8 px-4 md:px-6 bg-white rounded-[20px] shadow-sm ${className}`}
    >
      <Suspense fallback={<div>Loading pet listings...</div>}>
        <PetsContent initialData={initialData} />
      </Suspense>

      {/* Static data info in development */}
      {process.env.NODE_ENV === "development" && initialData && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Static Data Info</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>
              Pre-loaded pets: <strong>{initialData.pets.length}</strong>
            </p>
            <p>
              Total count: <strong>{initialData.totalCount}</strong>
            </p>
            <p>
              Species: Dogs ({initialData.speciesCounts.dog}), Cats (
              {initialData.speciesCounts.cat})
            </p>
            <p>
              <strong>Note:</strong> Switches to API fetching for complex
              filters
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
