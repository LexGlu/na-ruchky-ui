import Image, { StaticImageData } from "next/image";
import { ReactNode } from "react";

interface HeroBannerProps {
  imageSrc: string | StaticImageData;
  imageAlt: string;
  priority?: boolean;
  className?: string;
  height?: string;
  children?: ReactNode;
}

/**
 * A reusable hero banner component that displays an image with optional overlay content
 */
export default function HeroBanner({
  imageSrc,
  imageAlt,
  priority = true,
  className = "",
  height = "h-64 sm:h-80 md:h-96",
  children,
}: HeroBannerProps) {
  return (
    <div
      className={`relative w-full ${height} rounded-2xl overflow-hidden ${className}`}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        priority={priority}
        fill
        className="object-cover"
      />

      {children && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {children}
        </div>
      )}
    </div>
  );
}
