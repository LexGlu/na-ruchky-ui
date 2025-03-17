"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getBreed } from "@/lib/services/breeds-service";
import { getImageUrl } from "@/lib/utils/get-image-url";
import { Breed } from "@/lib/types/breeds";
import { PawPrint, ArrowLeft, Clock, Weight, MapPin } from "lucide-react";

function BreedDetailContent() {
  const params = useParams();
  const [breed, setBreed] = useState<Breed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBreed() {
      try {
        if (!params.id) {
          throw new Error("Breed ID is required");
        }

        const data = await getBreed(params.id as string);
        setBreed(data);
      } catch (err) {
        console.error("Error fetching breed:", err);
        setError("Не вдалося завантажити інформацію про породу");
      } finally {
        setLoading(false);
      }
    }

    fetchBreed();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-lime-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !breed) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Породу не знайдено</h1>
        <p className="text-gray-500 mb-8">
          {error || "Ця порода не існує або була видалена"}
        </p>
        <Link
          href="/breeds"
          className="inline-flex items-center gap-2 bg-lime-100 hover:bg-lime-200 text-lime-800 px-4 py-2 rounded-full transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Повернутися до всіх порід
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 text-black bg-white rounded-[20px]">
      {/* Rest of your component remains the same */}
      <Link
        href="/breeds"
        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Назад до всіх порід
      </Link>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Hero section with image and basic info */}
        <div className="bg-[#E6F4FA] p-6 md:p-8 md:flex gap-8 items-center">
          <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
            <div className="relative w-48 h-48 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md">
              {breed.image_url ? (
                <Image
                  src={getImageUrl(breed.image_url)}
                  alt={breed.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 192px, 240px"
                  priority
                />
              ) : (
                <PawPrint
                  className="h-24 w-24 text-gray-300"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>

          <div className="md:w-2/3">
            <div className="flex items-center mb-2">
              <span className="bg-lime-100 text-lime-800 text-xs font-medium rounded-full px-3 py-1">
                {breed.species === "dog" ? "Собака" : "Кіт"}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{breed.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
              {breed.life_span && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span>Тривалість життя: {breed.life_span}</span>
                </div>
              )}

              {breed.weight && (
                <div className="flex items-center gap-2">
                  <Weight className="h-5 w-5 text-gray-400" />
                  <span>Вага: {breed.weight}</span>
                </div>
              )}

              {breed.origin && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span>Походження: {breed.origin}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description section */}
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-4">Про породу</h2>
          {breed.description ? (
            <div className="prose max-w-none">
              <p>{breed.description}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">Опис відсутній</p>
          )}
        </div>

        {/* Find pets section */}
        <div className="border-t border-gray-100 p-6 md:p-8 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">
            Знайти тварин цієї породи
          </h2>
          <Link
            href={`/search?breed=${encodeURIComponent(breed.name)}&species=${
              breed.species
            }`}
            className="inline-flex items-center justify-center bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Переглянути оголошення
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BreedDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-16 px-4 flex justify-center">
          <div className="animate-spin w-8 h-8 border-3 border-lime-500 border-t-transparent rounded-full"></div>
        </div>
      }>
      <BreedDetailContent />
    </Suspense>
  );
}
