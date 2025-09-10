import { BreedsClient } from "./breeds-section.client";
import { getAllBreedsCache } from "@/lib/cache/breeds.cache";
import Section from "@/components/layout/section";

export const revalidate = 3600;
export const dynamic = "force-static";

export default async function BreedsSection() {
  const breedsData = await getAllBreedsCache();
  return (
    <Section padding="md" inner max="site" className="bg-white rounded-3xl">
      <BreedsClient
        allBreeds={breedsData.breeds}
        speciesCounts={{
          all: breedsData.totalCount,
          dog: breedsData.dogCount,
          cat: breedsData.catCount,
        }}
      />
    </Section>
  );
}
