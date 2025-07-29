"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, SearchX, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import NewPetCard from "@/components/pets/new-pet-card";
import { PetListing } from "@/lib/types/pets";

interface NewListingsClientProps {
  pets: PetListing[];
}

export function NewListingsClient({ pets }: NewListingsClientProps) {
  const t = useTranslations("NewListings");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll position and update arrow visibility
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Initialize scroll position check
  useEffect(() => {
    checkScrollPosition();

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      return () => container.removeEventListener("scroll", checkScrollPosition);
    }
  }, [pets]);

  // Handle resize to update arrow visibility
  useEffect(() => {
    const handleResize = () => checkScrollPosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const cardWidth = 280; // Approximate card width + gap
    const scrollAmount = cardWidth * 2; // Scroll by 2 cards

    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Empty state
  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
        <div className="bg-white rounded-full p-6 mb-4 shadow-sm">
          <SearchX size={36} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {t("noListings")}
        </h3>
        <p className="text-gray-500 max-w-md text-center leading-relaxed">
          {t("noListingsSub")}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
          <Heart size={16} />
          <span>{t("updatesEvery")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 
                     bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg border border-gray-200
                     hover:bg-white hover:shadow-xl transition-all duration-200
                     opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={t("scrollLeft")}
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 
                     bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg border border-gray-200
                     hover:bg-white hover:shadow-xl transition-all duration-200 
                     opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={t("scrollRight")}
        >
          <ArrowRight size={20} className="text-gray-700" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {pets.map((pet, index) => (
          <div
            key={pet.id}
            className="flex-none snap-start"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <NewPetCard pet={pet} />
          </div>
        ))}
      </div>

      {/* Gradient Overlays for Visual Cues */}
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      )}
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
      )}

      {/* Bottom fade for scrollbar area */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}
