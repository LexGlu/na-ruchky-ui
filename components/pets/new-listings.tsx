import { useEffect, useState, useRef } from "react";
import NewPetCard from "@/components/pets/new-pet-card";
import { NewPetCardSkeleton } from "@/components/ui/skeletons/pets";

import { fetchPetListings } from "@/lib/api/pets";
import { PetListing } from "@/lib/types/pets";

import {
  ArrowLeft,
  ArrowRight,
  SearchX,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function NewPetListings() {
  const [newPets, setNewPets] = useState<PetListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const fetchNewPets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const listings = await fetchPetListings({ sort: "-created_at" });
      setNewPets(listings.slice(0, 10));
    } catch (error) {
      console.error("Error fetching new pet listings:", error);
      setError("Не вдалося завантажити нові оголошення.");
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    fetchNewPets();
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      if (!scrollContainerRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScroll);
      checkScroll();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", checkScroll);
      }
    };
  }, [newPets]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    fetchNewPets();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container bg-white rounded-[20px] py-8 px-4 my-1">
        <h2 className="text-2xl text-black mb-6">Нові оголошення</h2>
        <div className="flex gap-2 overflow-hidden px-1">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-none snap-start">
              <NewPetCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container bg-white rounded-[20px] py-8 px-4 my-1">
        <h2 className="text-2xl text-black mb-6">Нові оголошення</h2>
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
      </div>
    );
  }

  // Empty state - no pets
  if (newPets.length === 0) {
    return (
      <div className="container bg-white rounded-[20px] py-8 px-4 my-1">
        <h2 className="text-2xl text-black mb-6">Нові оголошення</h2>
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
      </div>
    );
  }

  // Success state with pets
  return (
    <div className="container bg-white rounded-[20px] py-8 px-4 my-1 relative">
      <h2 className="text-2xl text-black mb-6">Нові оголошення</h2>

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
