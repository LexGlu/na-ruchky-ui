import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBreed } from "@/lib/services/breeds-service";
import { getAllBreedsCache } from "@/lib/cache/breeds.cache";
import { getImageUrl } from "@/lib/utils/get-image-url";
import { PawPrint, ArrowLeft, Clock, Weight, MapPin } from "lucide-react";
import { NotFoundError } from "@/lib/api/errors";

import { Breed } from "@/lib/types/breeds";

export const revalidate = 86400;

export async function generateStaticParams() {
  try {
    const { breeds } = await getAllBreedsCache();
    return breeds.map((breed) => ({ id: breed.id }));
  } catch (error) {
    console.error("Failed to generate static params for breeds:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const breed = await getBreed(id);
    const speciesLabel = breed.species === "dog" ? "Dog" : "Cat";

    return {
      title: `${breed.name} - ${speciesLabel} Breed Information`,
      description: breed.description
        ? `Learn about ${breed.name}, a ${
            breed.species
          } breed. ${breed.description.slice(0, 150)}...`
        : `Discover everything about the ${breed.name} ${breed.species} breed including characteristics, care tips, and more.`,
      openGraph: {
        title: `${breed.name} - ${speciesLabel} Breed`,
        description: breed.description || `Learn about the ${breed.name} breed`,
        images: breed.image_url
          ? [
              {
                url: getImageUrl(breed.image_url),
                alt: `${breed.name} breed photo`,
                width: 1200,
                height: 630,
              },
            ]
          : undefined,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${breed.name} - ${speciesLabel} Breed`,
        description:
          breed.description?.slice(0, 200) ||
          `Learn about the ${breed.name} breed`,
        images: breed.image_url ? [getImageUrl(breed.image_url)] : undefined,
      },
      alternates: {
        canonical: `/breeds/${breed.id}`,
      },
      other: {
        "article:author": "Na.Ruchky",
        "article:section": "Pet Breeds",
        "article:tag": [breed.name, breed.species, breed.origin]
          .filter(Boolean)
          .join(", "),
      },
    };
  } catch (error: unknown) {
    console.error("Failed to generate metadata for breed:", error);
    return {
      title: "Breed Not Found",
      description: "The requested breed information could not be found.",
    };
  }
}

interface BreedDetailPageProps {
  params: Promise<{ id: string }>;
}

const BreedImage = ({ breed }: { breed: Breed }) => (
  <div className="relative w-48 h-48 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md">
    {breed.image_url ? (
      <Image
        src={getImageUrl(breed.image_url)}
        alt={`${breed.name} breed`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 192px, 240px"
        priority
      />
    ) : (
      <PawPrint className="h-24 w-24 text-gray-300" aria-hidden="true" />
    )}
  </div>
);

const BreedStats = ({ breed }: { breed: Breed }) => {
  const stats = [
    { icon: Clock, label: "Lifespan", value: breed.life_span },
    { icon: Weight, label: "Weight", value: breed.weight },
    { icon: MapPin, label: "Origin", value: breed.origin },
  ].filter((stat) => stat.value);

  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-gray-400" />
          <span>
            {label}: {value}
          </span>
        </div>
      ))}
    </div>
  );
};

const BreedDetailsGrid = ({ breed }: { breed: Breed }) => {
  const details = [
    { label: "Origin", value: breed.origin },
    { label: "Life Span", value: breed.life_span },
    { label: "Weight Range", value: breed.weight },
  ].filter((detail) => detail.value);

  if (details.length === 0) return null;

  return (
    <div className="border-t border-gray-100 p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-4">Breed Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {details.map(({ label, value }) => (
          <div key={label} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{label}</h3>
            <p className="text-gray-600">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default async function BreedDetailPage({
  params,
}: BreedDetailPageProps) {
  const { id } = await params;

  try {
    const breed = await getBreed(id);
    const speciesLabel = breed.species === "dog" ? "Dog" : "Cat";

    return (
      <div className="container mx-auto py-8 px-4 text-black bg-white rounded-[20px]">
        <Link
          href="/breeds"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all breeds
        </Link>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Hero Section */}
          <div className="bg-[#E6F4FA] p-6 md:p-8 md:flex gap-8 items-center relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <Suspense
                fallback={
                  <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
                }
              >
                {/* Action buttons placeholder */}
              </Suspense>
            </div>

            <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
              <BreedImage breed={breed} />
            </div>

            <div className="md:w-2/3">
              <div className="flex items-center mb-2">
                <span className="bg-lime-100 text-lime-800 text-xs font-medium rounded-full px-3 py-1">
                  {speciesLabel}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{breed.name}</h1>
              <BreedStats breed={breed} />
            </div>
          </div>

          {/* Description */}
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-4">About the Breed</h2>
            {breed.description ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {breed.description}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No description available</p>
            )}
          </div>

          {/* Find Pets CTA */}
          <div className="border-t border-gray-100 p-6 md:p-8 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">
              Find {breed.name} pets
            </h2>
            <p className="text-gray-600 mb-4">
              Looking for {breed.name} pets? Browse our available listings and
              find your perfect companion.
            </p>
            <Link
              href={`/search?breed=${encodeURIComponent(breed.name)}&species=${
                breed.species
              }`}
              className="inline-flex items-center justify-center bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View Available Pets
            </Link>
          </div>

          <BreedDetailsGrid breed={breed} />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }
}
