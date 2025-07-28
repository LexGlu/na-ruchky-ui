import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BreedsClient } from "@/components/breeds/breeds.client";
import { BreedsLoading } from "@/components/breeds/breeds.loading";
import { getAllBreedsCache, getBreedsMetadata } from "@/lib/cache/breeds.cache";
import { Species } from "@/lib/types/pets";

export const revalidate = 3600;
export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { count } = await getBreedsMetadata();

    return {
      title: `All Pet Breeds - ${count} Available | Pet Directory`,
      description: `Discover ${count} pet breeds including dogs and cats. Browse through our complete directory with instant search and filtering.`,
      keywords: [
        "pet breeds",
        "dog breeds",
        "cat breeds",
        "pet adoption",
        "breed directory",
      ],
      openGraph: {
        title: `Complete Pet Breeds Directory - ${count} Breeds`,
        description: `Browse through ${count} carefully curated pet breeds with instant search and filtering.`,
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
    console.error("Failed to generate metadata for breeds:", error);
    return {
      title: "All Pet Breeds | Pet Directory",
      description:
        "Discover all available pet breeds with detailed information and instant search.",
    };
  }
}

interface BreedsPageProps {
  searchParams?: Promise<{
    species?: Species | "all";
    search?: string;
    page?: string;
  }>;
}

export default async function BreedsPage({ searchParams }: BreedsPageProps) {
  const params = await searchParams;
  const species = params?.species || "all";
  const initialSearch = params?.search || "";
  const page = Math.max(1, parseInt(params?.page || "1", 10));

  const breedsData = await getAllBreedsCache();

  return (
    <div className="container mx-auto py-8 px-4 lg:px-6 text-black bg-white rounded-[20px]">
      <div className="flex items-center mb-6">
        <Link
          href="/"
          className="mr-4 p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">All Pet Breeds</h1>
          <p className="text-sm text-gray-500 mt-1">
            {breedsData.totalCount} breeds • Updated every hour
          </p>
        </div>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-800 mb-2">Development Info</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              Total breeds: <strong>{breedsData.breeds.length}</strong>
            </p>
            <p>
              Dogs: <strong>{breedsData.dogCount}</strong> | Cats:{" "}
              <strong>{breedsData.catCount}</strong>
            </p>
            <p>
              ISR revalidation: <strong>Every 1 hour</strong>
            </p>
            <p>
              Filtering/pagination: <strong>Client-side (instant)</strong>
            </p>
          </div>
        </div>
      )}

      <Suspense fallback={<BreedsLoading />}>
        <BreedsClient
          allBreeds={breedsData.breeds}
          totalCount={breedsData.totalCount}
          speciesCounts={{
            all: breedsData.totalCount,
            dog: breedsData.dogCount,
            cat: breedsData.catCount,
          }}
          initialSpecies={species}
          initialSearch={initialSearch}
          initialPage={page}
          itemsPerPage={20}
        />
      </Suspense>

      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500">
          <p>Data refreshed automatically every hour via ISR</p>
          <p className="mt-1">
            Last updated: <time>{new Date().toLocaleString()}</time>
          </p>
        </div>
      </footer>
    </div>
  );
}
