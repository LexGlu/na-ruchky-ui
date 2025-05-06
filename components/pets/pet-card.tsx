"use client";

import Link from "next/link";
import Image from "next/image";
import { PetListing } from "@/lib/types/pets";
import formatAge from "@/lib/utils/format-age";
import { formatPrice } from "@/lib/utils/format-price";
import { getImageUrl } from "@/lib/utils/get-image-url";
import { useState } from "react";

import petPlaceholder from "@/public/pet_placeholder.png";

import heartIcon from "@/public/heart.svg";
import syringeIcon from "@/public/syringe.svg";
import playBtn from "@/public/play-btn.svg";
import petCardLoader from "@/public/icons/pet-card-loader.svg";

interface PetCardProps {
  listing: PetListing;
  isDouble?: boolean;
  className?: string;
}

function Skeleton({ isDouble }: { isDouble?: boolean }) {
  return (
    <div
      className={`absolute inset-0 bg-gray-200 animate-pulse rounded-xl overflow-hidden ${
        isDouble ? "h-full" : ""
      }`}
    >
      {/* Skeleton Loader (paw icon) */}
      <div className="h-full w-full flex items-center justify-center">
        <Image
          src={petCardLoader}
          alt="pet card loader"
          width={100}
          height={100}
        />
      </div>
    </div>
  );
}

export default function PetCard({
  listing,
  isDouble = false,
  className = "",
}: PetCardProps) {
  const { id, pet, title, price } = listing;
  const {
    name,
    breed_name,
    sex,
    birth_date,
    short_description,
    health,
    location,
    is_vaccinated,
    profile_picture,
    images = [],
  } = pet;

  // Find the profile image from the pet's image array
  const profileImageId = profile_picture;
  const profileImage = images.find((img) => img.id === profileImageId);

  // Determine the image URL - first try profile image, then first image from array, then fallback to placeholder
  const imageUrl = profileImage
    ? getImageUrl(profileImage.image)
    : images.length > 0
    ? getImageUrl(images[0].image)
    : petPlaceholder.src;

  const [isLoadingImage, setIsLoadingImage] = useState(true);

  return (
    <Link
      href={`/listings/${id}`}
      passHref
      className={`flex flex-col relative group ${
        isDouble ? "sm:col-span-2 h-[401px]" : "w-full sm:w-[270px] h-[401px]"
      } overflow-hidden rounded-xl ${className}`}
    >
      {isLoadingImage && <Skeleton isDouble={isDouble} />}
      <Image
        src={imageUrl}
        alt={name}
        fill
        className={`object-cover ${
          isLoadingImage ? "opacity-0" : "opacity-100"
        }`}
        sizes={
          isDouble
            ? "(max-width: 640px) 100vw, 540px"
            : "(max-width: 640px) 100vw, 270px"
        }
        priority
        onLoadingComplete={() => setIsLoadingImage(false)}
      />

      <NormalState
        name={name}
        price={price}
        birthDate={birth_date}
        location={location}
        isVaccinated={is_vaccinated}
        health={health}
      />

      <HoverState
        title={title}
        name={name}
        breedName={breed_name}
        sex={sex}
        birthDate={birth_date}
        description={short_description}
        health={health}
        isVaccinated={is_vaccinated}
        profilePicture={imageUrl}
        isDouble={isDouble}
      />
    </Link>
  );
}

/**
 * Subcomponent for the normal (non-hover) state content.
 */
interface NormalStateProps {
  name: string;
  price?: string | null;
  birthDate?: string | null;
  location?: string | null;
  isVaccinated?: boolean;
  health?: string | null;
}

