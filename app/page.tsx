"use client";

import Image from "next/image";
import SearchBar from "@/components/search/search-bar";
import BreedsSection from "@/components/pets/breeds-section";
import NewPetListings from "@/components/pets/new-listings";
import PetListingsSection from "@/components/pets/pet-list/pet-listings-section";
import heroDogMascot from "@/public/images/hero-mascot-dog.svg";

const HeroSection = () => {
  return (
    <div
      className="bg-[#CCF28C] rounded-b-[17px] py-8 px-4 sm:px-12 relative text-black mb-[2px]"
      id="hero-section"
    >
      {/* Heading */}
      <div className="container mx-auto">
        <h1 className="w-full text-4xl sm:text-[84px]/[90px] font-bold text-left mb-20 sm:mb-6 ">
          Тваринки, які
          <br /> працюють на вашу
          <br /> радість
        </h1>

        <div className="relative mt-6">
          <div className="hidden sm:block absolute -top-[125px] right-26 lg:right-28 xl:right-26 z-10 pointer-events-none">
            <Image
              src={heroDogMascot}
              alt="Dog mascot with speech bubble"
              width={280}
              height={180}
              className="object-contain"
              priority
            />
          </div>

          {/* Mobile mascot - shown only on small screens */}
          <div className="sm:hidden absolute -top-16 right-0 z-10 pointer-events-none">
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

export default function PetsPage() {
  return (
    <main className="flex flex-col">
      {/* Search section with lime background */}
      <HeroSection />
      <section className="flex flex-col text-black gap-0 bg-white px-4 pt-4 rounded-[20px] mb-1">
        {/* Breeds section on white background */}
        <div className="bg-white rounded-b-[20px]">
          <div className="container mx-auto py-8">
            <BreedsSection />
          </div>
        </div>

        <NewPetListings />
      </section>

      <PetListingsSection />
    </main>
  );
}
