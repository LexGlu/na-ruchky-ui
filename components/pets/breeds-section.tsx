import { BreedsClient } from "./breeds-section.client";
import { getAllBreedsCache } from "@/lib/cache/breeds.cache";

export const revalidate = 3600;
export const dynamic = "force-static";

export default async function BreedsSection() {
  const breedsData = await getAllBreedsCache();

  return (
    <BreedsClient
      allBreeds={breedsData.breeds}
      speciesCounts={{
        all: breedsData.totalCount,
        dog: breedsData.dogCount,
        cat: breedsData.catCount,
      }}
    />
  );
}
