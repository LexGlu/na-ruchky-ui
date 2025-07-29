import { Suspense } from "react";
import { PetsListingsClient } from "./pets-listings.client";
import { PetsListingsLoading } from "./pets-listings.loading";
import { CachedPetsData } from "@/lib/cache/pets.cache";

// ============================================================================
// INTERFACES
// ============================================================================

interface PetsListingsSectionProps {
  staticData: CachedPetsData;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Pet listings section that leverages ISR by accepting pre-loaded static data
 * This component is optimized for ISR and doesn't need its own revalidation config
 */
export default async function PetsListingsSection({
  staticData,
  className = "",
}: PetsListingsSectionProps) {
  return (
    <div
      className={`flex flex-col w-full py-8 px-4 md:px-6 bg-white rounded-[20px] shadow-sm ${className}`}
      role="region"
      aria-label="Pet listings"
    >
      <Suspense fallback={<PetsListingsLoading />}>
        <PetsListingsClient
          staticData={staticData}
          itemsPerPage={12}
          enableApiFiltering={true}
        />
      </Suspense>

      {/* Development ISR Status */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">
            ISR Static Data Status
          </h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>
              <strong>Static pets loaded:</strong> {staticData.pets.length}
            </p>
            <p>
              <strong>Total count:</strong> {staticData.totalCount}
            </p>
            <p>
              <strong>Species distribution:</strong>{" "}
              {staticData.speciesCounts.dog} dogs,{" "}
              {staticData.speciesCounts.cat} cats
            </p>
            <p>
              <strong>Unique locations:</strong>{" "}
              {Object.keys(staticData.locationCounts).length}
            </p>
            <p>
              <strong>Unique breeds:</strong>{" "}
              {Object.keys(staticData.breedCounts).length}
            </p>
            <p>
              <strong>Data freshness:</strong>{" "}
              {new Date(staticData.lastUpdated).toLocaleString()}
            </p>
            <p>
              <strong>Filtering strategy:</strong> Client-side for fast UX, API
              fallback for complex queries
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
