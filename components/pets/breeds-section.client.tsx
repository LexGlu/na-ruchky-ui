"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { useTranslations } from "next-intl";

import { Breed } from "@/lib/types/breeds";
import { getImageUrl } from "@/lib/utils/get-image-url";
import { Species } from "@/lib/types/pets";

interface BreedsClientProps {
  allBreeds: Breed[];
  speciesCounts: {
    all: number;
    dog: number;
    cat: number;
  };
}

export function BreedsClient({ allBreeds, speciesCounts }: BreedsClientProps) {
  const t = useTranslations("BreedsSection");
  const [activeSpecies, setActiveSpecies] = useState<Species | "all">("all");
  const [hoveredBreedId, setHoveredBreedId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter breeds based on active species and limit to 6 for display
  const displayedBreeds = useMemo(() => {
    const filtered =
      activeSpecies === "all"
        ? allBreeds
        : allBreeds.filter((breed) => breed.species === activeSpecies);

    return filtered.slice(0, 6);
  }, [allBreeds, activeSpecies]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    // Scroll by approx 2.5 card widths for better UX with larger cards
    const cardWidth = 215 + 16;
    const scrollAmount = cardWidth * 2.5;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") scroll("left");
    if (e.key === "ArrowRight") scroll("right");
  };

  const handleFilterClick = (species: Species | "all") => {
    if (activeSpecies === species && species !== "all") {
      setActiveSpecies("all");
    } else {
      setActiveSpecies(species);
    }

    // Reset scroll position when filter changes
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  };

  const getFilterButtonStyle = (
    filterSpecies: Species | "all",
    count: number
  ) => {
    const isActive = activeSpecies === filterSpecies;
    let buttonText = "";
    if (filterSpecies === "dog") buttonText = t("dogs");
    else if (filterSpecies === "cat") buttonText = t("cats");

    return (
      <button
        onClick={() => handleFilterClick(filterSpecies as Species)}
        className={`px-5 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-opacity-75 min-w-[150px] sm:min-w-[180px] md:min-w-[200px] border cursor-pointer
                    ${
                      isActive
                        ? "bg-black text-white border-black shadow-md"
                        : "bg-white text-black border-gray-300 hover:border-black hover:shadow-sm"
                    }`}
        aria-pressed={isActive}
      >
        {buttonText} ({count})
      </button>
    );
  };

  return (
    <section className="bg-white rounded-2xl md:rounded-[24px] p-2 sm:p-4 md:p-6 lg:p-8 w-full max-w-[1432px] mx-auto">
      <div className="w-full max-w-[1336px] mx-auto flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-6 lg:gap-10">
          <div className="lg:max-w-[500px] xl:max-w-[530px]">
            <h2
              className="font-geologica font-semibold text-4xl sm:text-5xl leading-tight
                         md:text-6xl md:leading-tight 
                         lg:text-[80px] lg:leading-[1em] text-black"
            >
              {t("title")}
            </h2>
          </div>

          <div className="flex flex-col gap-6 lg:gap-8 lg:max-w-[664px] lg:pt-2 flex-grow">
            <p className="font-geologica text-sm sm:text-base md:text-lg leading-relaxed text-black/80">
              {t("description")}
            </p>
            <div className="flex flex-row justify-start items-center gap-3 sm:gap-4">
              {getFilterButtonStyle("dog", speciesCounts.dog)}
              {getFilterButtonStyle("cat", speciesCounts.cat)}
            </div>
          </div>
        </div>

        <div className="relative">
          {displayedBreeds.length === 0 ? (
            <div className="text-center py-12 min-h-[320px] bg-gray-50 rounded-lg">
              <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold">
                {t("noBreeds")}
              </p>
              <p className="text-gray-400 text-sm mt-1">{t("noBreedsSub")}</p>
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-4 pt-2 gap-[9px] hide-scrollbar snap-x snap-mandatory"
              style={{ scrollbarWidth: "none" }}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              role="listbox"
              aria-label={t("breedsList")}
            >
              {displayedBreeds.map((breed) => {
                const isHovered = hoveredBreedId === breed.id;
                const primaryImageUrl = breed.image_url
                  ? getImageUrl(breed.image_url)
                  : null;
                const hoverImageUrl = breed.image_hover_url
                  ? getImageUrl(breed.image_hover_url)
                  : primaryImageUrl;
                const displayImageUrl = isHovered
                  ? hoverImageUrl
                  : primaryImageUrl;

                return (
                  <Link
                    key={breed.id}
                    href={`/pets?breed=${breed.id}`}
                    className="group relative bg-stone-100 rounded-[20px] p-4 pt-5 flex flex-col items-center 
                               w-[200px] sm:w-[215px] h-[280px] sm:h-[297px] flex-shrink-0 snap-start cursor-pointer 
                               transition-shadow duration-300 ease-in-out hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2"
                    onMouseEnter={() => setHoveredBreedId(breed.id)}
                    onMouseLeave={() => setHoveredBreedId(null)}
                    onFocus={() => setHoveredBreedId(breed.id)}
                    onBlur={() => setHoveredBreedId(null)}
                    role="option"
                    aria-selected={false}
                    aria-label={`${breed.name} (${
                      breed.species === "dog" ? t("dog") : t("cat")
                    })`}
                  >
                    <div className="relative w-full h-[160px] sm:h-[180px] mb-3 sm:mb-4 transition-transform duration-300 ease-in-out group-hover:scale-105">
                      {displayImageUrl ? (
                        <Image
                          src={displayImageUrl}
                          alt={breed.name}
                          fill
                          className="object-contain rounded-md"
                          sizes="(max-width: 640px) 180px, 200px"
                          loading="eager"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
                          <PawPrint className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="w-full h-[40px] flex items-center justify-center px-1">
                      <span
                        className="font-geologica font-bold text-[15px] sm:text-base leading-snug text-center text-black/90 
                                   overflow-hidden block"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {breed.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
