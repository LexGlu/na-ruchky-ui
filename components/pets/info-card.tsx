"use client";
import Image from "next/image";

// Define layout types based on the provided examples
type LayoutType = "count" | "message";

interface InfoCardProps {
  title: string;
  description?: string;
  icon?: string;
  variant?: "white" | "green";
  layout?: LayoutType;
  className?: string;
}

export default function InfoCard({
  title,
  description,
  icon,
  variant = "green",
  layout = "message",
  className = "",
}: InfoCardProps) {
  // Base styling that applies to all cards
  const bgColor = variant === "white" ? "bg-white" : "bg-[#95BD7E]";

  // Determine text styles based on layout type
  const getTitleStyle = () => {
    if (layout === "count") {
      return "text-[72px] font-light text-black leading-none mb-3"; // Large number style
    }
    return "text-[22px] leading-tight text-black mb-2"; // Default message style
  };

  const getDescriptionStyle = () => {
    if (layout === "count") {
      return "text-gray-500 text-lg";
    }
    return "text-gray-700";
  };

  // Determine content layout based on type
  const renderContent = () => {
    return (
      <div className={layout === "count" ? "pt-4" : ""}>
        {title && <h3 className={getTitleStyle()}>{title}</h3>}
        {description && <p className={getDescriptionStyle()}>{description}</p>}
      </div>
    );
  };

  // Determine icon placement and styling
  const renderIcon = () => {
    if (!icon) return null;

    const mirrorClass = variant === "green" ? "scale-x-[-1]" : "";
    const positionClass =
      layout === "count" ? "bottom-0 right-0" : "bottom-0 right-0";

    return (
      <div className={`absolute ${positionClass}`}>
        <Image
          src={icon}
          alt="Mascot"
          width={layout === "count" ? 100 : 120}
          height={layout === "count" ? 100 : 120}
          className={`object-contain ${mirrorClass}`}
        />
      </div>
    );
  };

  return (
    <div
      className={`w-full h-[300px] sm:h-[401px] rounded-xl ${bgColor} flex flex-col justify-between p-6 relative overflow-hidden ${className}`}>
      {renderContent()}
      {renderIcon()}
    </div>
  );
}
