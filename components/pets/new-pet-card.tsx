import Image from "next/image";
import Link from "next/link";

import { PetListing } from "@/lib/types/pets";
import { getImageUrl } from "@/lib/utils/get-image-url";

import petPlaceholder from "@/public/pet_placeholder.png";

interface PetCardProps {
  pet: PetListing;
}

export default function NewPetCard({ pet }: PetCardProps) {
  return (
    <Link
      href={`/listings/${pet.id}`}
      className="block relative w-[220px] h-[310px] group">
      <div className="relative h-full w-full rounded-[20px] overflow-hidden">
        <Image
          src={getImageUrl(pet.pet.profile_picture) || petPlaceholder.src}
          alt={pet.pet.name}
          fill
          sizes="220px"
          priority
          className="object-cover transition-all duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 rounded-[20px] bg-white m-1 px-4 py-3 shadow-sm">
        <h3 className="text-lg font-medium text-black truncate">
          {pet.pet.name}
        </h3>
        <p className="text-[#7D7D83] text-sm truncate">
          {pet.title || "Спеціаліст з пухнастості"}
        </p>
      </div>
    </Link>
  );
}
