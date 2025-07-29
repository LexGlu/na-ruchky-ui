"use client";

import { SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmptyStateProps {
  title?: string;
  message?: string;
}

/**
 * Component displayed when no pet listings are found
 */
export default function EmptyState({ title, message }: EmptyStateProps) {
  const t = useTranslations("PetListings");

  const defaultTitle = title || t("noResults");
  const defaultMessage = message || t("tryDifferentFilters");

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[401px]">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <SearchX size={48} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-medium text-gray-800 mb-2">{defaultTitle}</h3>
      <p className="text-gray-500 max-w-md mb-6">{defaultMessage}</p>
    </div>
  );
}
