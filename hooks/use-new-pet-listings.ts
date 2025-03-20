import { useEffect, useState, useRef, useCallback } from "react";
import { fetchPetListings } from "@/lib/api/pets";
import { PetListing } from "@/lib/types/pets";

export function useNewPetListings() {
  const [newPets, setNewPets] = useState<PetListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const fetchNewPets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const searchParams = new URLSearchParams();
      searchParams.append("sort", "-created_at");
      searchParams.append("limit", "10");

      const response = await fetchPetListings(searchParams);
      setNewPets(response.items);
    } catch (error) {
      console.error("Error fetching new pet listings:", error);
      setError("Не вдалося завантажити нові оголошення.");
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    fetchNewPets();
  }, [fetchNewPets]);

  useEffect(() => {
    const checkScroll = () => {
      if (!scrollContainerRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScroll);
      checkScroll();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", checkScroll);
      }
    };
  }, [newPets]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    fetchNewPets();
  }, [fetchNewPets]);

  return {
    newPets,
    isLoading,
    error,
    isRetrying,
    handleRetry,
    scrollContainerRef,
    showLeftArrow,
    showRightArrow,
    scroll,
  };
}
