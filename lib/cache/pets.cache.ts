import { fetchPetListings } from "@/lib/api/pets";
import { PetListing } from "@/lib/types/pets";
import { unstable_cache } from "next/cache";

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

const PETS_CACHE_TTL = 3600; // 1 hour in seconds
const PETS_CACHE_TAGS = ["pets", "pet-listings"];
const BATCH_SIZE = 100; // Fetch pets in batches to avoid overwhelming the API

// ============================================================================
// CACHED DATA INTERFACES
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
}

export interface PetsMetadata {
  count: number;
  lastFetch: string;
  speciesBreakdown: {
    dog: number;
    cat: number;
  };
}

// ============================================================================
// CORE CACHE FUNCTIONS
// ============================================================================

/**
 * Fetches all pet listings in batches to avoid API limits
 */
async function fetchAllPetListings(): Promise<{
  pets: PetListing[];
  totalCount: number;
}> {
  console.log("🐾 Fetching all pet listings for cache...");

  const allPets: PetListing[] = [];
  let offset = 0;
  let totalCount = 0;
  let hasMore = true;

  // First fetch to get total count
  const firstBatch = await fetchPetListings(
    new URLSearchParams({
      limit: BATCH_SIZE.toString(),
      offset: "0",
    })
  );

  allPets.push(...firstBatch.items);
  totalCount = firstBatch.count;
  offset += BATCH_SIZE;
  hasMore = allPets.length < totalCount;

  console.log(
    `📊 Total pets to fetch: ${totalCount}, fetched: ${allPets.length}`
  );

  // Fetch remaining batches
  while (hasMore && offset < totalCount) {
    try {
      const batch = await fetchPetListings(
        new URLSearchParams({
          limit: BATCH_SIZE.toString(),
          offset: offset.toString(),
        })
      );

      allPets.push(...batch.items);
      offset += BATCH_SIZE;
      hasMore = allPets.length < totalCount;

      console.log(`📦 Fetched batch: ${allPets.length}/${totalCount} pets`);

      // Rate limiting protection
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`❌ Error fetching pets batch at offset ${offset}:`, error);
      break;
    }
  }

  console.log(`✅ Completed fetching ${allPets.length} pets`);
  return { pets: allPets, totalCount };
}

/**
 * Processes pet data to generate useful statistics
 */
function processPetStatistics(pets: PetListing[]): {
  speciesCounts: CachedPetsData["speciesCounts"];
  locationCounts: Record<string, number>;
  breedCounts: Record<string, number>;
} {
  const speciesCounts = { all: pets.length, dog: 0, cat: 0 };
  const locationCounts: Record<string, number> = {};
  const breedCounts: Record<string, number> = {};

  pets.forEach((pet) => {
    // Count species
    if (pet.pet.species === "dog") speciesCounts.dog++;
    if (pet.pet.species === "cat") speciesCounts.cat++;

    // Count locations
    const location = pet.pet.location || "Unknown";
    locationCounts[location] = (locationCounts[location] || 0) + 1;

    // Count breeds
    const breed = pet.pet.breed_name || "Unknown";
    breedCounts[breed] = (breedCounts[breed] || 0) + 1;
  });

  return { speciesCounts, locationCounts, breedCounts };
}

/**
 * Internal function to build complete pets cache data
 */
async function buildPetsCacheData(): Promise<CachedPetsData> {
  const { pets, totalCount } = await fetchAllPetListings();
  const statistics = processPetStatistics(pets);

  return {
    pets,
    totalCount,
    lastUpdated: new Date().toISOString(),
    ...statistics,
  };
}

// ============================================================================
// CACHED FUNCTIONS WITH NEXT.JS UNSTABLE_CACHE
// ============================================================================

/**
 * Gets all pets with comprehensive caching
 * Revalidated every hour, cached with pets tags
 */
export const getAllPetsCache = unstable_cache(
  buildPetsCacheData,
  ["all-pets"],
  {
    revalidate: PETS_CACHE_TTL,
    tags: PETS_CACHE_TAGS,
  }
);

/**
 * Gets pets metadata for quick access to counts
 */
export const getPetsMetadata = unstable_cache(
  async (): Promise<PetsMetadata> => {
    console.log("📋 Fetching pets metadata...");

    // Get just the first batch to extract metadata quickly
    const result = await fetchPetListings(
      new URLSearchParams({ limit: "1", offset: "0" })
    );

    // For species breakdown, we need to fetch more data or use approximation
    // This is a lightweight version - for exact counts, use getAllPetsCache
    const speciesBreakdown = {
      dog: Math.floor(result.count * 0.6), // Rough estimate
      cat: Math.floor(result.count * 0.4), // Rough estimate
    };

    return {
      count: result.count,
      lastFetch: new Date().toISOString(),
      speciesBreakdown,
    };
  },
  ["pets-metadata"],
  {
    revalidate: PETS_CACHE_TTL,
    tags: PETS_CACHE_TAGS,
  }
);

/**
 * Gets all pet UUIDs for generateStaticParams
 */
export const getAllPetUUIDs = unstable_cache(
  async (): Promise<string[]> => {
    console.log("🔗 Fetching all pet UUIDs for static generation...");

    const cacheData = await getAllPetsCache();
    const uuids = cacheData.pets.map((pet) => pet.id);

    console.log(`✅ Generated ${uuids.length} pet UUIDs for static params`);
    return uuids;
  },
  ["pet-uuids"],
  {
    revalidate: PETS_CACHE_TTL,
    tags: PETS_CACHE_TAGS,
  }
);

/**
 * Gets pets filtered by species - useful for category pages
 */
export const getPetsBySpecies = unstable_cache(
  async (species: "dog" | "cat"): Promise<PetListing[]> => {
    console.log(`🐕 Fetching ${species} pets from cache...`);

    const cacheData = await getAllPetsCache();
    return cacheData.pets.filter((pet) => pet.pet.species === species);
  },
  ["pets-by-species"],
  {
    revalidate: PETS_CACHE_TTL,
    tags: PETS_CACHE_TAGS,
  }
);

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Manually revalidate pets cache (useful for webhooks or admin actions)
 */
export async function revalidatePetsCache(): Promise<void> {
  const { revalidateTag } = await import("next/cache");

  console.log("🔄 Manually revalidating pets cache...");

  PETS_CACHE_TAGS.forEach((tag) => {
    revalidateTag(tag);
  });
}

/**
 * Get cache status and statistics
 */
export async function getPetsCacheStatus(): Promise<{
  isHealthy: boolean;
  lastUpdate: string;
  totalPets: number;
  cacheSize: string;
}> {
  try {
    const metadata = await getPetsMetadata();

    return {
      isHealthy: true,
      lastUpdate: metadata.lastFetch,
      totalPets: metadata.count,
      cacheSize: `~${Math.round(metadata.count * 0.01)}MB`, // Rough estimate
    };
  } catch (error) {
    console.error("❌ Error checking pets cache status:", error);
    return {
      isHealthy: false,
      lastUpdate: "Unknown",
      totalPets: 0,
      cacheSize: "Unknown",
    };
  }
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

/**
 * Clear all pets cache (development only)
 */
export async function clearPetsCache(): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    console.warn("⚠️ Cache clearing is only available in development");
    return;
  }

  console.log("🧹 Clearing pets cache...");
  await revalidatePetsCache();
}
