"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  PawPrint,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { getImageUrl } from "@/lib/utils/get-image-url";
import { Species } from "@/lib/types/pets";
import { Breed } from "@/lib/types/breeds";

interface BreedsClientProps {
  allBreeds: Breed[];
  totalCount: number;
  speciesCounts: {
    all: number;
    dog: number;
    cat: number;
  };
  initialSpecies: Species | "all";
  initialSearch?: string;
  initialPage: number;
  itemsPerPage: number;
}

export function BreedsClient({
  allBreeds,
  totalCount,
  initialSpecies,
  initialSearch = "",
  initialPage,
  itemsPerPage,
}: BreedsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Client state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeSpecies, setActiveSpecies] = useState<Species | "all">(
    initialSpecies
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filterTime, setFilterTime] = useState<number>(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Update URL when state changes (for bookmarking/sharing)
  const updateUrl = useCallback(
    (updates: {
      species?: Species | "all";
      search?: string;
      page?: number;
    }) => {
      const params = new URLSearchParams(searchParams);

      if (updates.species !== undefined) {
        if (updates.species !== "all") {
          params.set("species", updates.species);
        } else {
          params.delete("species");
        }
      }

      if (updates.search !== undefined) {
        if (updates.search.trim()) {
          params.set("search", updates.search);
        } else {
          params.delete("search");
        }
      }

      if (updates.page !== undefined) {
        if (updates.page > 1) {
          params.set("page", updates.page.toString());
        } else {
          params.delete("page");
        }
      }

      const newUrl = `/breeds${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams]
  );

  // Handle species change
  const handleSpeciesChange = useCallback(
    (species: Species | "all") => {
      if (species !== activeSpecies) {
        setActiveSpecies(species);
        setCurrentPage(1); // Reset to first page
        updateUrl({ species, page: 1 });
      }
    },
    [activeSpecies, updateUrl]
  );

  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearchTerm !== initialSearch) {
      updateUrl({ search: debouncedSearchTerm, page: 1 });
    }
  }, [debouncedSearchTerm, initialSearch, updateUrl]);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      updateUrl({ page });

      // Smooth scroll to top of results
      document.getElementById("breeds-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    [updateUrl]
  );

  // 🚀 INSTANT CLIENT-SIDE FILTERING (ALL data available)
  const filteredBreeds = useMemo(() => {
    const startTime = performance.now();

    let filtered = allBreeds;

    // Filter by species
    if (activeSpecies !== "all") {
      filtered = filtered.filter((breed) => breed.species === activeSpecies);
    }

    // Filter by search term
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (breed) =>
          breed.name.toLowerCase().includes(searchLower) ||
          (breed.description &&
            breed.description.toLowerCase().includes(searchLower)) ||
          (breed.origin && breed.origin.toLowerCase().includes(searchLower))
      );
    }

    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);
    setFilterTime(processingTime);

    return filtered;
  }, [allBreeds, activeSpecies, debouncedSearchTerm]);

  // Client-side pagination of filtered results
  const paginatedBreeds = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredBreeds.slice(startIndex, endIndex);

    return paginated;
  }, [filteredBreeds, currentPage, itemsPerPage]);

  // Pagination info
  const totalPages = Math.ceil(filteredBreeds.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredBreeds.length);

  // Species options with dynamic counts from filtered data
  const speciesOptions = useMemo(() => {
    // Calculate counts from current search results
    const searchFiltered = debouncedSearchTerm.trim()
      ? allBreeds.filter((breed) => {
          const searchLower = debouncedSearchTerm.toLowerCase();
          return (
            breed.name.toLowerCase().includes(searchLower) ||
            (breed.description &&
              breed.description.toLowerCase().includes(searchLower)) ||
            (breed.origin && breed.origin.toLowerCase().includes(searchLower))
          );
        })
      : allBreeds;

    const dogCount = searchFiltered.filter(
      (breed) => breed.species === "dog"
    ).length;
    const catCount = searchFiltered.filter(
      (breed) => breed.species === "cat"
    ).length;

    return [
      {
        id: "all" as const,
        label: "All",
        count: searchFiltered.length,
      },
      {
        id: "dog" as const,
        label: "Dogs",
        count: dogCount,
      },
      {
        id: "cat" as const,
        label: "Cats",
        count: catCount,
      },
    ];
  }, [allBreeds, debouncedSearchTerm]);

  // Reset page if current page exceeds available pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
      updateUrl({ page: 1 });
    }
  }, [currentPage, totalPages, updateUrl]);

  return (
    <>
      {/* Performance info for development */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            <span>
              <strong>Client Performance:</strong> Filtered{" "}
              {filteredBreeds.length} breeds in {filterTime}ms
              {debouncedSearchTerm && ` • Search: "${debouncedSearchTerm}"`}
              {activeSpecies !== "all" && ` • Species: ${activeSpecies}`}
            </span>
          </div>
        </div>
      )}

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
              placeholder="Search breeds by name, description, or origin..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-300 focus:border-lime-300"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label="Search breeds"
            />
            {debouncedSearchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Species filter */}
          <div className="flex flex-wrap gap-2">
            {speciesOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSpeciesChange(option.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                  activeSpecies === option.id
                    ? "bg-lime-500 text-white shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                aria-pressed={activeSpecies === option.id}
                aria-label={`Filter by ${option.label}`}
              >
                {activeSpecies === option.id && <Filter className="h-3 w-3" />}
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results info */}
      <div
        id="breeds-results"
        className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-500"
      >
        <div>
          {filteredBreeds.length === 0 ? (
            <span className="text-gray-600 font-medium">No breeds found</span>
          ) : totalPages > 1 ? (
            <span>
              Showing{" "}
              <strong>
                {startItem}-{endItem}
              </strong>{" "}
              of <strong>{filteredBreeds.length}</strong> breeds
              {filteredBreeds.length !== totalCount && (
                <span className="ml-1 text-gray-400">
                  (filtered from {totalCount} total)
                </span>
              )}
            </span>
          ) : (
            <span>
              Showing all <strong>{filteredBreeds.length}</strong> breeds
              {filteredBreeds.length !== totalCount && (
                <span className="ml-1 text-gray-400">
                  (filtered from {totalCount} total)
                </span>
              )}
            </span>
          )}
        </div>

        {/* Page info */}
        {totalPages > 1 && (
          <div className="text-xs bg-gray-100 px-2 py-1 rounded">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* Results */}
      {filteredBreeds.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">No breeds found</h2>
          <p className="text-gray-500 mb-4">
            {debouncedSearchTerm.trim()
              ? `No breeds match "${debouncedSearchTerm}"`
              : "Try changing your search parameters"}
          </p>
          {(debouncedSearchTerm.trim() || activeSpecies !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveSpecies("all");
                setCurrentPage(1);
                router.replace("/breeds");
              }}
              className="px-6 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg text-sm transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Breeds grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {paginatedBreeds.map((breed, index) => (
              <BreedCard
                key={`${breed.id}-${currentPage}-${index}`}
                breed={breed}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Previous/Next buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNumber;

                  if (totalPages <= 7) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 4) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNumber = totalPages - 6 + i;
                  } else {
                    pageNumber = currentPage - 3 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNumber
                          ? "bg-lime-500 text-white shadow-md"
                          : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

// Enhanced Breed card component
function BreedCard({ breed }: { breed: Breed }) {
  return (
    <Link
      href={`/breeds/${breed.id}`}
      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all flex flex-col items-center transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-lime-300 focus:ring-offset-2 group"
    >
      <div
        className="relative w-24 h-24 mb-3 overflow-hidden rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-105 transition-transform"
        aria-hidden={!breed.image_url}
      >
        {breed.image_url ? (
          <Image
            src={getImageUrl(breed.image_url)}
            alt={`${breed.name} breed`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            loading="lazy"
          />
        ) : (
          <PawPrint className="h-10 w-10 text-gray-300" aria-hidden="true" />
        )}
      </div>
      <h3 className="text-center font-medium mb-1 group-hover:text-lime-600 transition-colors">
        {breed.name}
      </h3>
      <span className="text-sm text-gray-500 capitalize mb-1">
        {breed.species}
      </span>
      {breed.origin && (
        <span className="text-xs text-gray-400 text-center">
          {breed.origin}
        </span>
      )}
    </Link>
  );
}
