import { Suspense } from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import HeroSection from "@/components/common/hero-section";
import PromoSection from "@/components/common/promo-section";
import NewPetListings from "@/components/pets/new-listings";
import BreedsSection from "@/components/pets/breeds-section";
import PetListingsSection from "@/components/pets/pet-list/pet-listings-section";
import {
  BreedsSkeleton,
  NewListingsSkeleton,
  PetListingsSkeleton,
} from "@/components/skeletons/home";

import { getAllPetsCache, getPetsMetadata } from "@/lib/cache/pets.cache";

export const revalidate = 3600; // 1 hour
export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const t = await getTranslations("HomePage.metadata");
    const { count, speciesBreakdown } = await getPetsMetadata();

    return {
      title: t("title"),
      description: t("description", {
        count: count,
        dogCount: speciesBreakdown.dog,
        catCount: speciesBreakdown.cat,
      }),
      keywords: [...t.raw("keywords"), `${count} pets`],
      openGraph: {
        title: t("openGraphTitle", { count }),
        description: t("openGraphDescription", {
          count: count,
          dogCount: speciesBreakdown.dog,
          catCount: speciesBreakdown.cat,
        }),
        type: "website",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata for pets page:", error);
    const t = await getTranslations("HomePage.metadata");
    return {
      title: "Pet Directory - Find Your Perfect Companion",
      description: t("descriptionFallback"),
    };
  }
}

export default async function PetsPage() {
  // Pre-load all data at build time for maximum ISR benefit
  const petsData = await getAllPetsCache();

  return (
    <main className="flex flex-col gap-1">
      <HeroSection />
      <Suspense fallback={<NewListingsSkeleton />}>
        <NewPetListings />
      </Suspense>
      <Suspense fallback={<BreedsSkeleton />}>
        <BreedsSection />
      </Suspense>
      <Suspense fallback={<PetListingsSkeleton />}>
        <PetListingsSection id="all-pets" staticData={petsData} />
      </Suspense>
      <PromoSection />
    </main>
  );
}
