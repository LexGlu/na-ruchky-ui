"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PetType, filterOptions } from "@/lib/types/pets";

// ============================================================================
// URL PARAMETER UTILITIES
// ============================================================================

/**
 * Creates a new URLSearchParams instance from existing search params
 */
const createURLParams = (searchParams: URLSearchParams): URLSearchParams => {
  return new URLSearchParams(searchParams.toString());
};

/**
 * Gets filter value from search params with fallback
 */
const getFilterValue = (
  searchParams: URLSearchParams,
  param: string
): string | null => {
  return searchParams.get(param);
};

/**
 * Determines current pet type from search params
 */
const getPetType = (searchParams: URLSearchParams): PetType => {
  const species = searchParams.get("species");
  if (species === "cat") return "cats";
  if (species === "dog") return "dogs";
  return "all";
};

/**
 * Gets boolean filter states
 */
const getBooleanFilter = (
  searchParams: URLSearchParams,
  param: string
): boolean => {
  return searchParams.get(param) === "true";
};

/**
 * Checks if any filters are active (excluding pet type)
 */
const hasActiveFilters = (searchParams: URLSearchParams): boolean => {
  const excludeParams = new Set(["species"]); // Don't count species as "filter"

  return Array.from(searchParams.keys()).some((key) => !excludeParams.has(key));
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export function usePetsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  // ============================================================================
  // COMPUTED VALUES (Memoized for performance)
  // ============================================================================

  const currentState = useMemo(
    () => ({
      petType: getPetType(searchParams),
      isVaccinated: getBooleanFilter(searchParams, "is_vaccinated"),
      isHypoallergenic: getBooleanFilter(searchParams, "is_hypoallergenic"),
      hasFilters: hasActiveFilters(searchParams),
    }),
    [searchParams]
  );

  const getFilterValueMemo = useCallback(
    (param: string) => getFilterValue(searchParams, param) || "",
    [searchParams]
  );

  // ============================================================================
  // URL UPDATE HANDLER
  // ============================================================================

  const updateURL = useCallback(
    (params: URLSearchParams) => {
      const newUrl = params.toString() ? `/?${params.toString()}` : "/";
      router.push(newUrl, { scroll: false });
    },
    [router]
  );

  // ============================================================================
  // FILTER HANDLERS
  // ============================================================================

  /**
   * Handle pet type changes (all/cats/dogs tabs)
   */
  const handlePetTypeChange = useCallback(
    (type: PetType) => {
      const params = createURLParams(searchParams);

      if (type === "all") {
        params.delete("species");
      } else {
        params.set("species", type === "cats" ? "cat" : "dog");
      }

      updateURL(params);
    },
    [searchParams, updateURL]
  );

  /**
   * Handle vaccination filter toggle
   */
  const handleVaccinationChange = useCallback(
    (checked: boolean) => {
      const params = createURLParams(searchParams);

      if (checked) {
        params.set("is_vaccinated", "true");
      } else {
        params.delete("is_vaccinated");
      }

      updateURL(params);
    },
    [searchParams, updateURL]
  );

  /**
   * Handle hypoallergenic filter toggle
   */
  const handleHypoallergenicChange = useCallback(
    (checked: boolean) => {
      const params = createURLParams(searchParams);

      if (checked) {
        params.set("is_hypoallergenic", "true");
      } else {
        params.delete("is_hypoallergenic");
      }

      updateURL(params);
    },
    [searchParams, updateURL]
  );

  /**
   * Toggle dropdown filter visibility
   */
  const toggleFilter = useCallback((filterName: string) => {
    setOpenFilter((prev) => (prev === filterName ? null : filterName));
  }, []);

  /**
   * Handle dropdown filter selection
   */
  const handleFilterSelect = useCallback(
    (param: string, value: string) => {
      const params = createURLParams(searchParams);
      const currentValue = getFilterValue(searchParams, param);

      // Toggle off if selecting same value
      if (value === currentValue) {
        // Special handling for age filters (clear both min and max)
        if (param === "age_group") {
          params.delete("min_age");
          params.delete("max_age");
          params.delete("age_group");
        } else {
          params.delete(param);
        }
      } else {
        // Handle age group special logic
        if (param === "age_group") {
          // Find the corresponding age option from filterOptions
          const ageFilter = filterOptions.find((f) => f.param === "age_group");
          const selectedOption = ageFilter?.options.find(
            (opt) => opt.value === value
          );

          if (selectedOption) {
            params.set("age_group", value);

            // Set min/max age if provided by the option
            if ("minAgeValue" in selectedOption && selectedOption.minAgeValue) {
              params.set("min_age", selectedOption.minAgeValue);
            } else {
              params.delete("min_age");
            }

            if ("maxAgeValue" in selectedOption && selectedOption.maxAgeValue) {
              params.set("max_age", selectedOption.maxAgeValue);
            } else {
              params.delete("max_age");
            }
          }
        } else {
          // Standard filter handling
          params.set(param, value);
        }
      }

      updateURL(params);
      setOpenFilter(null); // Close dropdown after selection
    },
    [searchParams, updateURL]
  );

  /**
   * Remove specific filter
   */
  const handleRemoveFilter = useCallback(
    (param: string) => {
      const params = createURLParams(searchParams);

      // Special handling for age filters
      if (param === "age_group" || param === "min_age") {
        params.delete("min_age");
        params.delete("max_age");
        params.delete("age_group");
      } else {
        params.delete(param);
      }

      updateURL(params);
    },
    [searchParams, updateURL]
  );

  /**
   * Clear all active filters
   */
  const handleClearAllFilters = useCallback(() => {
    // Keep species filter but clear everything else
    const params = new URLSearchParams();
    const currentSpecies = searchParams.get("species");

    if (currentSpecies) {
      params.set("species", currentSpecies);
    }

    updateURL(params);
  }, [searchParams, updateURL]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Get active filter summary for display
   */
  const getActiveFiltersSummary = useCallback(() => {
    const activeFilters: Array<{
      param: string;
      value: string;
      label: string;
    }> = [];

    searchParams.forEach((value, key) => {
      if (key === "species") return; // Skip species as it's handled by tabs

      // Find the filter option that matches this param
      const filter = filterOptions.find((f) => f.param === key);
      if (filter) {
        const option = filter.options.find((opt) => opt.value === value);
        if (option) {
          activeFilters.push({
            param: key,
            value,
            label: `${filter.label}: ${option.label}`,
          });
        }
      } else {
        // Handle boolean filters
        if (key === "is_vaccinated" && value === "true") {
          activeFilters.push({ param: key, value, label: "Vaccinated" });
        } else if (key === "is_hypoallergenic" && value === "true") {
          activeFilters.push({ param: key, value, label: "Hypoallergenic" });
        }
      }
    });

    return activeFilters;
  }, [searchParams]);

  /**
   * Check if current filters are complex (require API)
   */
  const hasComplexFilters = useCallback(() => {
    const complexParams = [
      "min_age",
      "max_age",
      "price_min",
      "price_max",
      "is_vaccinated",
      "is_hypoallergenic",
      "special_needs",
      "created_after",
      "created_before",
    ];

    return complexParams.some((param) => searchParams.has(param));
  }, [searchParams]);

  // ============================================================================
  // RETURN API
  // ============================================================================

  return {
    // State
    openFilter,
    currentPetType: currentState.petType,
    currentIsVaccinated: currentState.isVaccinated,
    currentIsHypoallergenic: currentState.isHypoallergenic,
    hasFilters: currentState.hasFilters,

    // Filter value getter
    getFilterValue: getFilterValueMemo,

    // Handlers
    toggleFilter,
    handlePetTypeChange,
    handleVaccinationChange,
    handleHypoallergenicChange,
    handleFilterSelect,
    handleRemoveFilter,
    handleClearAllFilters,

    // Utilities
    getActiveFiltersSummary,
    hasComplexFilters,

    // Raw search params for advanced usage
    searchParams,
  };
}

// ============================================================================
// ENHANCED VARIANTS
// ============================================================================

/**
 * Simplified hook for basic filtering needs
 */
export function useSimplePetsFilter() {
  const mainHook = usePetsFilter();

  return {
    petType: mainHook.currentPetType,
    changePetType: mainHook.handlePetTypeChange,
    hasFilters: mainHook.hasFilters,
    clearFilters: mainHook.handleClearAllFilters,
  };
}

/**
 * Hook with URL synchronization helpers
 */
export function usePetsFilterWithSync() {
  const mainHook = usePetsFilter();

  const syncToURL = useCallback(
    (filters: Record<string, string | boolean>) => {
      const params = createURLParams(mainHook.searchParams);

      Object.entries(filters).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          if (value) {
            params.set(key, "true");
          } else {
            params.delete(key);
          }
        } else if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      const newUrl = params.toString() ? `/?${params.toString()}` : "/";
      // Use window.history for more control
      window.history.pushState({}, "", newUrl);
    },
    [mainHook.searchParams]
  );

  return {
    ...mainHook,
    syncToURL,
  };
}
