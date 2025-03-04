"use client";

import NewPetCard from "@/components/pets/new-pet-card";
import { NewPetCardSkeleton } from "@/components/ui/skeletons/pets";
import {
  AlertCircle,
  RefreshCw,
  SearchX,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { useNewPetListings } from "@/hooks/use-new-pet-listings";

// Content component that handles data fetching and display
function NewPetListingsContent() {
  const {
    newPets,
    isLoading,
    error,
    isRetrying,
    handleRetry,
    scrollContainerRef,
    showLeftArrow,
    showRightArrow,
    scroll,
  } = useNewPetListings();

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="bg-red-50 rounded-full p-4 mb-4">
          <AlertCircle size={36} className="text-red-500" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-2">
          Помилка завантаження
        </h3>
        <p className="text-gray-500 max-w-md mb-6 text-center">{error}</p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          disabled={isRetrying}>
          {isRetrying ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Завантаження...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Спробувати ще раз
            </>
          )}
        </button>
      </div>
    );
  }

  // Empty state - no pets
  if (newPets.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <SearchX size={36} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-2">
          Наразі немає нових оголошень
        </h3>
        <p className="text-gray-500 max-w-md mb-2 text-center">
          Заходьте пізніше або перегляньте наші поточні оголошення
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return <NewPetListingsSkeleton />;
  }

  // Success state with pets
  return (
    <div className="relative">
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-4 top-1/2 z-10 bg-white/90 rounded-full p-2 shadow-md hover:bg-white transition-all"
          aria-label="Scroll left">
          <ArrowLeft size={24} className="text-black cursor-pointer" />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-4 top-1/2 z-10 bg-white/90 rounded-full p-2 shadow-md hover:bg-white transition-all"
          aria-label="Scroll right">
          <ArrowRight size={24} className="text-black cursor-pointer" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide snap-x px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {newPets.map((pet) => (
          <div key={pet.id} className="flex-none snap-start">
            <NewPetCard pet={pet} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading skeleton component
function NewPetListingsSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden px-1">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="flex-none snap-start">
          <NewPetCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export default function NewPetListings() {
  return (
    <div className="container bg-white rounded-[20px] py-8 px-4 my-1">
      <h2 className="text-2xl text-black mb-6">Нові оголошення</h2>
      <NewPetListingsContent />
    </div>
  );
}
