import api from "@/lib/api/request";
import { ApiClientFactory, ResourceApiClient } from "@/lib/api/resource-client";
import { ApiOperationWrapper } from "@/lib/api/operation-wrapper";
import {
  BaseApiError,
  ValidationError,
  NotFoundError,
  ServerError,
  NetworkError,
} from "@/lib/api/errors";
import { Breed } from "@/lib/types/breeds";
import { Species } from "@/lib/types/pets";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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

interface BreedsResponse {
  items: Breed[];
  count: number;
}

type BreedCreate = Omit<Breed, "id" | "created_at" | "updated_at">;
type BreedUpdate = Partial<BreedCreate>;

// ============================================================================
// BASIC CRUD OPERATIONS
// ============================================================================

const apiFactory = new ApiClientFactory(api);
const breedsClient = apiFactory.createResourceClient<
  Breed,
  BreedCreate,
  BreedUpdate
>("Breed", "api/v1/breeds");

// Export standard CRUD operations (if needed for admin functionality)
export const createBreed = breedsClient.create.bind(breedsClient);
export const updateBreed = breedsClient.update.bind(breedsClient);
export const patchBreed = breedsClient.patch.bind(breedsClient);
export const deleteBreed = breedsClient.delete.bind(breedsClient);

// ============================================================================
// ENHANCED BREEDS API CLIENT
// ============================================================================

class BreedsApiClient extends ResourceApiClient<
  Breed,
  BreedCreate,
  BreedUpdate
> {
  /**
   * Get breeds with advanced filtering
   */
  async getBreeds(params: GetBreedsParams = {}): Promise<BreedsResponse> {
    return ApiOperationWrapper.execute(
      async () => {
        const queryParams = this.buildQueryParams(params);
        const queryString = queryParams.toString();
        const url = `${this.basePath}/${queryString ? `?${queryString}` : ""}`;

        return this.apiClient.get<BreedsResponse>(url);
      },
      {
        operationName: "getBreeds",
        resource: "Breed",
      }
    );
  }

  /**
   * Get a single breed by ID
   */
  async getBreed(id: string): Promise<Breed> {
    return ApiOperationWrapper.execute(
      async () => this.apiClient.get<Breed>(`${this.basePath}/${id}`),
      {
        operationName: "getBreed",
        resource: "Breed",
        identifier: id,
      }
    );
  }

  /**
   * Get popular breeds
   */
  async getPopularBreeds(limit: number = 10): Promise<Breed[]> {
    return ApiOperationWrapper.execute(
      async () =>
        this.apiClient.get<Breed[]>(`${this.basePath}/popular/?limit=${limit}`),
      {
        operationName: "getPopularBreeds",
        resource: "Breed",
      }
    );
  }

  /**
   * Get breeds by species
   */
  async getBreedsBySpecies(species: Species, limit?: number): Promise<Breed[]> {
    return ApiOperationWrapper.execute(
      async () => {
        const params = new URLSearchParams({ species });
        if (limit) params.append("limit", limit.toString());

        const response = await this.apiClient.get<BreedsResponse>(
          `${this.basePath}/?${params.toString()}`
        );
        return response.items;
      },
      {
        operationName: "getBreedsBySpecies",
        resource: "Breed",
        identifier: species,
      }
    );
  }

  /**
   * Search breeds by name or characteristics
   */
  async searchBreeds(
    query: string,
    filters?: Omit<GetBreedsParams, "search">
  ): Promise<Breed[]> {
    return ApiOperationWrapper.execute(
      async () => {
        const params = { ...filters, search: query };
        const response = await this.getBreeds(params);
        return response.items;
      },
      {
        operationName: "searchBreeds",
        resource: "Breed",
      }
    );
  }

  /**
   * Get breed recommendations based on characteristics
   */
  async getBreedRecommendations(criteria: {
    species: Species;
    size?: "small" | "medium" | "large";
    activity_level?: "low" | "medium" | "high";
    good_with_kids?: boolean;
    grooming_needs?: "low" | "medium" | "high";
    limit?: number;
  }): Promise<Breed[]> {
    return ApiOperationWrapper.execute(
      async () => {
        const queryParams = new URLSearchParams();
        Object.entries(criteria).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });

        return this.apiClient.get<Breed[]>(
          `${this.basePath}/recommendations/?${queryParams.toString()}`
        );
      },
      {
        operationName: "getBreedRecommendations",
        resource: "Breed",
      }
    );
  }

  /**
   * Get breed statistics
   */
  async getBreedStats(): Promise<{
    total_breeds: number;
    species_breakdown: Record<Species, number>;
    popular_origins: string[];
  }> {
    return ApiOperationWrapper.execute(
      async () => this.apiClient.get(`${this.basePath}/stats`),
      {
        operationName: "getBreedStats",
        resource: "Breed",
      }
    );
  }

  /**
   * Helper method to build query parameters
   */
  private buildQueryParams(params: GetBreedsParams): URLSearchParams {
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

    const queryParams = new URLSearchParams();

    if (species) queryParams.append("species", species);
    if (search) queryParams.append("search", search);
    if (origin) queryParams.append("origin", origin);
    if (min_life_span) queryParams.append("min_life_span", min_life_span);
    if (max_life_span) queryParams.append("max_life_span", max_life_span);
    if (weight_range) queryParams.append("weight_range", weight_range);
    if (limit) queryParams.append("limit", limit.toString());
    if (offset) queryParams.append("offset", offset.toString());

    return queryParams;
  }
}

