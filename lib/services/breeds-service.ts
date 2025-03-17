import { Breed } from "@/lib/types/breeds";
import { Species } from "@/lib/types/pets";

import { BASE_API_URL } from "@/lib/api/constants";

interface GetBreedsParams {
  species?: Species;
  search?: string;
  origin?: string;
  min_life_span?: string;
  max_life_span?: string;
  weight_range?: string;
  limit?: number;
  offset?: number;
}

export async function getBreeds(
  params: GetBreedsParams = {}
): Promise<{ items: Breed[]; count: number }> {
  const {
    species,
    search,
    origin,
    min_life_span,
    max_life_span,
    weight_range,
    limit = 10,
    offset = 0,
  } = params;

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (species) queryParams.append("species", species);
  if (search) queryParams.append("search", search);
  if (origin) queryParams.append("origin", origin);
  if (min_life_span) queryParams.append("min_life_span", min_life_span);
  if (max_life_span) queryParams.append("max_life_span", max_life_span);
  if (weight_range) queryParams.append("weight_range", weight_range);
  if (limit) queryParams.append("limit", limit.toString());
  if (offset) queryParams.append("offset", offset.toString());

  const queryString = queryParams.toString();
  const endpoint = `${BASE_API_URL}/api/v1/breeds/${
    queryString ? `?${queryString}` : ""
  }`;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Error fetching breeds: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Breeds service error:", error);
    return { items: [], count: 0 };
  }
}

export async function getBreed(id: string): Promise<Breed> {
  const endpoint = `${BASE_API_URL}/api/v1/breeds/${id}`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Error fetching breed: ${response.statusText}`);
  }

  return await response.json();
}

// Function to get popular breeds (can be used for recommended sections)
export async function getPopularBreeds(limit: number = 10): Promise<Breed[]> {
  try {
    // This would ideally be a separate endpoint that returns popular breeds
    // For now, we'll just get random breeds as a placeholder
    const data = await getBreeds({ limit });
    return data.items || [];
  } catch (error) {
    console.error("Error fetching popular breeds:", error);
    return [];
  }
}
