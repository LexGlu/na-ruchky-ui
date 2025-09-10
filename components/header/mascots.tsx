"use client";

import Image from "next/image";

import MascotFemaleImage from "@/public/mascot-f.svg";
import MascotMaleImage from "@/public/mascot-m.svg";
import MascotMailImage from "@/public/images/dog-mail.png";

// Constants for mascot dimensions and styling
const MASCOT_CONFIG = {
  female: {
    width: 129,
    height: 145,
    className: "w-[129px] h-[145px]",
  },
  male: {
    desktop: {
      width: 104,
      height: 216,
      className: "md:w-[104px] md:h-[216px]",
    },
    mobile: {
      width: 74,
      height: 155,
      className: "w-[74px] h-[155px]",
    },
  },
  mail: {
    desktop: {
      width: 336,
      height: 231,
      className: "md:w-[336px] md:h-[231px]",
    },
    mobile: {
      width: 224,
      height: 154,
      className: "w-[224px] h-[154px]",
    },
  },
} as const;

// Individual mascot components for better reusability
function MascotFemale() {
  return (
    <Image
      src={MascotFemaleImage}
      alt="Ruchky Female Mascot"
      className={`hidden md:block ${MASCOT_CONFIG.female.className}`}
      width={MASCOT_CONFIG.female.width}
      height={MASCOT_CONFIG.female.height}
    />
  );
}

function MascotMale({
  className = "",
  showOnMobile = false,
}: {
  className?: string;
  showOnMobile?: boolean;
}) {
  const mobileClasses = showOnMobile
    ? `${MASCOT_CONFIG.male.mobile.className} ${MASCOT_CONFIG.male.desktop.className}`
    : `hidden md:block ${MASCOT_CONFIG.male.desktop.className}`;

  return (
    <Image
      src={MascotMaleImage}
      alt="Ruchky Male Mascot"
      className={`${mobileClasses} ${className}`}
      width={MASCOT_CONFIG.male.desktop.width}
      height={MASCOT_CONFIG.male.desktop.height}
      sizes={showOnMobile ? "(max-width: 768px) 74px, 104px" : "104px"}
    />
  );
}

function MascotMail() {
  return (
    <Image
      src={MascotMailImage}
      alt="Ruchky Mail Dog"
      className={`${MASCOT_CONFIG.mail.mobile.className} ${MASCOT_CONFIG.mail.desktop.className}`}
      width={MASCOT_CONFIG.mail.desktop.width}
      height={MASCOT_CONFIG.mail.desktop.height}
      sizes="(max-width: 768px) 224px, 336px"
    />
  );
}

function MascotPair() {
  return (
    <div className="hidden md:flex gap-1">
      <MascotFemale />
      <MascotMale />
    </div>
  );
}

interface MascotsProps {
  repetitions?: number;
}

const Mascots = ({ repetitions = 3 }: MascotsProps) => {
  return (
    <div className="flex justify-between items-center py-4 md:py-8 w-full">
      <MascotMail />

      {/* Mobile: Single male mascot */}
      <div className="md:hidden">
        <MascotMale showOnMobile={true} />
      </div>

      {/* Desktop: Multiple mascot pairs */}
      <div className="hidden md:flex justify-end gap-6">
        {Array.from({ length: repetitions }, (_, index) => (
          <MascotPair key={`mascot-pair-${index}`} />
        ))}
      </div>
    </div>
  );
};

export default Mascots;
