import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { PetListing } from "@/lib/types/pets";
import { getImageUrl } from "@/lib/utils/get-image-url";
import formatAge from "@/lib/utils/format-age";

import petPlaceholder from "@/public/pet_placeholder.png";
import petCardLoader from "@/public/icons/pet-card-loader.svg";

interface PetCardProps {
  pet: PetListing;
}

export default function EnhancedPetCard({ pet }: PetCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const profileImageId = pet.pet.profile_picture;
  const profileImage = pet.pet.images?.find((img) => img.id === profileImageId);
  const imageUrl = profileImage
    ? getImageUrl(profileImage.image)
    : pet.pet.images && pet.pet.images.length > 0
    ? getImageUrl(pet.pet.images[0].image)
    : petPlaceholder.src;

  const rawAge = pet.pet.birth_date ? formatAge(pet.pet.birth_date) : null;
  const ageLabel = rawAge ? rawAge.toUpperCase() : null;
  const location = pet.pet.location ? pet.pet.location.toUpperCase() : null;

  return (
    <Link
      href={`/listings/${pet.id}`}
      className="block relative w-[214px] h-[311px] group rounded-[20px] overflow-hidden"
      aria-label={pet.pet.name}
    >
      {/* Image */}
      <div className="absolute inset-0">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <Image src={petCardLoader} alt="loading" width={64} height={64} />
          </div>
        )}
        <Image
          src={imageUrl}
          alt={pet.pet.name}
          fill
          sizes="214px"
          className={`object-cover transition-opacity duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          priority
        />
        {/* Gradient bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[140px] bg-gradient-to-b from-transparent to-black/90" />
      </div>

      {/* Badges */}
      <div className="absolute left-4 bottom-4 flex flex-wrap items-center gap-1.5">
        {ageLabel && (
          <span className="px-1.5 py-[3px] rounded-[9px] text-[12px] leading-[15px] font-normal bg-white text-black border border-white">
            {ageLabel}
          </span>
        )}
        {location && (
          <span className="px-2 py-[3px] rounded-[9px] text-[12px] leading-[15px] font-normal text-white border border-white">
            {location}
          </span>
        )}
      </div>
    </Link>
  );
}
