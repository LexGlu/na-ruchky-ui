"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
  memo,
} from "react";
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

interface PetImage {
  id: string;
  image: string;
  order: number;
  caption: string | null;
  created_at: string;
}

interface TouchHandlers {
  onTouchStart?: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove?: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd?: () => void;
}

type ExitDirection = "left" | "right" | null;

interface GalleryState {
  currentIndex: number;
  isTransitioning: boolean;
  exitDirection: ExitDirection;
  underneathIndex: number | null;
}

type GalleryAction =
  | { type: "START_TRANSITION"; direction: ExitDirection; targetIndex: number }
  | { type: "UPDATE_INDEX"; index: number }
  | { type: "END_TRANSITION" };

const ANIMATION_CONFIG = {
  DURATION: 450,
  INDEX_UPDATE_DELAY: 150,
  MIN_SWIPE_DISTANCE: 50,
} as const;

function galleryReducer(
  state: GalleryState,
  action: GalleryAction
): GalleryState {
  switch (action.type) {
    case "START_TRANSITION":
      return {
        ...state,
        isTransitioning: true,
        exitDirection: action.direction,
        underneathIndex: action.targetIndex,
      };
    case "UPDATE_INDEX":
      return {
        ...state,
        currentIndex: action.index,
      };
    case "END_TRANSITION":
      return {
        ...state,
        isTransitioning: false,
        exitDirection: null,
        underneathIndex: null,
      };
    default:
      return state;
  }
}

function useImageNavigation(imagesLength: number) {
  const [state, dispatch] = useReducer(galleryReducer, {
    currentIndex: 0,
    isTransitioning: false,
    exitDirection: null,
    underneathIndex: null,
  });

  const getIndex = useCallback(
    (current: number, direction: "next" | "prev") => {
      if (direction === "next") return (current + 1) % imagesLength;
      return current === 0 ? imagesLength - 1 : current - 1;
    },
    [imagesLength]
  );

  const navigateSequential = useCallback(
    (direction: "left" | "right") => {
      if (state.isTransitioning || imagesLength <= 1) return;

      const targetIndex = getIndex(
        state.currentIndex,
        direction === "left" ? "next" : "prev"
      );

      dispatch({ type: "START_TRANSITION", direction, targetIndex });

      setTimeout(() => {
        dispatch({ type: "UPDATE_INDEX", index: targetIndex });
      }, ANIMATION_CONFIG.INDEX_UPDATE_DELAY);

      setTimeout(() => {
        dispatch({ type: "END_TRANSITION" });
      }, ANIMATION_CONFIG.DURATION);
    },
    [state.isTransitioning, state.currentIndex, imagesLength, getIndex]
  );

  const navigateDirect = useCallback(
    (targetIndex: number) => {
      if (targetIndex === state.currentIndex || state.isTransitioning) return;

      const forwardDistance =
        (targetIndex - state.currentIndex + imagesLength) % imagesLength;
      const backwardDistance =
        (state.currentIndex - targetIndex + imagesLength) % imagesLength;
      const direction = forwardDistance <= backwardDistance ? "left" : "right";

      dispatch({ type: "START_TRANSITION", direction, targetIndex });

      setTimeout(() => {
        dispatch({ type: "UPDATE_INDEX", index: targetIndex });
      }, ANIMATION_CONFIG.INDEX_UPDATE_DELAY);

      setTimeout(() => {
        dispatch({ type: "END_TRANSITION" });
      }, ANIMATION_CONFIG.DURATION);
    },
    [state.currentIndex, state.isTransitioning, imagesLength]
  );

  return {
    ...state,
    navigateNext: useCallback(
      () => navigateSequential("left"),
      [navigateSequential]
    ),
    navigatePrev: useCallback(
      () => navigateSequential("right"),
      [navigateSequential]
    ),
    navigateTo: navigateDirect,
    getIndex,
  };
}

function useTouchGestures(
  onNext: () => void,
  onPrev: () => void,
  enabled: boolean
) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handlers = useMemo(() => {
    if (!enabled) return {};

    return {
      onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
      },
      onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchEnd(e.targetTouches[0].clientX);
      },
      onTouchEnd: () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > ANIMATION_CONFIG.MIN_SWIPE_DISTANCE;
        const isRightSwipe = distance < -ANIMATION_CONFIG.MIN_SWIPE_DISTANCE;

        if (isLeftSwipe) onNext();
        else if (isRightSwipe) onPrev();

        setTouchStart(null);
        setTouchEnd(null);
      },
    };
  }, [enabled, touchStart, touchEnd, onNext, onPrev]);

  return handlers;
}

function useKeyboardNavigation(
  onNext: () => void,
  onPrev: () => void,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          onPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          onNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onNext, onPrev]);
}

