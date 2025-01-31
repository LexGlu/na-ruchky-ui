"use client";

import Link from "next/link";
import Image from "next/image";
import { PetListing } from "@/lib/types/pets";
import formatAge from "@/lib/utils/format-age";
import { formatPrice } from "@/lib/utils/format-price";
import { getImageUrl } from "@/lib/utils/get-image-url";

import petPlaceholder from "@/public/pet_placeholder.png";
import heartIcon from "@/public/heart.svg";
import syringeIcon from "@/public/syringe.svg";
import playBtn from "@/public/play-btn.svg";

interface PetCardProps {
  listing: PetListing;
}

export default function PetCard({ listing }: PetCardProps) {
  const { id, pet, title, price } = listing;
  const {
    name,
    breed,
    sex,
    birth_date,
    short_description,
    health,
    location,
    is_vaccinated,
    profile_picture,
  } = pet;

  const imageUrl = getImageUrl(profile_picture) || petPlaceholder.src;

  return (
    <Link
      href={`/listings/${id}`}
      passHref
      className="relative group w-[270px] h-[401px] overflow-hidden rounded-xl"
    >
      <Image
        src={imageUrl}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 270px) 100vw, 270px"
        priority
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
        breed={breed}
        sex={sex}
        birthDate={birth_date}
        description={short_description}
        health={health}
        isVaccinated={is_vaccinated}
        profilePicture={imageUrl}
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
  name,
  price,
  birthDate,
  location,
  isVaccinated,
  health,
}: NormalStateProps) {
  const ageText = formatAge(birthDate ?? null);
  const nameIconSize = 16;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3 transition-opacity group-hover:opacity-0">
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[28px] font-normal truncate">{name}</h2>
          {isVaccinated && (
            <Image
              src={syringeIcon}
              alt="syringe icon"
              width={nameIconSize}
              height={nameIconSize}
            />
          )}
          {health && (
            <Image
              src={heartIcon}
              alt="heart icon"
              width={nameIconSize}
              height={nameIconSize}
            />
          )}
        </div>
        {Number(price) > 0 && (
          <span className="font-normal text-nowrap">
            ₴ {formatPrice(price)}
          </span>
        )}
      </div>
      <div className="flex justify-between text-sm mt-1">
        <div className="flex items-center bg-white py-[4px] px-[6px] rounded-lg">
          <span className="text-black font-medium">{ageText}</span>
        </div>
        <div className="flex items-center bg-white py-[4px] px-[6px] rounded-lg">
          <span className="text-black font-medium">
            {location || "Невідомо"}
          </span>
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
  breed?: string | null;
  sex?: string | null;
  birthDate?: string | null;
  description?: string | null;
  health?: string | null;
  isVaccinated?: boolean;
}
function HoverState({
  title,
  name,
  breed,
  sex,
  birthDate,
  description,
  health,
  isVaccinated,
  profilePicture,
}: HoverStateProps) {
  const descriptionPlaceholder = "Це чудо чекає саме тебе!";
  const ageText = formatAge(birthDate ?? null);
  const nameIconSize = 16;

  return (
    <div className="absolute inset-0 bg-[#717171] text-white px-4 py-5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between">
      <div>
        <h3 className="text-2xl mb-5 leading-tight">{title}</h3>
        <div className="flex gap-2.5">
          <div className="w-1/2">
            <Image
              className="rounded-[10px]"
              src={profilePicture}
              alt={name}
              width={120}
              height={120}
              priority
            />
          </div>
          <div className="flex flex-col justify-between w-1/2">
            <div className="flex items-center gap-3 mb-2">
              {health && (
                <Image
                  src={heartIcon}
                  alt="heart icon"
                  width={nameIconSize}
                  height={nameIconSize}
                />
              )}
              {isVaccinated && (
                <Image
                  src={syringeIcon}
                  alt="syringe icon"
                  width={nameIconSize}
                  height={nameIconSize}
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
            {breed || "Невідома порода"}
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
