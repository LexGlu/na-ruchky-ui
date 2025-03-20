"use client";
import { PetListing } from "@/lib/types/pets";
import PetCard from "@/components/pets/pet-card";
import EmptyState from "@/components/pets/pet-list/empty-state";
import InfoCard from "@/components/pets/info-card";
import dogMascot from "@/public/images/mascot-dog.svg";

interface PetListProps {
  petListings: PetListing[];
  className?: string;
  onLoadMore: () => void;
  hasMoreListings: boolean;
  isLoadingMore: boolean;
  itemsPerPage: number;
  totalAdopted: number;
}

/**
 * Component that renders a grid of pet listings or an empty state if none are found
 */
export default function PetList({
  petListings,
  className = "",
  onLoadMore,
  hasMoreListings,
  isLoadingMore,
  itemsPerPage = 8,
  totalAdopted = 245,
}: PetListProps) {
  if (!petListings.length) {
    return <EmptyState />;
  }

  // Info cards content
  const infoCards = [
    {
      id: "total-adopted",
      title: `${totalAdopted}`,
      description: "сімей знайшли нового члена в сім'ю",
      position: 4, // Position after first row (5 cards per row on desktop)
      variant: "white", // First info card is white
      layout: "count", // Use count layout for numeric display
      icon: dogMascot,
    },
    {
      id: "specialists",
      title:
        "Наші спеціалісти з ранкових підйомів вже встигли завоювати серця і довіру в сотнях домівок",
      description: "",
      position: 14, // Position at a point where it won't disrupt the grid
      variant: "green",
      layout: "message", // Use message layout for text
      icon: dogMascot,
    },
  ];

  // Function to determine if a listing should be double sized
  // Place double-sized cards at strategic positions to maintain grid integrity
  const isDoubleSized = (index: number) => {
    // Place double-sized cards at positions that won't disrupt 5-card row grid
    // Double cards should be placed at the end of rows for clean layout
    // For 5-column grid, place at positions 4, 9, 14, etc. (0-indexed)
    const doublePositions = [3, 8, 13, 18, 23];

    // Check if the current index (adjusted for info cards) is in our allowed positions
    const adjustedIndex = getAdjustedIndex(index);

    // Only make specific items double-sized to avoid grid disruption
    return doublePositions.includes(adjustedIndex);
  };

  // Helper function to get "real" index accounting for info cards before this position
  const getAdjustedIndex = (originalIndex: number): number => {
    let adjustment = 0;
    infoCards.forEach((card) => {
      if (card.position <= originalIndex) {
        adjustment++;
      }
    });
    return originalIndex - adjustment;
  };

  type MixedItem =
    | PetListing
    | {
        id: string;
        isInfoCard: true;
        title: string;
        description: string;
        variant: "white" | "green";
        layout?: "count" | "message";
        icon?: string;
      };

  const allItems: MixedItem[] = [...petListings];

  // Insert info cards at their respective positions
  infoCards.forEach((card) => {
    if (card.position < allItems.length + infoCards.length) {
      allItems.splice(card.position, 0, {
        id: card.id,
        isInfoCard: true,
        title: card.title,
        description: card.description,
        variant: card.variant as "white" | "green",
        layout: card.layout as "count" | "message" | undefined,
        icon: card.icon,
      });
    }
  });

  return (
    <div className="flex flex-col w-full">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
        {allItems.map((item, index) => {
          if ("isInfoCard" in item) {
            return (
              <InfoCard
                key={`info-${item.id}`}
                title={item.title}
                description={item.description || ""}
                icon={item.icon}
                variant={item.variant}
                layout={item.layout}
              />
            );
          }

          const listing = item as PetListing;
          const isDouble = isDoubleSized(index);

          return (
            <PetCard
              key={listing.id}
              listing={listing}
              isDouble={isDouble}
              className={isDouble ? "sm:col-span-2 md:col-span-2" : ""}
            />
          );
        })}
      </div>
      {hasMoreListings && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer">
            {isLoadingMore
              ? "Завантаження..."
              : `Завантажити ще ${itemsPerPage} тваринок`}
          </button>
        </div>
      )}
    </div>
  );
}
