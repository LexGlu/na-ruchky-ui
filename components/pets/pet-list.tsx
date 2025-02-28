"use client";

import { PetListing } from "@/lib/types/pets";
import { SearchX } from "lucide-react";
import PetCard from "@/components/pets/pet-card";

interface PetListProps {
  petListings: PetListing[];
}

export default function PetList({ petListings }: PetListProps) {
  if (!petListings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[401px]">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <SearchX size={48} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-2">
          Спеціалістів не знайдено
        </h3>
        <p className="text-gray-500 max-w-md mb-6">
          Спробуйте змінити параметри фільтрів
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {petListings.map((listing) => (
        <PetCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
