/**
 * Skeleton component mimicking the pet card.
 */
export function PetCardSkeleton() {
  return (
    <div className="relative group w-full h-[401px] overflow-hidden rounded-xl bg-gray-100 shadow-sm animate-pulse">
      {/* Simulated image area */}
      <div className="w-full h-2/3 bg-gray-200" />
      {/* Lower content area */}
      <div className="p-4">
        <div className="mb-2 h-6 w-3/4 bg-gray-200 rounded" />
        <div className="mb-2 h-4 w-1/2 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-4 w-10 bg-gray-200 rounded" />
          <div className="h-4 w-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Multiple pet card skeletons in a responsive grid matching the PetList layout.
 */
export function PetCardSkeletons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <PetCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Skeleton component mimicking the new pet card.
 */
export function NewPetCardSkeleton() {
  return (
    <div className="relative w-[220px] h-[310px]">
      <div className="h-full w-full rounded-[12px] overflow-hidden bg-gray-200 animate-pulse">
        {/* Empty div for the image area */}
      </div>
      <div className="absolute bottom-0 left-0 right-0 rounded-[10px] bg-white m-1 px-4 py-3 shadow-sm">
        {/* Title skeleton */}
        <div className="h-[24px] bg-gray-200 rounded-md animate-pulse mb-2"></div>
        {/* Subtitle skeleton */}
        <div className="h-[16px] bg-gray-200 rounded-md animate-pulse w-3/4"></div>
      </div>
    </div>
  );
}
