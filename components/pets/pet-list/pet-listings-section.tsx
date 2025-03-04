"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import PetsFilter from "@/components/pets/pet-filter";
import PetList from "@/components/pets/pet-list";
import ErrorMessage from "@/components/ui/error-message";
import { PetCardSkeletons } from "@/components/ui/skeletons/pets";
import { usePetListings } from "@/hooks/use-pets-listings";

interface PetListingsSectionProps {
  className?: string;
}

/**
 * Content component that manages pet listings data and UI states
 */
const PetsContent = () => {
  const searchParams = useSearchParams();
  const { petListings, isLoading, isRetrying, error, refreshPetListings } =
    usePetListings(searchParams);

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
      ) : isLoading ? (
        <PetCardSkeletons />
      ) : (
        <PetList petListings={petListings} />
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
