"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Breed } from "@/lib/types/breeds";
import { getBreeds } from "@/lib/services/breeds-service";
import { getImageUrl } from "@/lib/utils/get-image-url";
import { PawPrint, ChevronLeft, ChevronRight } from "lucide-react";
import { Species } from "@/lib/types/pets";

export default function BreedsSection() {
  const [filteredBreeds, setFilteredBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSpecies, setActiveSpecies] = useState<Species | "all">("all");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch all breeds on component mount or when species filter changes
  useEffect(() => {
    async function fetchBreeds() {
      try {
        setLoading(true);
        // Only pass species parameter if it's not "all"
        const params =
          activeSpecies !== "all" ? { species: activeSpecies } : {};
        const data = await getBreeds({ ...params, limit: 20 });

        if (data.items && data.items.length > 0) {
          setFilteredBreeds(data.items);
        } else {
          console.warn("No breeds returned from API");
        }
      } catch (error) {
        console.error("Error fetching breeds:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBreeds();

    // Reset scroll position when filters change
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [activeSpecies]);

  // Scroll functions
  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 300;
    const container = scrollContainerRef.current;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      scroll("left");
    } else if (e.key === "ArrowRight") {
      scroll("right");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-3xl font-bold">Породи</h2>

        <div className="flex items-center gap-2">
          {/* Species filter buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSpecies("all")}
              className={`px-3 py-1 rounded-full text-sm transition-colors cursor-pointer ${
                activeSpecies === "all"
                  ? "bg-lime-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              aria-pressed={activeSpecies === "all"}>
              Всі
            </button>
            <button
              onClick={() => setActiveSpecies("dog")}
              className={`px-3 py-1 rounded-full text-sm transition-colors cursor-pointer ${
                activeSpecies === "dog"
                  ? "bg-lime-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              aria-pressed={activeSpecies === "dog"}>
              Собаки
            </button>
            <button
              onClick={() => setActiveSpecies("cat")}
              className={`px-3 py-1 rounded-full text-sm transition-colors cursor-pointer ${
                activeSpecies === "cat"
                  ? "bg-lime-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              aria-pressed={activeSpecies === "cat"}>
              Коти
            </button>
          </div>

          {/* Navigation arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label="Scroll left">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label="Scroll right">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4 bg-gray-50 rounded-lg">
          <div className="animate-spin w-6 h-6 border-2 border-lime-500 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredBreeds.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Порід не знайдено</p>
        </div>
      ) : (
        <div className="relative">
          {/* Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-6 gap-4 hide-scrollbar snap-x"
            style={{ scrollbarWidth: "none" }}
            aria-label="Breed categories"
            tabIndex={0}
            onKeyDown={handleKeyDown}>
            {filteredBreeds.map((breed) => (
              <Link
                key={breed.id}
                href={`/breeds/${breed.id}`}
                className="bg-[#D5EBF1] rounded-[43px] p-3 flex flex-col items-center w-[188px] h-[208px] flex-shrink-0 snap-start cursor-pointer hover:shadow-md transition-all outline-none"
                aria-label={`${breed.name} - ${
                  breed.species === "dog" ? "Собака" : "Кіт"
                }`}>
                <div className="relative w-[140px] h-[140px] overflow-hidden rounded-full flex items-center justify-center bg-white">
                  {breed.image_url ? (
                    <Image
                      src={getImageUrl(breed.image_url)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="140px"
                    />
                  ) : (
                    <PawPrint
                      className="h-10 w-10 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="w-full h-[44px] flex items-center justify-center mt-2 px-2">
                  <span className="text-sm font-medium text-center overflow-hidden text-ellipsis whitespace-nowrap w-full">
                    {breed.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* View all link */}
      <div className="text-center mt-4">
        <Link
          href="/breeds"
          className="text-lime-600 hover:text-lime-700 text-sm font-medium inline-flex items-center gap-1 cursor-pointer">
          Переглянути всі породи
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
