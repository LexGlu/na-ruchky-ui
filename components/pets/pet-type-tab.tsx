"use client";

import { memo } from "react";
import { PetType } from "@/lib/types/pets";

// Labels mapping
const LABELS: Record<PetType, string> = {
  all: "Усі працівники",
  cats: "Коти",
  dogs: "Собаки",
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
  return (
    <button
      onClick={() => onSelect(type)}
      className={`w-1/3 text-center rounded-lg py-3 px-4 border border-black transition-colors cursor-pointer ${
        activeType === type
          ? "bg-black text-white"
          : "bg-white text-black hover:bg-gray-50"
      }`}
      aria-pressed={activeType === type}>
      <span className="text-lg">{LABELS[type]}</span>
    </button>
  );
});

export default PetTypeTab;
