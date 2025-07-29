import { fetchPetListings } from "@/lib/api/pets";
import { PetListing } from "@/lib/types/pets";
import { unstable_cache } from "next/cache";

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

const CACHE_CONFIG = {
  // Primary cache for all pets data (longer TTL for stability)
  PETS_TTL: 3600, // 1 hour
  // Quick metadata cache (shorter TTL for responsiveness)
  METADATA_TTL: 1800, // 30 minutes
  // New listings cache (frequent updates for freshness)
  NEW_LISTINGS_TTL: 900, // 15 minutes
  // Batch size for API calls
  BATCH_SIZE: 100,
  // Limits
  NEW_LISTINGS_LIMIT: 15,
  FEATURED_PETS_LIMIT: 8,
} as const;

const CACHE_TAGS = {
  PETS: ["pets", "pet-listings"] as string[],
  NEW_LISTINGS: ["pets", "new-listings"] as string[],
  METADATA: ["pets", "metadata"] as string[],
  FEATURED: ["pets", "featured"] as string[],
} as const;

// ============================================================================
// INTERFACES
// ============================================================================

export interface CachedPetsData {
  pets: PetListing[];
  totalCount: number;
  lastUpdated: string;
  speciesCounts: {
    all: number;
    dog: number;
    cat: number;
  };
  locationCounts: Record<string, number>;
  breedCounts: Record<string, number>;
  // Add performance metadata
  cacheMetadata: {
    buildTime: string;
    batchesFetched: number;
    cacheHitRate?: number;
  };
}

export interface PetsMetadata {
  count: number;
  lastFetch: string;
  speciesBreakdown: {
    dog: number;
    cat: number;
  };
  performance: {
    avgResponseTime: number;
    cacheAge: number;
  };
}

// ============================================================================
// CORE FETCHING FUNCTIONS
// ============================================================================

/**
 * Robust batch fetching with error recovery and rate limiting
 */
