"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { pet, title, price } = listing;
  const {
    name,
    birth_date,
    description,
    health,
    location,
    profile_picture,
    tags,
    images = [],
  } = pet;

  // Minimum swipe distance (in px) to trigger navigation
  const MIN_SWIPE_DISTANCE = 50;

  // Arrange images with profile image first, then the rest
  const arrangedImages = [...images].sort((a, b) => {
    if (a.id === profile_picture) return -1;
    if (b.id === profile_picture) return 1;
    return a.order - b.order;
  });

  // Get current image or fallback to placeholder
  const currentImage = arrangedImages[currentImageIndex] || null;
  const imageUrl = currentImage
    ? getImageUrl(currentImage.image)
    : petPlaceholder.src;

  // Navigation handlers
  const goToPrevious = () => {
    setImageLoaded(false);
    setCurrentImageIndex((prev) =>
      prev === 0 ? arrangedImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setImageLoaded(false);
    setCurrentImageIndex((prev) =>
      prev === arrangedImages.length - 1 ? 0 : prev + 1
    );
  };

  const goToImage = (index: number) => {
    setImageLoaded(false);
    setCurrentImageIndex(index);
  };

  // Touch handlers for swipe gesture
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }

    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="w-full mx-auto text-black flex flex-col gap-1">
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-6 md:p-10 gap-6 md:gap-10 bg-white rounded-[20px]">
        {/* Pet Info Section */}
        <div className="flex flex-col gap-4 order-2 md:order-1">
          <div className="flex flex-col gap-[40px]">
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

            <div className="flex flex-col gap-[12px]">
              <span className="text-xl sm:text-2xl font-medium text-black">
                {title}
              </span>
              <span className="text-base md:text-lg font-light">
                {description || "Це чудо чекає саме тебе!"}
              </span>
            </div>
          </div>
        </div>

        {/* Image Gallery Section */}
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-6 md:gap-10 order-1 md:order-2">
          <div className="w-full md:w-auto flex flex-col justify-center gap-6">
            {/* Stacked Images Container */}
            <div className="relative w-full max-w-md md:w-[404px] mx-auto pb-4">
              {/* Background stacked images effect - show actual next images */}
              {arrangedImages.length > 1 && (
                <>
                  {/* Third layer */}
                  {arrangedImages[
                    (currentImageIndex + 2) % arrangedImages.length
                  ] && (
                    <div className="absolute left-5 right-5 top-4 -bottom-1 rounded-3xl overflow-hidden bg-black/50"></div>
                  )}

                  {/* Second layer  */}
                  {arrangedImages[
                    (currentImageIndex + 1) % arrangedImages.length
                  ] && (
                    <div className="absolute left-2.5 right-2.5 top-4 bottom-1 rounded-3xl overflow-hidden bg-black/75"></div>
                  )}
                </>
              )}

              {/* Main image container */}
              <div
                ref={imageContainerRef}
                className="relative w-full aspect-[2/3] rounded-3xl overflow-hidden group z-10 touch-pan-y select-none"
                onTouchStart={
                  arrangedImages.length > 1 ? onTouchStart : undefined
                }
                onTouchMove={
                  arrangedImages.length > 1 ? onTouchMove : undefined
                }
                onTouchEnd={arrangedImages.length > 1 ? onTouchEnd : undefined}
              >
                {/* Skeleton Loader */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 rounded-3xl z-10 flex items-center justify-center text-green-500">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  </div>
                )}

                {/* Pet Image */}
                <Image
                  src={imageUrl}
                  alt={currentImage?.caption || name}
                  fill
                  sizes="(max-width: 768px) 100vw, 404px"
                  className="object-cover transition-opacity duration-300"
                  priority
                  onLoad={() => setImageLoaded(true)}
                  style={{ opacity: imageLoaded ? 1 : 0 }}
                />

                {/* Navigation Arrows - Only show if multiple images */}
                {arrangedImages.length > 1 && (
                  <>
                    {/* Left Arrow */}
                    <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-xl cursor-pointer active:scale-95"
                      aria-label="Previous image"
                    >
                      <ChevronLeft
                        className="w-4 h-4 text-gray-800"
                        strokeWidth={2.5}
                      />
                    </button>

                    {/* Right Arrow */}
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-xl cursor-pointer active:scale-95"
                      aria-label="Next image"
                    >
                      <ChevronRight
                        className="w-4 h-4 text-gray-800"
                        strokeWidth={2.5}
                      />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Pagination Dots - Below the image */}
            {arrangedImages.length > 1 && (
              <div className="flex justify-center gap-2">
                {arrangedImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`transition-all duration-200 rounded-full cursor-pointer ${
                      index === currentImageIndex
                        ? "w-3 h-3 bg-black"
                        : "w-3 h-3 bg-white border-1 border-black hover:bg-gray-200"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 md:gap-10">
            <div className="flex flex-wrap gap-[10px]">
              {tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-[10px] py-[6px] text-sm md:text-lg font-light text-black border border-black rounded-full text-nowrap"
                >
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
            className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 text-sm text-black bg-[#ABE34D] rounded-2xl px-[26px] py-[10px] hover:bg-[#9fd340] transition-colors"
          >
            Взяти &quot;На ручки&quot;
          </Link>
        </div>
      </div>
    </div>
  );
}
