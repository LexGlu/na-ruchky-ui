"use client";

import Image from "next/image";
import Link from "next/link";
import { PetListing } from "@/lib/types/pets";
import formatAge from "@/lib/utils/format-age";
import { formatPrice } from "@/lib/utils/format-price";
import { getImageUrl } from "@/lib/utils/get-image-url";

import petPlaceholder from "@/public/pet_placeholder.png";
import telegramIcon from "@/public/icons/telegram.svg";
import whatsapp from "@/public/icons/whatsapp.svg";

interface PetDetailProps {
  listing: PetListing;
}

export default function PetDetail({ listing }: PetDetailProps) {
  const { pet, title, price } = listing;
  const {
    name,
    birth_date,
    description,
    health,
    location,
    profile_picture,
    tags,
  } = pet;

  const imageUrl = getImageUrl(profile_picture) || petPlaceholder.src;

  return (
    <div className="w-full mx-auto text-black flex flex-col gap-1">
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-6 md:p-10 gap-6 md:gap-10 bg-white rounded-[20px]">
        {/* Pet Info Section */}
        <div className="flex flex-col gap-4 order-2 md:order-1">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl md:text-[72px] font-light leading-tight">
              {name}
            </h1>
            <div className="flex flex-wrap gap-2 md:gap-4 text-lg sm:text-xl md:text-2xl font-medium">
              <span className="text-black">{location || "Невідомо"}</span>
              <span className="text-[#7D7D83]">
                {formatAge(birth_date ?? null)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xl sm:text-2xl font-medium text-black">
              {title}
            </span>
            <span className="text-base md:text-lg font-light">
              {description || "Це чудо чекає саме тебе!"}
            </span>
          </div>
        </div>

        {/* Image and Tags Section */}
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-6 md:gap-10 order-1 md:order-2">
          <div className="w-full md:w-auto flex justify-center">
            <Image
              src={imageUrl}
              alt={name}
              width={404}
              height={598}
              className="object-contain rounded-3xl max-h-[350px] sm:max-h-[450px] md:max-h-[598px] w-auto"
              priority
            />
          </div>
          <div className="flex flex-col gap-6 md:gap-10">
            <div className="flex flex-wrap gap-[10px]">
              {tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-[10px] py-[6px] text-sm md:text-lg font-light text-black border border-black rounded-full text-nowrap">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2 text-black">
              <h4 className="text-xl md:text-2xl font-medium">Здоров&apos;я</h4>
              <p className="text-base md:text-lg font-light">
                {health || "Не зазначено"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact and Price Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 p-4 sm:p-6 gap-6 sm:gap-x-10 bg-white rounded-[20px]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h3 className="text-xl md:text-2xl font-medium">
            Зв&apos;язатися з власником
          </h3>
          <div className="flex gap-2">
            <Image
              src={whatsapp}
              alt="whatsapp icon"
              width={33}
              height={33}
              className="cursor-pointer w-8 h-8 md:w-[33px] md:h-[33px]"
            />
            <Image
              src={telegramIcon}
              alt="telegram icon"
              width={33}
              height={33}
              className="cursor-pointer w-8 h-8 md:w-[33px] md:h-[33px]"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-start sm:items-center gap-4">
          <h3 className="text-3xl md:text-4xl font-light">
            ₴ {formatPrice(price)}
          </h3>
          <Link
            href="/checkout"
            className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 text-sm text-black bg-[#ABE34D] rounded-2xl px-[26px] py-[10px]">
            Взяти &quot;На ручки&quot;
          </Link>
        </div>
      </div>
    </div>
  );
}
