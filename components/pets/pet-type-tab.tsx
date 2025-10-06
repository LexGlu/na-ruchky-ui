"use client";

import { memo } from "react";
import { PetType } from "@/lib/types/pets";

// Labels mapping
const LABELS: Record<PetType, { full: string; short: string }> = {
  all: { full: "Усі", short: "Усі" },
  cats: { full: "Коти", short: "Коти" },
  dogs: { full: "Собаки", short: "Собаки" },
};

interface PetTypeTabProps {
  type: PetType;
  activeType: PetType;
  onSelect: (type: PetType) => void;
}

const PetTypeTab = memo(function PetTypeTab({
  type,
  activeType,
  onSelect,
}: PetTypeTabProps) {
  const isFullLabel = typeof window !== "undefined" && window.innerWidth >= 640;

  return (
    <button
      onClick={() => onSelect(type)}
      className={`flex-1 text-center rounded-lg py-2 sm:py-3 px-2 sm:px-4 border border-black transition-colors cursor-pointer text-sm sm:text-base md:text-lg ${
        activeType === type
          ? "bg-black text-white"
          : "bg-white text-black hover:bg-gray-50"
      }`}
      aria-pressed={activeType === type}
    >
      <span className="truncate">
        {isFullLabel ? LABELS[type].full : LABELS[type].short}
      </span>
    </button>
  );
});

export default PetTypeTab;
