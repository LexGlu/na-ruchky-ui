"use client";

import Image from "next/image";

import MascotFemaleImage from "@/public/mascot-f.svg";
import MascotMaleImage from "@/public/mascot-m.svg";

const MascotPair = () => (
  <div className="flex gap-1">
    <Image
      src={MascotFemaleImage}
      alt="Ruchky"
      className="hidden md:block w-[129px] h-[145px]"
      width={129}
      height={145}
    />
    <Image
      src={MascotMaleImage}
      alt="Ruchky"
      className="hidden md:block w-[104px] h-[216px]"
      width={104}
      height={216}
    />
  </div>
);

const Mascots = ({ repetitions = 3 }: { repetitions?: number }) => {
  return (
    <div className="justify-end gap-[24px] px-4 sm:px-6 lg:px-8 py-6 hidden md:flex w-full">
      {Array.from({ length: repetitions }).map((_, index) => (
        <MascotPair key={index} />
      ))}
    </div>
  );
};

export default Mascots;