function NormalState({
  price,
  birthDate,
  location,
  isVaccinated,
  health,
}: NormalStateProps) {
  const ageText = formatAge(birthDate ?? null);
  const petCardIconWidth = 24;
  const petCardIconHeight = 21;

  return (
    <div className="flex flex-col justify-between h-full relative">
      {/* Top gradient overlay covering entire upper half */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-black/30 to-transparent z-10 group-hover:opacity-0" />

      {/* Icons positioned within the top gradient */}
      <div className="flex items-center justify-end gap-1 p-3 text-white z-20 relative transition-opacity group-hover:opacity-0">
        {health && (
          <Image
            src={heartIcon}
            alt="heart icon"
            width={petCardIconWidth}
            height={petCardIconHeight}
          />
        )}
        {isVaccinated && (
          <Image
            src={syringeIcon}
            alt="syringe icon"
            width={petCardIconWidth}
            height={petCardIconHeight}
          />
        )}
      </div>

      {/* Bottom gradient overlay covering entire lower half */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent z-10 group-hover:opacity-0" />

      {/* Content positioned within the bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-20 transition-opacity group-hover:opacity-0">
        <div className="flex text-sm mt-1 gap-[6px] flex-wrap">
          <div className="flex items-center bg-white py-[4px] px-[6px] rounded-2xl">
            <span className="text-black">{ageText}</span>
          </div>
          <div className="flex items-center bg-transparent py-[4px] px-[6px] rounded-2xl border border-white">
            <span className="text-white">{location || "Київ"}</span>
          </div>
          {price && (
            <div className="flex items-center bg-transparent py-[4px] px-[6px] rounded-2xl border border-white">
              <span className="text-white">₴ {formatPrice(price)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Subcomponent for the hover overlay content.
 */
interface HoverStateProps {
  title: string;
  name: string;
  profilePicture: string;
  breedName?: string | null;
  sex?: string | null;
  birthDate?: string | null;
  description?: string | null;
  health?: string | null;
  isVaccinated?: boolean;
  isDouble?: boolean;
}
function HoverState({
  title,
  name,
  breedName,
  sex,
  birthDate,
  description,
  health,
  isVaccinated,
  profilePicture,
  isDouble = false,
}: HoverStateProps) {
  const descriptionPlaceholder = "Це чудо чекає саме тебе!";
  const ageText = formatAge(birthDate ?? null);
  const petCardIconWidth = 24;
  const petCardIconHeight = 21;

  return (
    <div className="absolute inset-0 bg-[#717171] text-white px-4 py-5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between">
      <div>
        <h3 className="text-2xl mb-5 leading-tight">{title}</h3>
        <div className={`flex gap-2.5 ${isDouble ? "items-start" : ""}`}>
          <div className={isDouble ? "w-1/3" : "w-1/2"}>
            <Image
              className="rounded-[10px]"
              src={profilePicture}
              alt={name}
              width={isDouble ? 180 : 120}
              height={isDouble ? 180 : 120}
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          <div
            className={`flex flex-col justify-between ${
              isDouble ? "w-2/3" : "w-1/2"
            }`}
          >
            <div className="flex items-center gap-1 mb-2">
              {health && (
                <Image
                  src={heartIcon}
                  alt="heart icon"
                  width={petCardIconWidth}
                  height={petCardIconHeight}
                />
              )}
              {isVaccinated && (
                <Image
                  src={syringeIcon}
                  alt="syringe icon"
                  width={petCardIconWidth}
                  height={petCardIconHeight}
                />
              )}
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-2xl">{name}</span>
              <div className="flex flex-col gap-1">
                <span className="text-[#D5D5D5] leading-4">{ageText}</span>
                <span className="text-[#D5D5D5] leading-4">
                  {sex === "f" ? "дівчинка" : "хлопчик"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <hr className="text-white opacity-25 my-4" />
        <div className="flex flex-col gap-1">
          <span className="font-light text-white">
            {breedName || "Невідома порода"}
          </span>
          <span className="font-light text-white">
            {description || descriptionPlaceholder}
          </span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3">
        <button
          type="button"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70"
          aria-label="Learn more"
        >
          <Image src={playBtn} alt="play button" width={20} height={20} />
        </button>
      </div>
    </div>
  );
}
