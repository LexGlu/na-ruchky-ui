"use client";
import { memo } from "react";
import Image from "next/image";
import { StaticImageData } from "next/image";

interface BaseToggleProps {
  isActive: boolean;
  onToggle: (checked: boolean) => void;
  text: string;
  icon: string | StaticImageData;
}

const BaseToggle = memo(function BaseToggle({
  isActive,
  onToggle,
  text,
  icon,
}: BaseToggleProps) {
  return (
    <div className="flex flex-row items-center gap-2 min-w-0">
      <button
        onClick={() => onToggle(!isActive)}
        className={`relative flex justify-center items-center cursor-pointer transition-all duration-300 ease-in-out p-[3px] w-[46px] h-[24px] rounded-[14px] flex-shrink-0 ${
          isActive ? "bg-[#CCF28C]" : "bg-[#E2E2E2]"
        }`}
        aria-checked={isActive}
        role="switch"
      >
        <div
          className={`absolute w-[18px] h-[18px] bg-black rounded-[11px] transition-transform duration-300 ease-in-out ${
            isActive ? "translate-x-[11px]" : "translate-x-[-11px]"
          }`}
        />
      </button>
      <div className="flex flex-row items-center gap-1 min-w-0">
        <span className="font-normal text-sm sm:text-base leading-5 text-black truncate">
          {text}
        </span>
        <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
          <Image
            src={icon}
            alt="icon"
            width={16}
            height={16}
            className="sm:w-5 sm:h-5"
          />
        </div>
      </div>
    </div>
  );
});

export default BaseToggle;
