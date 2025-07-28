import { useCallback, useMemo } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { getBreeds } from "@/lib/services/breeds-service";
import { Breed, BreedArrayResponse } from "@/lib/types/breeds";
import { Species } from "@/lib/types/pets";

interface UseBreedsOptions {
  initialData?: BreedArrayResponse;
  species?: Species;
  search?: string;
  limit?: number;
}

interface UseBreedsReturn {
  data: BreedArrayResponse;
  breeds: Breed[];
  filteredBreeds: Breed[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  mutate: () => void;
}

export function useBreeds({
  initialData,
  species,
  search,
  limit = 20,
}: UseBreedsOptions = {}): UseBreedsReturn {
  // Generate cache key for SWR
  const generateKey = useCallback(
    (pageIndex: number, previousPageData: BreedArrayResponse | null) => {
      // If we reached the end, don't fetch more
      if (previousPageData && previousPageData.items.length === 0) return null;

      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      params.set("offset", (pageIndex * limit).toString());

      if (species) params.set("species", species);
      if (search) params.set("search", search);

      return `breeds-${params.toString()}`;
    },
    [species, search, limit]
  );

  // Use SWR Infinite for pagination
  const {
    data: pages,
    error,
    isLoading,
    isValidating,
    mutate,
    setSize,
    size,
  } = useSWRInfinite(
    generateKey,
    async (key: string) => {
      const params = new URLSearchParams(key.replace("breeds-", ""));
      const paramsObj: Record<string, string | number> = {};

      params.forEach((value, key) => {
        paramsObj[key] =
          key === "limit" || key === "offset" ? parseInt(value, 10) : value;
      });

      return getBreeds(paramsObj);
    },
    {
      fallbackData: initialData ? [initialData] : undefined,
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Flatten all pages into single data structure
  const data = useMemo<BreedArrayResponse>(() => {
    if (!pages || pages.length === 0) {
      return initialData || { items: [], count: 0 };
    }

    const allItems = pages.flatMap((page) => page.items);
    const totalCount = pages[0]?.count || 0;

    return {
      items: allItems,
      count: totalCount,
    };
  }, [pages, initialData]);

  // Handle client-side search filtering - FIXED: No side effects in useMemo
  const filteredBreeds = useMemo(() => {
    if (!search || search.trim() === "") {
      return [];
    }

    const term = search.toLowerCase();
    return data.items.filter(
      (breed) =>
        breed.name.toLowerCase().includes(term) ||
        (breed.description && breed.description.toLowerCase().includes(term)) ||
        (breed.origin && breed.origin.toLowerCase().includes(term))
    );
  }, [search, data.items]);

  // Load more function
  const loadMore = useCallback(() => {
    if (!isValidating && hasMore) {
      setSize((prevSize) => prevSize + 1);
    }
  }, [isValidating, setSize]);

  // Calculate if there are more pages
  const hasMore = useMemo(() => {
    if (!pages || pages.length === 0) return false;
    const lastPage = pages[pages.length - 1];
    return data.items.length < data.count && lastPage.items.length >= limit;
  }, [pages, data.items.length, data.count, limit]);

  const isLoadingMore =
    isValidating && size > 0 && pages && typeof pages[size - 1] !== "undefined";

  return {
    data,
    breeds: data.items,
    filteredBreeds,
    isLoading: !error && !data,
    isLoadingMore: Boolean(isLoadingMore),
    error,
    hasMore,
    loadMore,
    mutate,
  };
}

// Hook for individual breed
interface UseBreedOptions {
  initialData?: Breed;
}

export function useBreed(id: string, options: UseBreedOptions = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `breed-${id}` : null,
    () =>
      getBreeds({ limit: 1, offset: 0 }).then((res) =>
        res.items.find((breed) => breed.id === id)
      ),
    {
      fallbackData: options.initialData,
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes - breed data changes rarely
    }
  );

  return {
    breed: data,
    isLoading,
    error,
    mutate,
  };
}

// Hook for breed statistics - simplified to avoid backend dependency
export function useBreedsStats(allBreeds?: Breed[]) {
  const stats = useMemo(() => {
    if (!allBreeds) return null;

    const speciesBreakdown = allBreeds.reduce((acc, breed) => {
      acc[breed.species] = (acc[breed.species] || 0) + 1;
      return acc;
    }, {} as Record<Species, number>);

    const originCounts = allBreeds.reduce((acc, breed) => {
      if (breed.origin) {
        acc[breed.origin] = (acc[breed.origin] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const popularOrigins = Object.entries(originCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([origin]) => origin);

    return {
      total_breeds: allBreeds.length,
      species_breakdown: speciesBreakdown,
      popular_origins: popularOrigins,
    };
  }, [allBreeds]);

  return {
    stats,
    isLoading: false,
    error: null,
  };
}
