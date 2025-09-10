// Lightweight skeleton placeholders for homepage sections.
// These are intentionally minimal and rely on Tailwind utilities only.
// If design changes, adjust here instead of cluttering `app/page.tsx`.

import React from "react";

export const BreedsSkeleton: React.FC = () => (
  <div className="animate-pulse bg-white rounded-3xl px-4 py-6 sm:px-6 md:px-8">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="w-[215px] h-[297px] bg-gray-200 rounded-[20px] flex-shrink-0"
        />
      ))}
    </div>
  </div>
);

export const NewListingsSkeleton: React.FC = () => (
  <div className="animate-pulse bg-white rounded-3xl px-4 py-6 sm:px-6 md:px-8">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="w-[214px] h-[311px] bg-gray-200 rounded-[20px] flex-shrink-0"
        />
      ))}
    </div>
  </div>
);

export const PetListingsSkeleton: React.FC = () => (
  <div className="flex flex-col w-full py-8 px-4 md:px-6 bg-white rounded-3xl shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="w-full h-[401px] bg-gray-200 rounded-[20px]" />
      ))}
    </div>
  </div>
);
