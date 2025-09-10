import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Typed helper merging conditional class values safely
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
