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
      className={`absolute inset-0 bg-gray-200 animate-pulse rounded-[20px] overflow-hidden ${
        isDouble ? "h-full" : ""
      }`}
    >
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
    breed_name,
    sex,
    birth_date,
    short_description,
    location,
    is_vaccinated,
    is_hypoallergenic,
    profile_picture,
    images = [],
  } = pet;

  const profileImageId = profile_picture;
  const profileImage = images.find((img) => img.id === profileImageId);

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
      } overflow-hidden rounded-[20px] ${className}`}
    >
      {isLoadingImage && <Skeleton isDouble={isDouble} />}
      <Image
        src={imageUrl}
        alt={"pet profile picture"}
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
        price={price}
        birthDate={birth_date}
        location={location}
        isVaccinated={is_vaccinated}
        isHypoallergenic={is_hypoallergenic}
      />

      <HoverState
        title={title}
        profilePicture={imageUrl}
        breedName={breed_name}
        sex={sex}
        birthDate={birth_date}
        description={short_description}
        isVaccinated={is_vaccinated}
        isHypoallergenic={is_hypoallergenic}
        price={price ? formatPrice(price) : null}
        isDouble={isDouble}
      />
    </Link>
  );
}

interface NormalStateProps {
  price?: string | null;
  birthDate?: string | null;
  location?: string | null;
  isVaccinated?: boolean;
  isHypoallergenic?: boolean;
}

function NormalState({
  price,
  birthDate,
  location,
  isVaccinated,
  isHypoallergenic,
}: NormalStateProps) {
  const ageText = formatAge(birthDate ?? null);
  const petCardIconWidth = 24;
  const petCardIconHeight = 21;

  return (
    <div className="flex flex-col justify-between h-full relative">
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-black/40 to-transparent z-8 group-hover:opacity-0" />
      <div className="flex items-center justify-end gap-1 p-3 text-white z-[9] relative transition-opacity group-hover:opacity-0">
        {isHypoallergenic && (
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
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent z-8 group-hover:opacity-0" />
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

interface HoverStateProps {
  title: string;
  profilePicture: string;
  breedName?: string | null;
  sex?: string | null;
  birthDate?: string | null;
  description?: string | null;
  isVaccinated?: boolean;
  isHypoallergenic?: boolean;
  price?: string | null;
  isDouble?: boolean;
}

function HoverState({
  title,
  profilePicture,
  breedName,
  sex,
  birthDate,
  description,
  isVaccinated,
  isHypoallergenic,
  price,
  isDouble = false,
}: HoverStateProps) {
  const descriptionPlaceholder = "Це чудо чекає саме тебе!";
  const ageText = formatAge(birthDate ?? null);
  const sexText =
    sex === "f" ? "Дівчинка" : sex === "m" ? "Хлопчик" : "Стать невідома";

  return (
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
      <div className="w-full h-full bg-[#8E928E] p-4 flex flex-col justify-between items-stretch text-white rounded-[20px]">
        <div
          className={`flex flex-col w-full ${
            isDouble ? "gap-4 flex-grow" : "gap-4"
          }`}
        >
          <h3
            className={`w-full font-medium text-white overflow-hidden text-ellipsis ${
              isDouble
                ? "h-[50px] text-[23px] leading-[25px]"
                : "h-[44px] text-[20px] leading-[22px]"
            }`}
          >
            {title}
          </h3>

          <div
            className={`flex flex-row w-full ${
              isDouble ? "gap-4 flex-grow" : "gap-3 items-end"
            }`}
          >
            <div
              className={`${
                isDouble ? "w-[218px] h-[301px]" : "w-[132px] h-[132px]"
              } flex-shrink-0`}
            >
              <Image
                className={`${
                  isDouble ? "rounded-[12px]" : "rounded-[16px]"
                } w-full h-full object-cover`}
                src={profilePicture}
                alt={"pet profile picture"}
                width={isDouble ? 218 : 132}
                height={isDouble ? 301 : 132}
              />
            </div>

            <div
              className={`flex flex-col flex-grow ${
                isDouble
                  ? "justify-between"
                  : "justify-between items-start h-[132px] gap-5"
              }`}
            >
              {isDouble ? (
                <>
                  <div className="flex flex-col w-full justify-between">
                    <div className="flex flex-row items-center gap-2 self-start mb-10">
                      {isHypoallergenic && (
                        <Image
                          src={heartIcon}
                          alt="heart icon"
                          width={24}
                          height={21}
                        />
                      )}
                      {isVaccinated && (
                        <Image
                          src={syringeIcon}
                          alt="syringe icon"
                          width={24}
                          height={21}
                        />
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-0 mt-1">
                      <span className="text-base leading-4 text-[#D5D5D5]">
                        {ageText}
                      </span>
                      <span className="text-base leading-4 text-[#D5D5D5]">
                        {sexText}
                      </span>
                    </div>
                    <hr className="w-full border-t border-white/25 mt-4 mb-3" />
                    <span className="font-normal text-white text-base leading-5 block">
                      {breedName || "Невідома порода"}
                    </span>
                    <span className="font-normal text-white text-base leading-5 h-[40px] overflow-hidden text-ellipsis mt-1 block">
                      {description || descriptionPlaceholder}
                    </span>
                  </div>
                  <div className="flex flex-row justify-between items-center w-full mt-auto py-1">
                    <span className="font-medium text-white text-base leading-5">
                      {price ? `₴ ${price}` : ""}
                    </span>
                    <button
                      type="button"
                      className="w-5 h-5 bg-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                      aria-label="Learn more"
                    >
                      <Image
                        src={playBtn}
                        alt="play button"
                        width={12}
                        height={12}
                        className="text-[#8E928E]"
                      />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-row items-center gap-1">
                    {isHypoallergenic && (
                      <Image
                        src={heartIcon}
                        alt="heart icon"
                        width={24}
                        height={21}
                      />
                    )}
                    {isVaccinated && (
                      <Image
                        src={syringeIcon}
                        alt="syringe icon"
                        width={24}
                        height={21}
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-white text-sm leading-[22px]">
                      {ageText}
                    </span>
                    <span className="font-medium text-white text-sm leading-[22px]">
                      {sexText}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {!isDouble && (
            <>
              <hr className="w-full border-t border-white/25 my-4" />
              <div className="flex flex-col items-start gap-1 w-full">
                <span className="font-normal text-white text-sm leading-4">
                  {breedName || "Невідома порода"}
                </span>
                <span className="font-normal text-white text-sm leading-4 h-[32px] overflow-hidden text-ellipsis">
                  {description || descriptionPlaceholder}
                </span>
              </div>
            </>
          )}
        </div>

        {!isDouble && (
          <div className="w-full flex flex-row justify-between items-center">
            <span className="font-medium text-white text-xl leading-[22px]">
              {price ? `₴ ${price}` : ""}
            </span>
            <button
              type="button"
              className="w-5 h-5 bg-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="Learn more"
            >
              <Image
                src={playBtn}
                alt="play button"
                width={12}
                height={12}
                className="text-[#8E928E]"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
