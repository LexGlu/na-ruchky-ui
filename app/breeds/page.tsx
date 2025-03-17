"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBreeds } from "@/lib/services/breeds-service";
import { getImageUrl } from "@/lib/utils/get-image-url";
import { Breed } from "@/lib/types/breeds";
import { Species } from "@/lib/types/pets";
import { PawPrint, Search, ArrowLeft } from "lucide-react";

// Create a separate component that uses useSearchParams
function BreedsContent() {
  const searchParams = useSearchParams();
  const initialSpecies = (searchParams.get("species") as Species) || "all";

  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [filteredBreeds, setFilteredBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSpecies, setActiveSpecies] = useState<Species | "all">(
    initialSpecies
  );

  // Fetch all breeds on component mount
  useEffect(() => {
    async function fetchBreeds() {
      try {
        const data = await getBreeds({ limit: 50 });
        setBreeds(data.items || []);
      } catch (error) {
        console.error("Error fetching breeds:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBreeds();
  }, []);

  // Filter breeds based on search term and species
  useEffect(() => {
    let result = breeds;

    // Filter by species
    if (activeSpecies !== "all") {
      result = result.filter((breed) => breed.species === activeSpecies);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (breed) =>
          breed.name.toLowerCase().includes(term) ||
          (breed.description && breed.description.toLowerCase().includes(term))
      );
    }

    setFilteredBreeds(result);
  }, [breeds, activeSpecies, searchTerm]);

  return (
    <div className="container mx-auto py-8 px-4 text-black bg-white rounded-[20px]">
      <div className="flex items-center mb-6">
        <Link
          href="/"
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Back to home">
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
            />
          </div>

          {/* Species filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSpecies("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSpecies === "all"
                  ? "bg-lime-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}>
              Всі
            </button>
            <button
              onClick={() => setActiveSpecies("dog")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSpecies === "dog"
                  ? "bg-lime-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}>
              Собаки
            </button>
            <button
              onClick={() => setActiveSpecies("cat")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSpecies === "cat"
                  ? "bg-lime-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}>
              Коти
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-3 border-lime-500 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredBreeds.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Порід не знайдено</h2>
          <p className="text-gray-500">Спробуйте змінити параметри пошуку</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBreeds.map((breed) => (
            <Link
              key={breed.id}
              href={`/breeds/${breed.id}`}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex flex-col items-center">
              <div className="relative w-24 h-24 mb-3 overflow-hidden rounded-full bg-gray-50 flex items-center justify-center">
                {breed.image_url ? (
                  <Image
                    src={getImageUrl(breed.image_url)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="96px"
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
        <div className="animate-spin w-8 h-8 border-3 border-lime-500 border-t-transparent rounded-full"></div>
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
