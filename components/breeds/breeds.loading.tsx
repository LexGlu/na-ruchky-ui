import { ArrowLeft, Search } from "lucide-react";

export function BreedsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center mb-6">
        <div className="mr-4 p-2 rounded-full">
          <ArrowLeft className="h-5 w-5 text-gray-300" />
        </div>
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
      </div>

      {/* Filters skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input skeleton */}
          <div className="relative flex-grow">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300">
              <Search className="h-5 w-5" />
            </div>
            <div className="w-full h-10 pl-10 pr-4 py-2 bg-gray-100 rounded-lg border border-gray-200"></div>
          </div>

          {/* Species filter skeleton */}
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-20 h-10 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Results count skeleton */}
      <div className="h-4 w-40 bg-gray-200 rounded mb-4"></div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center"
          >
            {/* Image skeleton */}
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-3"></div>

            {/* Name skeleton */}
            <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>

            {/* Species skeleton */}
            <div className="h-3 bg-gray-200 rounded w-12"></div>

            {/* Origin skeleton */}
            <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
          </div>
        ))}
      </div>

      {/* Load more button skeleton */}
      <div className="mt-8 flex justify-center">
        <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

// Alternative: More detailed loading component with shimmer effect
export function BreedsLoadingWithShimmer() {
  return (
    <div className="relative">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center mb-6">
          <div className="mr-4 p-2 rounded-full bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-300" />
          </div>
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>

        {/* Enhanced filters skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search input skeleton */}
            <div className="relative flex-grow">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300">
                <Search className="h-5 w-5" />
              </div>
              <div className="w-full h-10 pl-10 pr-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
                <div className="h-2 bg-gray-200 rounded w-1/3 mt-2"></div>
              </div>
            </div>

            {/* Species filter skeleton */}
            <div className="flex flex-wrap gap-2">
              {[{ width: "w-16" }, { width: "w-20" }, { width: "w-14" }].map(
                (item, i) => (
                  <div
                    key={i}
                    className={`${item.width} h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center`}
                  >
                    <div className="h-2 bg-gray-200 rounded w-8"></div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Results count skeleton */}
        <div className="flex items-center mb-4">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>

        {/* Enhanced grid skeleton */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center border border-gray-50"
            >
              {/* Image skeleton with gradient */}
              <div className="relative w-24 h-24 mb-3 overflow-hidden rounded-full">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="absolute inset-0 bg-white/20 rounded-full"></div>
              </div>

              {/* Content skeleton */}
              <div className="w-full flex flex-col items-center space-y-2">
                {/* Name skeleton - varying widths for realism */}
                <div
                  className={`h-4 bg-gray-200 rounded ${
                    i % 4 === 0
                      ? "w-20"
                      : i % 4 === 1
                      ? "w-16"
                      : i % 4 === 2
                      ? "w-24"
                      : "w-18"
                  }`}
                ></div>

                {/* Species skeleton */}
                <div className="h-3 bg-gray-200 rounded w-12"></div>

                {/* Origin skeleton - sometimes hidden for realism */}
                {i % 3 !== 0 && (
                  <div className="h-3 bg-gray-200 rounded w-14 opacity-70"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load more button skeleton */}
        <div className="mt-8 flex justify-center">
          <div className="w-36 h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