const ImagePreloader = memo(
  ({
    images,
    prevIndex,
    nextIndex,
  }: {
    images: PetImage[];
    prevIndex: number;
    nextIndex: number;
  }) => {
    if (images.length <= 1) return null;

    return (
      <div className="hidden">
        <Image
          src={getImageUrl(images[prevIndex].image)}
          alt="preload"
          width={404}
          height={606}
          quality={85}
        />
        <Image
          src={getImageUrl(images[nextIndex].image)}
          alt="preload"
          width={404}
          height={606}
          quality={85}
        />
      </div>
    );
  }
);
ImagePreloader.displayName = "ImagePreloader";

const PetInfoSection = memo(
  ({
    name,
    location,
    age,
    title,
    description,
  }: {
    name: string;
    location?: string | null;
    age: string;
    title: string;
    description?: string | null;
  }) => (
    <div className="flex flex-col gap-4 order-2 md:order-1">
      <div className="flex flex-col gap-[40px]">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl sm:text-5xl md:text-[72px] font-light leading-tight">
            {name}
          </h1>
          <div className="flex flex-wrap gap-2 md:gap-4 text-lg sm:text-xl md:text-2xl font-medium">
            <span className="text-black">{location || "Невідомо"}</span>
            <span className="text-[#7D7D83]">{age}</span>
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
  )
);
PetInfoSection.displayName = "PetInfoSection";

const ImageCounter = memo(
  ({
    currentIndex,
    totalImages,
  }: {
    currentIndex: number;
    totalImages: number;
  }) => (
    <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium">
      {currentIndex + 1} / {totalImages}
    </div>
  )
);
ImageCounter.displayName = "ImageCounter";

const NavigationButton = memo(
  ({
    direction,
    onClick,
    children,
  }: {
    direction: "left" | "right";
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`pet-gallery-nav-button absolute ${
        direction === "left" ? "left-4" : "right-4"
      } top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white/90 shadow-lg flex items-center justify-center cursor-pointer`}
      aria-label={`${direction === "left" ? "Previous" : "Next"} image`}
    >
      {children}
    </button>
  )
);
NavigationButton.displayName = "NavigationButton";

const PaginationDots = memo(
  ({
    images,
    currentIndex,
    onNavigateTo,
  }: {
    images: PetImage[];
    currentIndex: number;
    onNavigateTo: (index: number) => void;
  }) => (
    <div className="flex justify-center gap-2">
      {images.map((_, index) => (
        <button
          key={index}
          onClick={() => onNavigateTo(index)}
          className={`pet-gallery-dot rounded-full cursor-pointer ${
            index === currentIndex
              ? "pet-gallery-dot-active w-8 h-3"
              : "w-3 h-3 hover:bg-gray-100"
          }`}
          aria-label={`Go to image ${index + 1}`}
        />
      ))}
    </div>
  )
);
PaginationDots.displayName = "PaginationDots";

const ImageGallery = memo(
  ({
    images,
    currentIndex,
    isTransitioning,
    exitDirection,
    imageUrls,
    currentImage,
    underneathImage,
    name,
    onPrevious,
    onNext,
    onNavigateTo,
    touchHandlers,
  }: {
    images: PetImage[];
    currentIndex: number;
    isTransitioning: boolean;
    exitDirection: ExitDirection;
    imageUrls: { current: string; underneath: string };
    currentImage: PetImage;
    underneathImage: PetImage;
    name: string;
    onPrevious: () => void;
    onNext: () => void;
    onNavigateTo: (index: number) => void;
    touchHandlers: TouchHandlers;
  }) => (
    <>
      <div className="relative w-full max-w-md md:w-[404px] mx-auto pb-4 pet-gallery-container">
        {images.length > 1 && (
          <>
            <div className="pet-gallery-static-overlay absolute left-5 right-5 top-4 -bottom-1 bg-black/50"></div>
            <div className="pet-gallery-static-overlay absolute left-2.5 right-2.5 top-4 bottom-1 bg-black/75"></div>
          </>
        )}

        <div
          className="pet-gallery-deck touch-pan-y select-none"
          {...(images.length > 1 ? touchHandlers : {})}
        >
          {images.length > 1 && (
            <div
              className={`pet-gallery-card pet-gallery-card--next ${
                isTransitioning ? "is-revealed" : ""
              }`}
            >
              <Image
                src={imageUrls.underneath}
                alt={underneathImage?.caption || `${name} - next`}
                fill
                sizes="(max-width: 768px) 100vw, 404px"
                className="object-cover"
                priority={false}
                quality={85}
              />
              {isTransitioning && (
                <ImageCounter
                  currentIndex={currentIndex}
                  totalImages={images.length}
                />
              )}
            </div>
          )}

          <div
            className={`pet-gallery-card pet-gallery-card--current ${
              isTransitioning && exitDirection === "left"
                ? "pet-gallery-card--exiting-left"
                : ""
            } ${
              isTransitioning && exitDirection === "right"
                ? "pet-gallery-card--exiting-right"
                : ""
            }`}
          >
            <Image
              src={imageUrls.current}
              alt={currentImage?.caption || name}
              fill
              sizes="(max-width: 768px) 100vw, 404px"
              className="object-cover"
              priority={true}
              quality={85}
            />
            {images.length > 1 && !isTransitioning && (
              <ImageCounter
                currentIndex={currentIndex}
                totalImages={images.length}
              />
            )}
          </div>

          {images.length > 1 && (
            <>
              <NavigationButton direction="left" onClick={onPrevious}>
                <ChevronLeft
                  className="w-4 h-4 text-gray-800"
                  strokeWidth={2.5}
                />
              </NavigationButton>
              <NavigationButton direction="right" onClick={onNext}>
                <ChevronRight
                  className="w-4 h-4 text-gray-800"
                  strokeWidth={2.5}
                />
              </NavigationButton>
            </>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <PaginationDots
          images={images}
          currentIndex={currentIndex}
          onNavigateTo={onNavigateTo}
        />
      )}
    </>
  )
);
ImageGallery.displayName = "ImageGallery";

