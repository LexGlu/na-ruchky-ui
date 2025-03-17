"use client";

import Image from "next/image";

import SearchBar from "@/components/search/search-bar";
import BreedsSection from "@/components/pets/breeds-section";
import NewPetListings from "@/components/pets/new-listings";
import PetListingsSection from "@/components/pets/pet-list/pet-listings-section";

import dog1 from "@/public/images/dog-1.png";
import dog2 from "@/public/images/dog-2.png";
import paw from "@/public/icons/paw.svg";

export default function PetsPage() {
  return (
    <main className="flex flex-col">
      {/* Hero section with search and breeds - no margin/padding between this and following sections */}
      <section className="flex flex-col text-black gap-0 bg-white px-4 pt-4 rounded-[20px]">
        {/* Search section with lime background */}
        <div className="bg-[#CCF28C] rounded-[17px] pt-8 pb-12 px-4 relative">
          <Image
            src={paw}
            alt=""
            className="absolute top-5 left-4 w-[35px] h-[35px]"
            aria-hidden="true"
          />

          <Image
            src={paw}
            alt=""
            className="absolute top-4 left-24 rotate-45 w-[35px] h-[35px]"
            aria-hidden="true"
          />

          <Image
            src={paw}
            alt=""
            className="absolute top-20 left-12 rotate-30 w-[35px] h-[35px]"
            aria-hidden="true"
          />

          <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-center mb-2">
              Знайдіть свого працівника щастя
            </h1>
            <h2 className="text-center mb-8 text-lg">
              Знайдіть свого працівника щастя
            </h2>

            {/* Search bar with dog illustrations */}
            <div className="relative">
              <SearchBar />
            </div>

            {/* Dog illustrations */}
            <div className="hidden md:block absolute -bottom-5 right-4">
              <div className="flex items-end">
                <div className="h-32 w-32 relative">
                  <Image
                    src={dog1}
                    alt="Dog"
                    fill
                    className="object-contain"
                    aria-hidden="true"
                  />
                </div>
                <div className="h-27 w-27 relative -ml-4 bottom-1">
                  <Image
                    src={dog2}
                    alt="Dog"
                    fill
                    className="object-contain"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breeds section on white background */}
        <div className="bg-white rounded-b-[20px]">
          <div className="container mx-auto py-8">
            <BreedsSection />
          </div>
        </div>
      </section>

      {/* Pet listings sections - directly adjacent with no margin/padding */}
      <div className="mt-0">
        <NewPetListings />
      </div>
      <div className="mt-0">
        <PetListingsSection />
      </div>
    </main>
  );
}
