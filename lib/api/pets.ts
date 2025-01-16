import { safeFetch, BASE_API_URL } from "@/lib/api/request";
import { PetListing, PetListingArrayResponse } from "@/lib/types/pets";

export async function fetchPetListings(): Promise<PetListing[]> {
  const data = await safeFetch<PetListingArrayResponse>(
    `${BASE_API_URL}/api/v1/pet-listings/?limit=20`,
    { next: { revalidate: 30 } }
  );
  return data.items;
}
