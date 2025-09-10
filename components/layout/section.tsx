import React, { ElementType } from "react";
import { cn } from "@/lib/utils/cn";

type Padding = "none" | "sm" | "md" | "lg";

const paddingMap: Record<Padding, string> = {
  none: "p-0",
  sm: "px-4 py-4 sm:px-6",
  md: "px-4 py-6 sm:px-8 md:py-8",
  lg: "px-4 py-8 sm:px-10 md:px-12 md:py-12",
};

export interface SectionProps<T extends ElementType = "section"> {
  id?: string;
  as?: T;
  padding?: Padding;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
  /** Adds an inner max-width wrapper (default true) */
  inner?: boolean;
  /** Max width key: site (1440) or content (1336) */
  max?: "site" | "content";
  role?: string;
  ariaLabel?: string;
}

export default function Section<T extends ElementType = "section">({
  id,
  as,
  padding = "md",
  className,
  innerClassName,
  children,
  inner = true,
  max = "content",
  role,
  ariaLabel,
}: SectionProps<T>) {
  const Tag = (as || "section") as ElementType;
  const content = inner ? (
    <div
      className={cn(
        "mx-auto w-full",
        max === "site" ? "max-w-site" : "max-w-content",
        innerClassName
      )}
    >
      {children}
    </div>
  ) : (
    children
  );

  return (
    <Tag
      id={id}
      role={role}
      aria-label={ariaLabel}
      className={cn("w-full", paddingMap[padding], className)}
    >
      {content}
    </Tag>
  );
}
