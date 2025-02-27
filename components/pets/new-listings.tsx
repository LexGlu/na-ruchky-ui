import { useEffect, useState, useRef } from "react";
import NewPetCard from "@/components/pets/new-pet-card";
import { NewPetCardSkeleton } from "@/components/ui/skeletons/pets";

import { fetchPetListings } from "@/lib/api/pets";
import { PetListing } from "@/lib/types/pets";

import { ArrowLeft, ArrowRight } from "lucide-react";

export default function NewPetListings() {
  const [newPets, setNewPets] = useState<PetListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    async function fetchNewPets() {
      try {
        const listings = await fetchPetListings({ sort: "-created_at" });
        setNewPets(listings.slice(0, 10));
      } catch (error) {
        console.error("Error fetching new pet listings:", error);
      } finally {
        setIsLoading(false);
      }
    }
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