async function fetchAllPetsRobust(): Promise<{
  pets: PetListing[];
  totalCount: number;
  batchesFetched: number;
}> {
  console.log("🐾 Starting robust pets data fetch...");

  const startTime = Date.now();
  const allPets: PetListing[] = [];
  let batchesFetched = 0;
  let totalCount = 0;
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 3;

  try {
    // Initial fetch to get total count
    const firstBatch = await fetchPetListings(
      new URLSearchParams({
        limit: CACHE_CONFIG.BATCH_SIZE.toString(),
        offset: "0",
      })
    );

    allPets.push(...firstBatch.items);
    totalCount = firstBatch.count;
    batchesFetched = 1;
    consecutiveErrors = 0;

    console.log(
      `📊 Initial batch: ${firstBatch.items.length}/${totalCount} pets`
    );

    // Fetch remaining batches with error recovery
    let offset = CACHE_CONFIG.BATCH_SIZE;

    while (
      allPets.length < totalCount &&
      consecutiveErrors < maxConsecutiveErrors
    ) {
      try {
        const batch = await fetchPetListings(
          new URLSearchParams({
            limit: CACHE_CONFIG.BATCH_SIZE.toString(),
            offset: offset.toString(),
          })
        );

        if (batch.items.length > 0) {
          allPets.push(...batch.items);
          batchesFetched++;
          consecutiveErrors = 0;

          console.log(
            `📦 Batch ${batchesFetched}: ${allPets.length}/${totalCount} pets`
          );
        } else {
          console.log("📭 Empty batch received, stopping fetch");
          break;
        }

        offset += CACHE_CONFIG.BATCH_SIZE;

        // Rate limiting with exponential backoff
        const delay = Math.min(100 * batchesFetched, 1000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (error) {
        consecutiveErrors++;
        console.warn(
          `⚠️ Batch fetch error (${consecutiveErrors}/${maxConsecutiveErrors}):`,
          error
        );

        if (consecutiveErrors < maxConsecutiveErrors) {
          // Exponential backoff retry
          const retryDelay = 1000 * Math.pow(2, consecutiveErrors);
          console.log(`🔄 Retrying after ${retryDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `✅ Fetch completed: ${allPets.length} pets in ${duration}ms (${batchesFetched} batches)`
    );

    return { pets: allPets, totalCount, batchesFetched };
  } catch (error) {
    console.error("❌ Critical error in robust fetch:", error);
    throw new Error(
      `Failed to fetch pets data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Optimized statistics processing with memoization
 */
function processPetStatistics(
  pets: PetListing[]
): Omit<
  CachedPetsData,
  "pets" | "totalCount" | "lastUpdated" | "cacheMetadata"
> {
  const stats = {
    speciesCounts: { all: pets.length, dog: 0, cat: 0 },
    locationCounts: {} as Record<string, number>,
    breedCounts: {} as Record<string, number>,
  };

  // Single pass through pets for all statistics
  for (const pet of pets) {
    // Species counts
    if (pet.pet.species === "dog") stats.speciesCounts.dog++;
    else if (pet.pet.species === "cat") stats.speciesCounts.cat++;

    // Location counts (with normalization)
    const location = pet.pet.location?.trim() || "Unknown";
    stats.locationCounts[location] = (stats.locationCounts[location] || 0) + 1;

    // Breed counts (with normalization)
    const breed = pet.pet.breed_name?.trim() || "Mixed";
    stats.breedCounts[breed] = (stats.breedCounts[breed] || 0) + 1;
  }

  return stats;
}

/**
 * Main cache data builder with comprehensive error handling
 */
async function buildCompletePetsCache(): Promise<CachedPetsData> {
  try {
    const { pets, totalCount, batchesFetched } = await fetchAllPetsRobust();
    const statistics = processPetStatistics(pets);

    return {
      pets,
      totalCount,
      lastUpdated: new Date().toISOString(),
      ...statistics,
      cacheMetadata: {
        buildTime: new Date().toISOString(),
        batchesFetched,
      },
    };
  } catch (error) {
    console.error("❌ Failed to build pets cache:", error);

    // Return minimal fallback data instead of throwing
    return {
      pets: [],
      totalCount: 0,
      lastUpdated: new Date().toISOString(),
      speciesCounts: { all: 0, dog: 0, cat: 0 },
      locationCounts: {},
      breedCounts: {},
      cacheMetadata: {
        buildTime: new Date().toISOString(),
        batchesFetched: 0,
      },
    };
  }
}

// ============================================================================
// CACHED FUNCTIONS (ISR OPTIMIZED)
// ============================================================================

/**
 * Primary ISR cache function - contains all pets data
 * This is the main function that powers ISR static generation
 */
export const getAllPetsCache = unstable_cache(
  buildCompletePetsCache,
  ["pets-complete-cache"],
  {
    revalidate: CACHE_CONFIG.PETS_TTL,
    tags: CACHE_TAGS.PETS,
  }
);

/**
 * Lightweight metadata cache for quick page metadata generation
 */
export const getPetsMetadata = unstable_cache(
  async (): Promise<PetsMetadata> => {
    const startTime = Date.now();

    try {
      // Try to get from main cache first (most efficient)
      const cachedData = await getAllPetsCache();

      return {
        count: cachedData.totalCount,
        lastFetch: cachedData.lastUpdated,
        speciesBreakdown: {
          dog: cachedData.speciesCounts.dog,
          cat: cachedData.speciesCounts.cat,
        },
        performance: {
          avgResponseTime: Date.now() - startTime,
          cacheAge: Date.now() - new Date(cachedData.lastUpdated).getTime(),
        },
      };
    } catch (error) {
      console.warn("⚠️ Fallback to API for metadata:", error);

      // Fallback to direct API call
      const result = await fetchPetListings(
        new URLSearchParams({ limit: "1", offset: "0" })
      );

      return {
        count: result.count,
        lastFetch: new Date().toISOString(),
        speciesBreakdown: {
          dog: Math.floor(result.count * 0.6), // Estimate
          cat: Math.floor(result.count * 0.4), // Estimate
        },
        performance: {
          avgResponseTime: Date.now() - startTime,
          cacheAge: 0,
        },
      };
    }
  },
  ["pets-metadata"],
  {
    revalidate: CACHE_CONFIG.METADATA_TTL,
    tags: CACHE_TAGS.METADATA,
  }
);

/**
 * New listings cache for homepage freshness
 */
export const getNewPetListingsCache = unstable_cache(
  async (): Promise<PetListing[]> => {
    try {
      // Try main cache first for consistency
      const cachedData = await getAllPetsCache();

      // Sort by ID (assuming higher ID = newer) and take latest
      const sortedPets = [...cachedData.pets].sort((a, b) =>
        b.id.localeCompare(a.id)
      );
      return sortedPets.slice(0, CACHE_CONFIG.NEW_LISTINGS_LIMIT);
    } catch (error) {
      console.warn("⚠️ Fallback to API for new listings:", error);

      const result = await fetchPetListings(
        new URLSearchParams({
          limit: CACHE_CONFIG.NEW_LISTINGS_LIMIT.toString(),
          offset: "0",
        })
      );

      return result.items;
    }
  },
  ["new-pet-listings"],
  {
    revalidate: CACHE_CONFIG.NEW_LISTINGS_TTL,
    tags: CACHE_TAGS.NEW_LISTINGS,
  }
);

/**
 * Featured pets for special sections
 */
export const getFeaturedPetsCache = unstable_cache(
  async (): Promise<PetListing[]> => {
    try {
      const cachedData = await getAllPetsCache();

      // Select featured pets based on quality criteria
      const featuredPets = cachedData.pets
        .filter(
          (pet) =>
            pet.pet.images &&
            pet.pet.images.length > 0 &&
            pet.pet.short_description &&
            pet.pet.breed_name &&
            pet.pet.location
        )
        .sort((a, b) => {
          // Prioritize pets with more complete profiles
          const scoreA =
            (a.pet.images?.length || 0) + (a.pet.short_description ? 1 : 0);
          const scoreB =
            (b.pet.images?.length || 0) + (b.pet.short_description ? 1 : 0);
          return scoreB - scoreA;
        })
        .slice(0, CACHE_CONFIG.FEATURED_PETS_LIMIT);

      return featuredPets;
    } catch (error) {
      console.error("❌ Error getting featured pets:", error);
      return [];
    }
  },
  ["featured-pets"],
  {
    revalidate: CACHE_CONFIG.PETS_TTL,
    tags: CACHE_TAGS.FEATURED,
  }
);

/**
 * Species-specific caches for category pages
 */
export const getPetsBySpeciesCache = unstable_cache(
  async (species: "dog" | "cat"): Promise<PetListing[]> => {
    const cachedData = await getAllPetsCache();
    return cachedData.pets.filter((pet) => pet.pet.species === species);
  },
  ["pets-by-species"],
  {
    revalidate: CACHE_CONFIG.PETS_TTL,
    tags: CACHE_TAGS.PETS,
  }
);

/**
 * Get all pet UUIDs for static generation
 */
export const getAllPetUUIDs = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const cachedData = await getAllPetsCache();
      return cachedData.pets.map((pet) => pet.id);
    } catch (error) {
      console.error("❌ Error getting pet UUIDs:", error);
      return [];
    }
  },
  ["pet-uuids"],
  {
    revalidate: CACHE_CONFIG.PETS_TTL,
    tags: CACHE_TAGS.PETS,
  }
);

// ============================================================================
// CACHE MANAGEMENT UTILITIES
// ============================================================================

/**
 * Manual cache revalidation (for webhooks/admin)
 */
export async function revalidateAllPetsCache(): Promise<void> {
  const { revalidateTag } = await import("next/cache");

  console.log("🔄 Revalidating all pets caches...");

  // Revalidate all cache tags
  Object.values(CACHE_TAGS)
    .flat()
    .forEach((tag) => {
      revalidateTag(tag);
    });
}

/**
 * Selective cache revalidation
 */
export async function revalidateSpecificCache(
  cacheType: "pets" | "metadata" | "new-listings" | "featured"
): Promise<void> {
  const { revalidateTag } = await import("next/cache");

  const tagMap = {
    pets: CACHE_TAGS.PETS,
    metadata: CACHE_TAGS.METADATA,
    "new-listings": CACHE_TAGS.NEW_LISTINGS,
    featured: CACHE_TAGS.FEATURED,
  };

  tagMap[cacheType].forEach((tag) => {
    revalidateTag(tag);
  });
}

/**
 * Cache health check
 */
export async function getCacheHealthStatus(): Promise<{
  isHealthy: boolean;
  caches: Record<
    string,
    {
      status: "healthy" | "stale" | "error";
      lastUpdate?: string;
      count?: number;
    }
  >;
  performance: {
    totalPets: number;
    avgBuildTime: number;
    cacheEfficiency: number;
  };
}> {
  try {
    const [petsData, metadata, newListings] = await Promise.allSettled([
      getAllPetsCache(),
      getPetsMetadata(),
      getNewPetListingsCache(),
    ]);

    const caches = {
      main:
        petsData.status === "fulfilled"
          ? {
              status: "healthy" as const,
              lastUpdate: petsData.value.lastUpdated,
              count: petsData.value.totalCount,
            }
          : { status: "error" as const },
      metadata:
        metadata.status === "fulfilled"
          ? {
              status: "healthy" as const,
              lastUpdate: metadata.value.lastFetch,
              count: metadata.value.count,
            }
          : { status: "error" as const },
      newListings:
        newListings.status === "fulfilled"
          ? { status: "healthy" as const, count: newListings.value.length }
          : { status: "error" as const },
    };

    const isHealthy = Object.values(caches).every(
      (cache) => cache.status === "healthy"
    );

    return {
      isHealthy,
      caches,
      performance: {
        totalPets:
          petsData.status === "fulfilled" ? petsData.value.totalCount : 0,
        avgBuildTime:
          petsData.status === "fulfilled"
            ? Date.now() -
              new Date(petsData.value.cacheMetadata.buildTime).getTime()
            : 0,
        cacheEfficiency: isHealthy ? 95 : 60, // Rough estimate
      },
    };
  } catch (error) {
    console.error("❌ Cache health check failed:", error);
    return {
      isHealthy: false,
      caches: {},
      performance: { totalPets: 0, avgBuildTime: 0, cacheEfficiency: 0 },
    };
  }
}

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

/**
 * Force cache refresh (development only)
 */
export async function forceCacheRefresh(): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    console.warn("⚠️ Cache refresh only available in development");
    return;
  }

  console.log("🔄 Force refreshing all caches...");
  await revalidateAllPetsCache();
}