// Create enhanced client
const enhancedBreedsClient = new BreedsApiClient(api, "Breed", "api/v1/breeds");

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Get breeds with advanced filtering and error handling
 */
export async function getBreeds(
  params: GetBreedsParams = {}
): Promise<BreedsResponse> {
  return enhancedBreedsClient.getBreeds(params);
}

/**
 * Get a single breed by ID with enhanced error handling
 */
export async function getBreed(id: string): Promise<Breed> {
  return enhancedBreedsClient.getBreed(id);
}

/**
 * Get popular breeds with error handling
 */
export async function getPopularBreeds(limit: number = 10): Promise<Breed[]> {
  return enhancedBreedsClient.getPopularBreeds(limit);
}

/**
 * Get breeds filtered by species
 */
export const getBreedsBySpecies =
  enhancedBreedsClient.getBreedsBySpecies.bind(enhancedBreedsClient);

/**
 * Search breeds by query
 */
export const searchBreeds =
  enhancedBreedsClient.searchBreeds.bind(enhancedBreedsClient);

/**
 * Get breed recommendations
 */
export const getBreedRecommendations =
  enhancedBreedsClient.getBreedRecommendations.bind(enhancedBreedsClient);

/**
 * Get breed statistics
 */
export const getBreedStats =
  enhancedBreedsClient.getBreedStats.bind(enhancedBreedsClient);

// ============================================================================
// SAFE WRAPPER FUNCTIONS FOR COMPONENT USE
// ============================================================================

/**
 * Safe wrapper for getBreeds that doesn't throw errors
 */
export async function safeFetchBreeds(params: GetBreedsParams = {}): Promise<{
  success: boolean;
  data?: BreedsResponse;
  error?: string;
  errorType?: "validation" | "network" | "server" | "unknown";
}> {
  try {
    const data = await getBreeds(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        errorType: "validation",
      };
    }
    if (error instanceof NetworkError) {
      return {
        success: false,
        error:
          "Network connection failed. Please check your internet connection.",
        errorType: "network",
      };
    }
    if (error instanceof ServerError) {
      return {
        success: false,
        error: "Server error occurred. Please try again later.",
        errorType: "server",
      };
    }
    return {
      success: false,
      error:
        error instanceof BaseApiError
          ? error.message
          : "An unexpected error occurred",
      errorType: "unknown",
    };
  }
}

/**
 * Safe wrapper for getBreed that gracefully handles not found
 */
export async function safeFetchBreed(id: string): Promise<{
  success: boolean;
  data?: Breed;
  error?: string;
  notFound?: boolean;
}> {
  try {
    const data = await getBreed(id);
    return { success: true, data };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: `Breed with ID ${id} not found`,
        notFound: true,
      };
    }
    return {
      success: false,
      error:
        error instanceof BaseApiError ? error.message : "Failed to fetch breed",
    };
  }
}

/**
 * Safe wrapper for popular breeds with fallback
 */
export async function safeFetchPopularBreeds(
  limit: number = 10
): Promise<Breed[]> {
  try {
    return await getPopularBreeds(limit);
  } catch (error) {
    console.warn("Failed to fetch popular breeds:", error);
    // Return empty array as fallback - better UX than throwing error
    return [];
  }
}
