"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import NewPetListings from "@/components/pets/new-listings";
import PetsFilter from "@/components/pets/pet-filter";
import PetList from "@/components/pets/pet-list";
import ErrorMessage from "@/components/ui/error-message";
import { PetCardSkeletons } from "@/components/ui/skeletons/pets";

import { usePetListings } from "@/hooks/use-pets-listings";

import heroImage from "@/public/hero-image.png";

const PetsContent = () => {
  const searchParams = useSearchParams();
  const { petListings, isLoading, error } = usePetListings(searchParams);

  return (
    <>
      <PetsFilter />
      <hr className="my-4 text-black" />
      {error && <ErrorMessage error="" />}
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
