"use client";

import HeroBanner from "@/components/common/hero-banner";
import NewPetListings from "@/components/pets/new-listings";
import PetListingsSection from "@/components/pets/pet-list/pet-listings-section";

import heroImage from "@/public/hero-image.png";

export default function PetsPage() {
  return (
    <>
      <HeroBanner imageSrc={heroImage} imageAlt="Na.ruchky" />
      <NewPetListings />
      <PetListingsSection />
    </>
  );
}
