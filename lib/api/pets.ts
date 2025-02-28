import { safeFetch } from "@/lib/api/request";
import { BASE_API_URL } from "@/lib/api/constants";
import { PetListing, PetListingArrayResponse } from "@/lib/types/pets";

/**
 * Custom error class for pet listing operations
 */
export class PetListingError extends Error {
  public statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "PetListingError";
    this.statusCode = statusCode;
  }
}

/**
 * Fetch pet listings with optional filtering parameters
 * @param searchParams URLSearchParams or Record<string, string> object for filtering results
 * @returns Promise containing an array of pet listings
 */
export async function fetchPetListings(
  searchParams?: URLSearchParams | Record<string, string>
): Promise<PetListing[]> {
  try {
    let queryString = "";

    if (searchParams) {
      // If searchParams is already a URLSearchParams object, use it directly
      if (searchParams instanceof URLSearchParams) {
        queryString = searchParams.toString();
      }
      // Otherwise, create a new URLSearchParams from the object
      else {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) {
            params.append(key, value);
          }
        });
        queryString = params.toString();
      }
    }

    const url = `${BASE_API_URL}/api/v1/pet-listings/${
      queryString ? `?${queryString}` : ""
    }`;

    const data = await safeFetch<PetListingArrayResponse>(url, {
      next: { revalidate: 30 },
    });

    return data.items;
  } catch (error) {
    if (error instanceof Error) {
      throw new PetListingError(
        `Failed to fetch pet listings: ${error.message}`,
        "statusCode" in error ? Number(error.statusCode) : undefined
      );
    }
    throw new PetListingError(
      "An unknown error occurred while fetching pet listings"
    );
  }
}

/**
 * Fetch a single pet listing by its UUID
 * @param uuid The unique identifier for the pet listing
 * @returns Promise containing the pet listing
 */
export async function fetchPetListing(uuid: string): Promise<PetListing> {
  try {
    return await safeFetch<PetListing>(
      `${BASE_API_URL}/api/v1/pet-listings/${uuid}`,
      {
        next: { revalidate: 30 },
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new PetListingError(
        `Failed to fetch pet listing ${uuid}: ${error.message}`,
        "statusCode" in error ? Number(error.statusCode) : undefined
      );
    }
    throw new PetListingError(
      `An unknown error occurred while fetching pet listing ${uuid}`
    );
  }
}
