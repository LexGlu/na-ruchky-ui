import { Suspense } from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import HeroSection from "@/components/common/hero-section";
import BreedsSection from "@/components/pets/breeds-section";
import NewPetListings from "@/components/pets/new-listings";
import PetListingsSection from "@/components/pets/pet-list/pet-listings-section";

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

// ============================================================================
// LOADING SKELETONS
// ============================================================================

const LoadingSkeletons = {
  Breeds: () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="w-[215px] h-[297px] bg-gray-200 rounded-[20px] flex-shrink-0"
          />
        ))}
      </div>
    </div>
  ),

  NewListings: () => (
    <div className="container bg-white rounded-[20px] px-4 my-1 pb-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="w-[200px] h-[280px] bg-gray-200 rounded-lg flex-shrink-0"
          />
        ))}
      </div>
    </div>
  ),

  PetListings: () => (
    <div className="flex flex-col w-full py-8 px-4 md:px-6 bg-white rounded-[20px] shadow-sm animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="w-full h-[401px] bg-gray-200 rounded-[20px]"
          />
        ))}
      </div>
    </div>
  ),
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function PetsPage() {
  // Pre-load all data at build time for maximum ISR benefit
  const petsData = await getAllPetsCache();

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Content Sections */}
      <section className="flex flex-col text-black gap-0 bg-white px-4 pt-4 rounded-[20px] mb-1">
        {/* Breeds Section */}
        <div className="bg-white rounded-b-[20px]">
          <div className="container mx-auto py-8">
            <Suspense fallback={<LoadingSkeletons.Breeds />}>
              <BreedsSection />
            </Suspense>
          </div>
        </div>

        {/* New Pet Listings */}
        <Suspense fallback={<LoadingSkeletons.NewListings />}>
          <NewPetListings />
        </Suspense>
      </section>

      {/* Main Pet Listings - Pass pre-loaded data */}
      <Suspense fallback={<LoadingSkeletons.PetListings />}>
        <PetListingsSection staticData={petsData} />
      </Suspense>
    </main>
  );
}
