"use client";

import { PetListing } from "@/lib/types/pets";
import PetCard from "@/components/pets/pet-card";
import EmptyState from "@/components/pets/pet-list/empty-state";

interface PetListProps {
  petListings: PetListing[];
  className?: string;
}

/**
 * Component that renders a grid of pet listings or an empty state if none are found
 */
export default function PetList({ petListings, className = "" }: PetListProps) {
  if (!petListings.length) {
    return <EmptyState />;
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
      {petListings.map((listing) => (
        <PetCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
