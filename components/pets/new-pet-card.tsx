import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { PetListing } from "@/lib/types/pets";
import { getImageUrl } from "@/lib/utils/get-image-url";

import petPlaceholder from "@/public/pet_placeholder.png";
import petCardLoader from "@/public/icons/pet-card-loader.svg";

interface PetCardProps {
  pet: PetListing;
}

export default function EnhancedPetCard({ pet }: PetCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Track mouse position relative to card
  const handleMouseMove = (e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();

      // Calculate position as percentage from center (range: -50 to 50)
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 100;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 100;

      setMousePosition({ x, y });
    }
  };

  // Reset mouse position when mouse leaves
  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <Link
      href={`/listings/${pet.id}`}
      className="block relative w-[220px] h-[310px] group">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-full w-full rounded-[12px] overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-md"
        style={{
          transform: `perspective(1000px) rotateX(${
            -mousePosition.y * 0.03
          }deg) rotateY(${mousePosition.x * 0.03}deg)`,
          transition:
            mousePosition.x === 0 && mousePosition.y === 0
              ? "all 0.5s ease-out"
              : "none",
        }}>
        {/* Skeleton Loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-[12px]">
            <div className="h-full w-full flex items-center justify-center">
              <Image
                src={petCardLoader}
                alt="pet card loader"
                width={100}
                height={100}
              />
            </div>
          </div>
        )}

        {/* Actual Image */}
        <div
          className={`transition-opacity duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}>
          <Image
            src={getImageUrl(pet.pet.profile_picture) || petPlaceholder.src}
            alt={pet.pet.name}
            fill
            sizes="220px"
            priority
            onLoad={() => setImageLoaded(true)}
            className="object-cover"
            style={{
              transform: `scale(${
                1 + Math.abs(mousePosition.x) * 0.0015
              }) translate(${mousePosition.x * 0.05}px, ${
                mousePosition.y * 0.05
              }px)`,
              transition:
                mousePosition.x === 0 && mousePosition.y === 0
                  ? "all 0.5s ease-out"
                  : "none",
            }}
          />
        </div>

        {/* Light reflection effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${
              50 + mousePosition.x * 0.5
            }% ${
              50 + mousePosition.y * 0.5
            }%, rgba(255,255,255,0.8) 0%, transparent 40%)`,
          }}></div>
      </div>

      {/* Info Card */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-[10px] bg-white m-1 px-4 py-3 shadow-sm transition-all duration-300 group-hover:shadow-md"
        style={{
          transform: `perspective(1000px) rotateX(${
            -mousePosition.y * 0.03
          }deg) rotateY(${mousePosition.x * 0.03}deg) translateZ(10px)`,
          transition:
            mousePosition.x === 0 && mousePosition.y === 0
              ? "all 0.5s ease-out"
              : "none",
        }}>
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
