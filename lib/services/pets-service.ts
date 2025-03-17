import { Pet } from "@/lib/types/pets";

import { BASE_API_URL } from "@/lib/api/constants";

export async function getPets(params: {
  species?: string;
  name?: string;
  breed?: string;
  location?: string;
  sex?: string;
  minAge?: number;
  maxAge?: number;
  limit?: number;
}): Promise<{ items: Pet[]; count: number }> {
  const {
    species,
    name,
    breed,
    location,
    sex,
    minAge,
    maxAge,
    limit = 10,
  } = params;

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (species) queryParams.append("species", species);
  if (name) queryParams.append("name", name);
  if (breed) queryParams.append("breed", breed);
  if (location) queryParams.append("location", location);
  if (sex) queryParams.append("sex", sex);
  if (minAge !== undefined) queryParams.append("min_age", minAge.toString());
  if (maxAge !== undefined) queryParams.append("max_age", maxAge.toString());
  if (limit) queryParams.append("limit", limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `${BASE_API_URL}/api/v1/pets/${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Error fetching pets: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function getPet(id: string): Promise<Pet> {
  const response = await fetch(`${BASE_API_URL}/api/v1/pets/${id}`);

  if (!response.ok) {
    throw new Error(`Error fetching pet: ${response.statusText}`);
  }

  return await response.json();
}
