"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import Image from "next/image";
import Link from "next/link";

import { PawPrint, Search, ArrowLeft, Loader2 } from "lucide-react";

import { getBreeds } from "@/lib/services/breeds-service";
import { getImageUrl } from "@/lib/utils/get-image-url";
import { Breed } from "@/lib/types/breeds";
import { Species } from "@/lib/types/pets";

function BreedsContent() {
  const searchParams = useSearchParams();
  const initialSpecies =
    (searchParams.get("species") as Species | "all") || "all";

  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [filteredBreeds, setFilteredBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSpecies, setActiveSpecies] = useState<Species | "all">(
    initialSpecies
  );
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 20;

  // Fetch breeds based on active species
  const fetchBreeds = useCallback(
    async (resetOffset = false) => {
      try {
        setLoading(true);

        // Reset offset when changing filters
        const currentOffset = resetOffset ? 0 : offset;

        const params: Record<string, string | number> = {
          limit: itemsPerPage,
          offset: currentOffset,
        };

        // Only add species filter if it's not "all"
        if (activeSpecies !== "all") {
          params.species = activeSpecies;
        }

        const response = await getBreeds(params);

        if (resetOffset) {
          // Replace the entire collection when resetting
          setBreeds(response.items || []);
          setOffset(itemsPerPage);
        } else {
          // Append new items when loading more
          setBreeds((prev) => [...prev, ...(response.items || [])]);
          setOffset(currentOffset + itemsPerPage);
        }

        setTotalCount(response.count);
        setHasMore(
          (response.items?.length || 0) >= itemsPerPage &&
            currentOffset + response.items?.length < response.count
        );
      } catch (error) {
        console.error("Error fetching breeds:", error);
      } finally {
        setLoading(false);
      }
    },
    [activeSpecies, offset, itemsPerPage]
  );

  // Initial breeds fetch and when species changes
  useEffect(() => {
    // Reset everything when species changes
    fetchBreeds(true);
  }, [activeSpecies, fetchBreeds]);

  // Filter breeds based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBreeds(breeds);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = breeds.filter(
      (breed) =>
        breed.name.toLowerCase().includes(term) ||
        (breed.description && breed.description.toLowerCase().includes(term))
    );

    setFilteredBreeds(filtered);
  }, [breeds, searchTerm]);

  // Handle species change
  const handleSpeciesChange = (species: Species | "all") => {
    if (species !== activeSpecies) {
      setActiveSpecies(species);
      setSearchTerm("");
      setOffset(0); // Reset pagination
    }
  };

  // Load more breeds
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchBreeds(false);
    }
  };

  const displayedBreeds = searchTerm.trim() ? filteredBreeds : breeds;
  const isInitialLoading = loading && breeds.length === 0;
  const isLoadingMore = loading && breeds.length > 0;

  return (
    <div className="container mx-auto py-8 px-4 lg:px-6 text-black bg-white rounded-[20px]">
      <div className="flex items-center mb-6">
        <Link
          href="/"
          className="mr-4 p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Всі породи</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <div className="relative flex-grow">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Пошук порід"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search breeds"
            />
          </div>

          {/* Species filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Всі" },
              { id: "dog", label: "Собаки" },
              { id: "cat", label: "Коти" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleSpeciesChange(item.id as Species | "all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeSpecies === item.id
                    ? "bg-lime-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                aria-pressed={activeSpecies === item.id}
                aria-label={`Filter by ${item.label}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Breeds count */}
      {!isInitialLoading && (
        <div className="mb-4 text-sm text-gray-500">
          {searchTerm.trim()
            ? `Знайдено ${filteredBreeds.length} порід`
            : `Показано ${breeds.length} з ${totalCount} порід`}
        </div>
      )}

      {/* Results */}
      {isInitialLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 text-lime-500 animate-spin" />
          <span className="sr-only">Завантаження...</span>
        </div>
      ) : displayedBreeds.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Порід не знайдено</h2>
          <p className="text-gray-500">Спробуйте змінити параметри пошуку</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedBreeds.map((breed, index) => (
              <Link
                key={`${breed.id}-${index}`}
                href={`/breeds/${breed.id}`}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all flex flex-col items-center transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-lime-300 focus:ring-offset-2"
              >
                <div
                  className="relative w-24 h-24 mb-3 overflow-hidden rounded-full bg-gray-50 flex items-center justify-center"
                  aria-hidden={!breed.image_url}
                >
                  {breed.image_url ? (
                    <Image
                      src={getImageUrl(breed.image_url)}
                      alt={`Зображення породи ${breed.name}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      loading="lazy"
                    />
                  ) : (
                    <PawPrint
                      className="h-10 w-10 text-gray-300"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <h3 className="text-center font-medium mb-1">{breed.name}</h3>
                <span className="text-sm text-gray-500">
                  {breed.species === "dog" ? "Собака" : "Кіт"}
                </span>
                {breed.origin && (
                  <span className="text-xs text-gray-400 mt-1">
                    {breed.origin}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Load more */}
          {!searchTerm.trim() && hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Завантаження...</span>
                  </>
                ) : (
                  "Завантажити ще"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="container mx-auto py-8 px-4 text-black bg-white rounded-[20px]">
      <div className="flex items-center mb-6">
        <div className="mr-4 p-2 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold">Всі породи</h1>
      </div>
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-lime-500" />
        <span className="sr-only">Завантаження...</span>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function BreedsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BreedsContent />
    </Suspense>
  );
}
