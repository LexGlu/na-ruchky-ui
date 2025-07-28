import { cache } from "react";
import { getBreeds } from "@/lib/services/breeds-service";

// Shared cached function for build-time breed fetching
// This ensures data is only fetched once during build across all pages
export const getAllBreedsCache = cache(async () => {
  const { count } = await getBreeds({ limit: 1 });
  const { items: breeds } = await getBreeds({ limit: count, offset: 0 });

  const dogCount = breeds.filter((breed) => breed.species === "dog").length;
  const catCount = breeds.filter((breed) => breed.species === "cat").length;

  return {
    breeds,
    totalCount: count,
    dogCount,
    catCount,
  };
});

export const getBreedsMetadata = cache(async () => {
  const { totalCount } = await getAllBreedsCache();
  return { count: totalCount };
});
