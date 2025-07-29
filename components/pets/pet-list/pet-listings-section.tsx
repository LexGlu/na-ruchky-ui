import { Suspense } from "react";
import { PetsListingsClient } from "./pets-listings.client";
import { PetsListingsLoading } from "./pets-listings.loading";
import { CachedPetsData } from "@/lib/cache/pets.cache";

interface PetsListingsSectionProps {
  staticData: CachedPetsData;
  className?: string;
}

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
    </div>
  );
}