const PetDetailsSection = memo(
  ({ tags, health }: { tags?: string[]; health?: string | null }) => (
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
  )
);
PetDetailsSection.displayName = "PetDetailsSection";

const ContactSection = memo(
  ({ formattedPrice }: { formattedPrice: string }) => (
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
        <h3 className="text-3xl md:text-4xl font-light">₴ {formattedPrice}</h3>
        <Link
          href="/checkout"
          className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 text-sm text-black bg-[#ABE34D] rounded-2xl px-[26px] py-[10px] hover:bg-[#9fd340] transition-colors"
        >
          Взяти &quot;На ручки&quot;
        </Link>
      </div>
    </div>
  )
);
ContactSection.displayName = "ContactSection";

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
    images = [],
  } = pet;

  const arrangedImages = useMemo(
    () =>
      [...images].sort((a, b) => {
        if (a.id === profile_picture) return -1;
        if (b.id === profile_picture) return 1;
        return a.order - b.order;
      }),
    [images, profile_picture]
  );

  const gallery = useImageNavigation(arrangedImages.length);
  const touchHandlers = useTouchGestures(
    gallery.navigateNext,
    gallery.navigatePrev,
    arrangedImages.length > 1
  );

  useKeyboardNavigation(
    gallery.navigateNext,
    gallery.navigatePrev,
    arrangedImages.length > 1
  );

  const currentImage = arrangedImages[gallery.currentIndex];
  const nextImageIndex = gallery.getIndex(gallery.currentIndex, "next");
  const prevImageIndex = gallery.getIndex(gallery.currentIndex, "prev");

  const underneathIndex = gallery.underneathIndex ?? nextImageIndex;
  const underneathImage = arrangedImages[underneathIndex];

  const imageUrls = useMemo(
    () => ({
      current: currentImage
        ? getImageUrl(currentImage.image)
        : petPlaceholder.src,
      underneath: underneathImage
        ? getImageUrl(underneathImage.image)
        : petPlaceholder.src,
    }),
    [currentImage, underneathImage]
  );

  const petInfo = useMemo(
    () => ({
      age: formatAge(birth_date ?? null),
      formattedPrice: formatPrice(price),
    }),
    [birth_date, price]
  );

  return (
    <div className="w-full mx-auto text-black flex flex-col gap-1">
      <ImagePreloader
        images={arrangedImages}
        prevIndex={prevImageIndex}
        nextIndex={nextImageIndex}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-6 md:p-10 gap-6 md:gap-10 bg-white rounded-[20px] overflow-hidden">
        <PetInfoSection
          name={name}
          location={location}
          age={petInfo.age}
          title={title}
          description={description}
        />

        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-6 md:gap-10 order-1 md:order-2">
          <div className="w-full md:w-auto flex flex-col justify-center gap-6">
            <ImageGallery
              images={arrangedImages}
              currentIndex={gallery.currentIndex}
              isTransitioning={gallery.isTransitioning}
              exitDirection={gallery.exitDirection}
              imageUrls={imageUrls}
              currentImage={currentImage}
              underneathImage={underneathImage}
              name={name}
              onPrevious={gallery.navigatePrev}
              onNext={gallery.navigateNext}
              onNavigateTo={gallery.navigateTo}
              touchHandlers={touchHandlers}
            />
          </div>

          <PetDetailsSection tags={tags} health={health} />
        </div>
      </div>

      <ContactSection formattedPrice={petInfo.formattedPrice} />
    </div>
  );
}
