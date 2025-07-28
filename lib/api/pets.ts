import api from "@/lib/api/request";
import { ApiClientFactory, ResourceApiClient } from "@/lib/api/resource-client";
import { ApiOperationWrapper } from "@/lib/api/operation-wrapper";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/api/errors";
import { PetListing, PetListingArrayResponse } from "@/lib/types/pets";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type PetListingCreate = Omit<PetListing, "id" | "created_at" | "updated_at">;
type PetListingUpdate = Partial<PetListingCreate>;

// ============================================================================
// RESOURCE CLIENT SETUP
// ============================================================================

const apiFactory = new ApiClientFactory(api);

// Create a specialized pet listings client
const petListingsClient = apiFactory.createResourceClient<
  PetListing,
  PetListingCreate,
  PetListingUpdate
>("PetListing", "api/v1/pet-listings");

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Fetch pet listings with optional filtering parameters
 * Now with centralized error handling and type safety
 */
export async function fetchPetListings(
  searchParams?: URLSearchParams | Record<string, string>
): Promise<PetListingArrayResponse> {
  // The ResourceApiClient handles all error normalization automatically
  return petListingsClient.list(searchParams);
}

/**
 * Fetch a single pet listing by its UUID
 * Errors are automatically converted to appropriate types (NotFoundError, etc.)
 */
export async function fetchPetListing(uuid: string): Promise<PetListing> {
  return petListingsClient.get(uuid);
}

/**
 * Create a new pet listing
 * Validation errors are automatically parsed into ValidationError with field details
 */
export async function createPetListing(
  petData: PetListingCreate
): Promise<PetListing> {
  return petListingsClient.create(petData);
}

/**
 * Update an existing pet listing (full replacement)
 */
export async function updatePetListing(
  uuid: string,
  petData: PetListingUpdate
): Promise<PetListing> {
  return petListingsClient.update(uuid, petData);
}

/**
 * Partially update an existing pet listing
 */
export async function patchPetListing(
  uuid: string,
  petData: Partial<PetListingUpdate>
): Promise<PetListing> {
  return petListingsClient.patch(uuid, petData);
}

/**
 * Delete a pet listing
 */
export async function deletePetListing(uuid: string): Promise<void> {
  return petListingsClient.delete(uuid);
}

// ============================================================================
// ADVANCED USAGE EXAMPLES
// ============================================================================

/**
 * Example of how to handle specific error types in your components
 */
export async function handlePetListingWithSpecificErrors(
  uuid: string
): Promise<PetListing | null> {
  try {
    return await fetchPetListing(uuid);
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.log("Pet listing not found, returning null");
      return null;
    }

    if (error instanceof ValidationError) {
      console.error("Validation errors:", error.fieldErrors);
      // Handle field-specific errors
      Object.entries(error.fieldErrors).forEach(([field, errors]) => {
        console.error(`${field}: ${errors.join(", ")}`);
      });
    }

    if (error instanceof UnauthorizedError) {
      // Redirect to login or show auth modal
      console.log("User needs to authenticate");
    }

    // Re-throw for other error types
    throw error;
  }
}

/**
 * Example of batch operations with proper error handling
 */
export async function batchCreatePetListings(
  petListings: PetListingCreate[]
): Promise<{
  successes: PetListing[];
  failures: Array<{ data: PetListingCreate; error: string }>;
}> {
  const successes: PetListing[] = [];
  const failures: Array<{ data: PetListingCreate; error: string }> = [];

  for (const petData of petListings) {
    try {
      const created = await createPetListing(petData);
      successes.push(created);
    } catch (error) {
      failures.push({
        data: petData,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { successes, failures };
}

// ============================================================================
// CUSTOM EXTENSIONS (if needed)
// ============================================================================

/**
 * Example of extending the base client for pet-specific operations
 */
class PetListingsApiClient extends ResourceApiClient<
  PetListing,
  PetListingCreate,
  PetListingUpdate
> {
  /**
   * Search pets by breed (custom endpoint example)
   */
  async searchByBreed(breed: string): Promise<PetListing[]> {
    return ApiOperationWrapper.execute(
      async () =>
        this.apiClient.get<PetListing[]>(
          `${this.basePath}/search/breed/${breed}/`
        ),
      {
        operationName: "searchPetListingsByBreed",
        resource: "PetListing",
        identifier: breed,
      }
    );
  }

  /**
   * Get pets by location with radius (custom endpoint example)
   */
  async searchByLocation(
    lat: number,
    lng: number,
    radius: number
  ): Promise<PetListing[]> {
    return ApiOperationWrapper.execute(
      async () =>
        this.apiClient.get<PetListing[]>(
          `${this.basePath}/search/location/?lat=${lat}&lng=${lng}&radius=${radius}`
        ),
      {
        operationName: "searchPetListingsByLocation",
        resource: "PetListing",
      }
    );
  }

  /**
   * Toggle favorite status (custom endpoint example)
   */
  async toggleFavorite(petId: string): Promise<{ is_favorite: boolean }> {
    return ApiOperationWrapper.execute(
      async () =>
        this.apiClient.post<{ is_favorite: boolean }>(
          `${this.basePath}/${petId}/toggle-favorite/`
        ),
      {
        operationName: "togglePetListingFavorite",
        resource: "PetListing",
        identifier: petId,
      }
    );
  }
}

// Create the enhanced client
const enhancedPetClient = new PetListingsApiClient(
  api,
  "PetListing",
  "api/v1/pet-listings"
);

// Export enhanced functions
export const searchPetsByBreed =
  enhancedPetClient.searchByBreed.bind(enhancedPetClient);
export const searchPetsByLocation =
  enhancedPetClient.searchByLocation.bind(enhancedPetClient);
export const togglePetFavorite =
  enhancedPetClient.toggleFavorite.bind(enhancedPetClient);
