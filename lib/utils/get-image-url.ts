import { BASE_API_URL } from "@/lib/api/constants";

/**
 * Returns the full image URL based on the environment.
 * In development, it prepends BASE_API_URL to relative paths.
 * In production, it returns the URL as is.
 *
 * @param imagePath - The image path or full URL.
 * @returns The full URL to the image.
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return "";
  }

  // Check if the URL is already absolute (starts with http:// or https://)
  const isAbsolute = /^https?:\/\//i.test(imagePath);

  if (isAbsolute) {
    return imagePath;
  }

  // If not absolute and not in production, prepend BASE_API_URL
  if (process.env.NODE_ENV !== "production") {
    return `${BASE_API_URL}${imagePath}`;
  }

  return imagePath;
}
