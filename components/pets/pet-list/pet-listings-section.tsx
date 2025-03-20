"use client";
import { Suspense, useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PetsFilter from "@/components/pets/pet-filter";
import PetList from "@/components/pets/pet-list";
import ErrorMessage from "@/components/ui/error-message";
import { PetCardSkeletons } from "@/components/ui/skeletons/pets";
import { usePetListings } from "@/hooks/use-pets-listings";
import { PetListing } from "@/lib/types/pets";

interface PetListingsSectionProps {
  className?: string;
}

/**
 * Content component that manages pet listings data and UI states
 */
const PetsContent = () => {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const [allPetListings, setAllPetListings] = useState<PetListing[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const ITEMS_PER_PAGE = 12;

  const paginatedParams = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("offset", (page * ITEMS_PER_PAGE).toString());
    params.set("limit", ITEMS_PER_PAGE.toString());
    return params;
  }, [searchParams, page, ITEMS_PER_PAGE]);

  const {
    petListings,
    isLoading,
    isRetrying,
    error,
    refreshPetListings,
    totalCount,
  } = usePetListings(paginatedParams);

  useEffect(() => {
    // Reset pagination when search params change (except offset/limit)
    const baseParams = new URLSearchParams(searchParams.toString());
    baseParams.delete("offset");
    baseParams.delete("limit");

    // Store the current base params string in a ref to detect changes
    setPage(0);
    setAllPetListings([]);
  }, [searchParams]);

  // Update allPetListings when new petListings are loaded
  useEffect(() => {
    if (!isLoading && petListings && petListings.length > 0) {
      setAllPetListings((prev) => {
        // If this is the first page, replace all listings
        if (page === 0) {
          return petListings;
        }

        // Otherwise append new unique listings to existing ones
        const existingIds = new Set(prev.map((item) => item.id));
        const newListings = petListings.filter(
          (item) => !existingIds.has(item.id)
        );
        return [...prev, ...newListings];
      });

      if (isLoadingMore) {
        setIsLoadingMore(false);
      }
    } else if (!isLoading && page > 0 && petListings.length === 0) {
      setIsLoadingMore(false);
    }
  }, [isLoading, petListings, page, isLoadingMore]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && !isLoading && allPetListings.length < totalCount) {
      setIsLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, [isLoadingMore, isLoading, totalCount, allPetListings.length]);

  const hasMoreListings = totalCount > allPetListings.length;

  return (
    <>
      <PetsFilter />
      <hr className="my-4 border-gray-200" />
      {error ? (
        <ErrorMessage
          error={error}
          onRetry={refreshPetListings}
          isRetrying={isRetrying}
        />
      ) : isLoading && page === 0 ? (
        <PetCardSkeletons />
      ) : (
        <PetList
          petListings={allPetListings}
          onLoadMore={loadMore}
          hasMoreListings={hasMoreListings}
          isLoadingMore={isLoadingMore || (isLoading && page > 0)}
          itemsPerPage={ITEMS_PER_PAGE}
          totalAdopted={245} // Hardcoded for now
        />
      )}
    </>
  );
};

/**
 * Container component for the pet listings section, wrapped in a Suspense boundary.
 */
export default function PetListingsSection({
  className = "",
}: PetListingsSectionProps) {
  return (
    <div
      className={`flex flex-col w-full py-8 px-4 md:px-6 bg-white rounded-[20px] shadow-sm ${className}`}>
      <Suspense fallback={<div>Loading pet listings...</div>}>
        <PetsContent />
      </Suspense>
    </div>
  );
}
