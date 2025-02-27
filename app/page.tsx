"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";

import NewPetListings from "@/components/pets/new-listings";
import PetsFilter from "@/components/pets/pet-filter";
import PetList from "@/components/pets/pet-list";
import { PetCardSkeletons } from "@/components/ui/skeletons/pets";

import { fetchPetListings } from "@/lib/api/pets";
import { PetListing } from "@/lib/types/pets";

import heroImage from "@/public/hero-image.png";

const PetsContent = () => {
  const searchParams = useSearchParams();
  const [petListings, setPetListings] = useState<PetListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const params = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const listings = await fetchPetListings(params);
        setPetListings(listings);
      } catch (error) {
        console.error("Error fetching pet listings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params]);

  return (
    <>
      <PetsFilter />
      <hr className="my-4 text-black" />
      {isLoading ? <PetCardSkeletons /> : <PetList petListings={petListings} />}
    </>
  );
};

export default function PetsPage() {
  return (
    <>
      <Image src={heroImage} alt="Na.ruchky" priority />
      <NewPetListings />
      <div className="flex flex-col w-full py-8 px-4 bg-white rounded-[20px]">
        <Suspense fallback={<PetCardSkeletons />}>
          <PetsContent />
        </Suspense>
      </div>
    </>
  );
}
