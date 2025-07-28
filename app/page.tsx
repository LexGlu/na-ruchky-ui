import Image from "next/image";
import SearchBar from "@/components/search/search-bar";
import BreedsSection from "@/components/pets/breeds-section";
import NewPetListings from "@/components/pets/new-listings";
import PetListingsSection from "@/components/pets/pet-list/pet-listings-section";
import heroDogMascot from "@/public/images/hero-mascot-dog.svg";
import { Suspense } from "react";
import { Metadata } from "next";

import { getAllPetsCache, getPetsMetadata } from "@/lib/cache/pets.cache";
import { PetListing } from "@/lib/types/pets";

// ============================================================================
// ISR CONFIGURATION
// ============================================================================

export const revalidate = 3600; // 1 hour
export const dynamic = "force-static";

// ============================================================================
// METADATA GENERATION
// ============================================================================

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { count, speciesBreakdown } = await getPetsMetadata();

    return {
      title: `Find Your Perfect Companion`,
      description: `Discover your perfect pet from ${count} available pets including ${speciesBreakdown.dog} dogs and ${speciesBreakdown.cat} cats. Find your ideal companion today.`,
      keywords: [
        "pets",
        "pet adoption",
        "dogs",
        "cats",
        "pet directory",
        "find pets",
        "pet listings",
        `${count} pets`,
      ],
      openGraph: {
        title: `Na.Ruchky - ${count} Pets Available`,
        description: `Browse ${count} pets including ${speciesBreakdown.dog} dogs and ${speciesBreakdown.cat} cats. Find your perfect companion.`,
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
    return {
      title: "Pet Directory - Find Your Perfect Companion",
      description:
        "Discover thousands of pets and find your perfect companion through our comprehensive pet directory.",
    };
  }
}

// ============================================================================
// HERO SECTION COMPONENT
// ============================================================================

const HeroSection = () => {
  return (
    <div
      className="bg-[#CCF28C] rounded-b-[17px] py-8 px-4 sm:px-12 relative text-black mb-[2px]"
      id="hero-section"
    >
      {/* Heading */}
      <div className="container flex flex-col mx-auto gap-0 sm:gap-[100px]">
        <h1 className="w-2/3 text-4xl sm:text-[96px]/[82px] font-bold text-left">
          Тваринки, які
          <br /> працюють
          <br /> на вашу радість
        </h1>

        <div className="relative mt-6">
          <div className="hidden sm:block absolute -top-[346px] right-26 lg:right-28 xl:right-22 z-10 pointer-events-none">
            <Image
              src={heroDogMascot}
              alt="Dog mascot with speech bubble"
              width={404}
              height={386.7}
              className="object-contain"
              priority
            />
          </div>

          {/* Mobile mascot - shown only on small screens */}
          <div className="sm:hidden absolute -top-[131px] -right-3 z-10 pointer-events-none">
            <Image
              src={heroDogMascot}
              alt="Dog mascot with speech bubble"
              width={180}
              height={120}
              className="object-contain"
              priority
            />
          </div>

          {/* Search component */}
          <SearchBar />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PAGE COMPONENT PROPS INTERFACE
// ============================================================================

interface PetsPageProps {
  initialPetsData?: {
    pets: PetListing[];
    totalCount: number;
    speciesCounts: {
      all: number;
      dog: number;
      cat: number;
    };
  };
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function PetsPage() {
  // Fetch initial data at build time
  let initialPetsData: PetsPageProps["initialPetsData"];

  try {
    const cachedData = await getAllPetsCache();
    initialPetsData = {
      pets: cachedData.pets,
      totalCount: cachedData.totalCount,
      speciesCounts: cachedData.speciesCounts,
    };

    console.log(
      `✅ Loaded ${initialPetsData.pets.length} pets for static generation`
    );
  } catch (error) {
    console.error("❌ Error loading pets cache for static generation:", error);
    // Fallback to undefined - components will handle client-side loading
    initialPetsData = undefined;
  }

  return (
    <main className="flex flex-col">
      {/* Search section with lime background */}
      <HeroSection />

      <section className="flex flex-col text-black gap-0 bg-white px-4 pt-4 rounded-[20px] mb-1">
        {/* Breeds section on white background */}
        <div className="bg-white rounded-b-[20px]">
          <div className="container mx-auto py-8">
            <Suspense fallback={<BreedsLoadingSkeleton />}>
              <BreedsSection />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<NewPetListingsLoadingSkeleton />}>
          <NewPetListings />
        </Suspense>
      </section>

      {/* Pet listings section with static data */}
      <Suspense fallback={<PetListingsLoadingSkeleton />}>
        <PetListingsSection initialData={initialPetsData} />
      </Suspense>

      {/* Development info in dev mode */}
      {process.env.NODE_ENV === "development" && initialPetsData && (
        <div className="container mx-auto mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">
            ISR Development Info
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              Static pets loaded: <strong>{initialPetsData.pets.length}</strong>
            </p>
            <p>
              Total count: <strong>{initialPetsData.totalCount}</strong>
            </p>
            <p>
              Dogs: <strong>{initialPetsData.speciesCounts.dog}</strong> | Cats:{" "}
              <strong>{initialPetsData.speciesCounts.cat}</strong>
            </p>
            <p>
              ISR revalidation: <strong>Every 1 hour</strong>
            </p>
            <p>
              Static generation: <strong>Build time + ISR</strong>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

// ============================================================================
// LOADING SKELETONS
// ============================================================================

function BreedsLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="flex gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-[215px] h-[297px] bg-gray-200 rounded-[20px] flex-shrink-0"
          ></div>
        ))}
      </div>
    </div>
  );
}

function NewPetListingsLoadingSkeleton() {
  return (
    <div className="container bg-white rounded-[20px] px-4 my-1 pb-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="flex gap-2 overflow-hidden">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="w-[200px] h-[280px] bg-gray-200 rounded-lg flex-shrink-0"
          ></div>
        ))}
      </div>
    </div>
  );
}

function PetListingsLoadingSkeleton() {
  return (
    <div className="flex flex-col w-full py-8 px-4 md:px-6 bg-white rounded-[20px] shadow-sm animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="w-full h-[401px] bg-gray-200 rounded-[20px]"
          ></div>
        ))}
      </div>
    </div>
  );
}
