import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
}

/**
 * Component displayed when no pet listings are found
 */
export default function EmptyState({
  title = "Спеціалістів не знайдено",
  message = "Спробуйте змінити параметри фільтрів",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[401px]">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <SearchX size={48} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-6">{message}</p>
    </div>
  );
}
