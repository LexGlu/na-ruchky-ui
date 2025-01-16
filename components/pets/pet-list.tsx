"use client";

import { PetListing } from "@/lib/types/pets";
import PetCard from "@/components/pets/pet-card";

interface PetListProps {
  petListings: PetListing[];
}

export default function PetList({ petListings }: PetListProps) {
  if (!petListings.length) {
    return <p className="text-gray-500">No pets found.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {petListings.map((listing) => (
        <PetCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
