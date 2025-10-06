export function PetsListingsLoading() {
  return (
    <div className="animate-pulse">
      {/* Filter Section Loading */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-28"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
      </div>

      {/* Divider */}
      <div className="mb-4 pb-4 border-b border-gray-200"></div>

      {/* Pet Cards Grid Loading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
          >
            {/* Image placeholder */}
            <div className="w-full h-48 bg-gray-200"></div>

            {/* Content placeholder */}
            <div className="p-4 space-y-3">
              {/* Species badge */}
              <div className="h-5 bg-gray-200 rounded-full w-16"></div>

              {/* Title */}
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>

              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 pt-2">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-14"></div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded-full w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more button placeholder */}
      <div className="flex justify-center mt-8">
        <div className="h-12 bg-gray-200 rounded-lg w-40"></div>
      </div>
    </div>
  );
}
