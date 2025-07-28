import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import PetDetail from "@/components/pets/pet-listing-detail";

import { fetchPetListing } from "@/lib/api/pets";
import { getAllPetUUIDs, getAllPetsCache } from "@/lib/cache/pets.cache";
import { FetchError } from "@/lib/types/errors";
import { validateUUID } from "@/lib/utils/validate-uuid";
import { PetListing } from "@/lib/types/pets";

// ============================================================================
// ISR CONFIGURATION
// ============================================================================

export const revalidate = 3600; // 1 hour - same as cache
export const dynamic = "force-static";

// ============================================================================
// STATIC PARAMS GENERATION
// ============================================================================

export async function generateStaticParams() {
  try {
    console.log("🔧 Generating static params for pet detail pages...");

    const petUUIDs = await getAllPetUUIDs();
    const params = petUUIDs.map((uuid) => ({ uuid }));

    console.log(`✅ Generated ${params.length} static params for pet pages`);
    return params;
  } catch (error) {
    console.error("❌ Failed to generate static params for pet pages:", error);
    // Return empty array - pages will be generated on-demand
    return [];
  }
}

// ============================================================================
// METADATA GENERATION
// ============================================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  try {
    const { uuid } = await params;

    // Validate UUID format first
    if (!validateUUID(uuid)) {
      return {
        title: "Pet Not Found",
        description: "The requested pet listing could not be found.",
      };
    }

    // Try to get pet from cache first (faster during build)
    let petListing: PetListing | null = null;

    try {
      const cachedData = await getAllPetsCache();
      petListing = cachedData.pets.find((pet) => pet.id === uuid) || null;
    } catch (cacheError) {
      console.error("❌ Failed to fetch from cache:", cacheError);
      console.warn(
        "⚠️ Cache miss during metadata generation, fetching from API"
      );
    }

    // Fallback to API if not in cache
    if (!petListing) {
      try {
        petListing = await fetchPetListing(uuid);
      } catch (apiError) {
        console.error("❌ Failed to fetch pet for metadata:", apiError);
        return {
          title: "Pet Not Found",
          description: "The requested pet listing could not be found.",
        };
      }
    }

    const { pet, title, price } = petListing;
    const speciesLabel = pet.species === "dog" ? "Dog" : "Cat";
    const breedInfo = pet.breed_name ? ` - ${pet.breed_name}` : "";
    const ageInfo = pet.birth_date ? ` - ${calculateAge(pet.birth_date)}` : "";
    const locationInfo = pet.location ? ` in ${pet.location}` : "";
    const priceInfo = price ? ` - ₴${price}` : "";

    const description = pet.short_description
      ? `${pet.short_description.slice(0, 150)}...`
      : `Meet this adorable ${pet.species}${breedInfo}${ageInfo}${locationInfo}. Find your perfect companion today.`;

    // Get profile image for metadata
    const profileImageId = pet.profile_picture;
    const profileImage = pet.images?.find((img) => img.id === profileImageId);
    const imageUrl = profileImage?.image || pet.images?.[0]?.image;

    return {
      title: `${title} - ${speciesLabel} for Adoption${breedInfo}${priceInfo}`,
      description,
      keywords: [
        pet.species,
        pet.breed_name || "mixed breed",
        "pet adoption",
        "pet directory",
        pet.location || "Ukraine",
        pet.sex === "m" ? "male" : pet.sex === "f" ? "female" : "unknown sex",
      ].filter(Boolean),
      openGraph: {
        title: `${title} - ${speciesLabel} for Adoption`,
        description,
        images: imageUrl
          ? [
              {
                url: imageUrl,
                alt: `${title} - ${speciesLabel} photo`,
                width: 800,
                height: 600,
              },
            ]
          : undefined,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} - ${speciesLabel}`,
        description: description.slice(0, 200),
        images: imageUrl ? [imageUrl] : undefined,
      },
      alternates: {
        canonical: `/listings/${uuid}`,
      },
      other: {
        "article:author": "Na.Ruchky",
        "article:section": "Pet Listings",
        "article:tag": [
          pet.species,
          pet.breed_name,
          pet.location,
          pet.is_vaccinated ? "vaccinated" : null,
          pet.is_hypoallergenic ? "hypoallergenic" : null,
        ]
          .filter(Boolean)
          .join(", "),
      },
    };
  } catch (error: unknown) {
    console.error("❌ Failed to generate metadata for pet listing:", error);
    return {
      title: "Pet Listing Not Found",
      description: "The requested pet listing could not be found.",
    };
  }
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

interface PetPageProps {
  params: Promise<{ uuid: string }>;
}

export default async function PetPage({ params }: PetPageProps) {
  const { uuid } = await params;

  // Validate UUID format before fetching
  if (!validateUUID(uuid)) {
    console.warn(`⚠️ Invalid UUID format: ${uuid}`);
    notFound();
  }

  try {
    // Try cache first for better performance during static generation
    let petListing: PetListing | null = null;

    try {
      const cachedData = await getAllPetsCache();
      petListing = cachedData.pets.find((pet) => pet.id === uuid) || null;

      if (petListing) {
        console.log(`✅ Pet ${uuid} loaded from cache`);
      }
    } catch (cacheError) {
      console.error("❌ Failed to fetch from cache:", cacheError);
      console.warn("⚠️ Cache miss, falling back to API fetch");
    }

    // Fallback to API if not in cache
    if (!petListing) {
      try {
        petListing = await fetchPetListing(uuid);
        console.log(`✅ Pet ${uuid} loaded from API`);
      } catch (apiError) {
        if (apiError instanceof FetchError && apiError.status === 404) {
          console.warn(`⚠️ Pet ${uuid} not found`);
          notFound();
        }
        throw apiError;
      }
    }

    return (
      <Suspense fallback={<PetDetailLoadingSkeleton />}>
        <PetDetail listing={petListing} />
      </Suspense>
    );
  } catch (error) {
    console.error(`❌ Error loading pet ${uuid}:`, error);

    if (error instanceof FetchError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate age from birth date for metadata
 */
function calculateAge(birthDate: string): string {
  try {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));

    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} old`;
    } else {
      const years = Math.floor(diffMonths / 12);
      const remainingMonths = diffMonths % 12;

      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? "s" : ""} old`;
      } else {
        return `${years} year${
          years !== 1 ? "s" : ""
        } ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""} old`;
      }
    }
  } catch (error) {
    console.error("❌ Error calculating age:", error);
    return "Age unknown";
  }
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function PetDetailLoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 text-black bg-white rounded-[20px] animate-pulse">
      {/* Back button skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
        <div className="w-32 h-4 bg-gray-200 rounded"></div>
      </div>

      {/* Hero section skeleton */}
      <div className="bg-gray-100 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-200 p-6 md:p-8 md:flex gap-8 items-center">
          {/* Image skeleton */}
          <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
            <div className="w-48 h-48 bg-gray-300 rounded-full"></div>
          </div>

          {/* Content skeleton */}
          <div className="md:w-2/3 space-y-4">
            <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
            <div className="w-3/4 h-8 bg-gray-300 rounded"></div>
            <div className="space-y-2">
              <div className="w-1/2 h-4 bg-gray-300 rounded"></div>
              <div className="w-1/3 h-4 bg-gray-300 rounded"></div>
              <div className="w-1/4 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>

        {/* Description skeleton */}
        <div className="p-6 md:p-8 space-y-4">
          <div className="w-1/4 h-6 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* CTA section skeleton */}
        <div className="border-t border-gray-100 p-6 md:p-8 bg-gray-50 space-y-4">
          <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
          <div className="w-full h-4 bg-gray-200 rounded"></div>
          <div className="w-40 h-12 bg-gray-300 rounded-lg"></div>
        </div>

        {/* Details grid skeleton */}
        <div className="border-t border-gray-100 p-6 md:p-8">
          <div className="w-1/4 h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
