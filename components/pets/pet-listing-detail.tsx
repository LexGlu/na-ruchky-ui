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
      <div className="grid grid-cols-3 p-10 gap-10 bg-white rounded-[20px]">
        {/* Main Content */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-[72px] font-light">{name}</h1>
            <div className="flex gap-4 text-2xl font-medium">
              <span className="text-black">{location || "Невідомо"}</span>
              <span className="text-[#7D7D83]">
                {formatAge(birth_date ?? null)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-2xl font-medium text-black">{title}</span>
            <span className="text-lg font-light">
              {description || "Це чудо чекає саме тебе!"}
            </span>
          </div>
        </div>

        <div className="col-span-2 flex gap-10">
          <Image
            src={imageUrl}
            alt={name}
            width={404}
            height={598}
            className="object-contain rounded-3xl"
            priority
          />
          <div className="flex flex-col gap-10">
            <div className="flex flex-wrap gap-[10px]">
              {tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-[10px] py-[6px] text-lg font-light text-black border border-black rounded-full text-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2 text-black">
              <h4 className="text-2xl font-medium">Здоров&apos;я</h4>
              <p className="text-lg font-light">{health || "Не зазначено"}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 p-6 gap-x-10 bg-white rounded-[20px]">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-medium">Зв&apos;язатися з власником</h3>
          <div className="flex gap-2">
            <Image
              src={whatsapp}
              alt="whatsapp icon"
              width={33}
              height={33}
              className="cursor-pointer"
            />
            <Image
              src={telegramIcon}
              alt="telegram icon"
              width={33}
              height={33}
              className="cursor-pointer"
            />
          </div>
        </div>
        <div className="flex justify-end items-center gap-4">
          <h3 className="text-4xl font-light">₴ {formatPrice(price)}</h3>
          <Link
            href="/checkout"
            className="flex items-center gap-2 text-sm text-black bg-[#ABE34D] rounded-2xl px-[26px] py-[10px]"
          >
            Взяти “На ручки”
          </Link>
        </div>
      </div>
    </div>
  );
}
