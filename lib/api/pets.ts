import { safeFetch } from "@/lib/api/request";
import { BASE_API_URL } from "@/lib/api/constants";
import { PetListing, PetListingArrayResponse } from "@/lib/types/pets";

export async function fetchPetListings(
  params: Record<string, string> = {}
): Promise<PetListing[]> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });

  const url = `${BASE_API_URL}/api/v1/pet-listings/?${searchParams.toString()}`;

  const data = await safeFetch<PetListingArrayResponse>(url, {
    next: { revalidate: 30 },
  });

  return data.items;
}

export async function fetchPetListing(uuid: string): Promise<PetListing> {
  return safeFetch<PetListing>(`${BASE_API_URL}/api/v1/pet-listings/${uuid}`, {
    next: { revalidate: 30 },
  });
}
