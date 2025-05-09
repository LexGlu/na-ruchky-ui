"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PetType, filterOptions } from "@/lib/types/pets";
import {
  createURLParams,
  getFilterValue,
  getPetType,
  getIsVaccinated,
  getIsHypoallergenic,
  hasActiveFilters,
} from "@/lib/utils/url-params";

export function usePetsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const currentPetType = useMemo(
    () => getPetType(searchParams),
    [searchParams]
  );
  const currentIsVaccinated = useMemo(
    () => getIsVaccinated(searchParams),
    [searchParams]
  );
  const currentIsHypoallergenic = useMemo(
    () => getIsHypoallergenic(searchParams),
    [searchParams]
  );
  const hasFilters = useMemo(
    () => hasActiveFilters(searchParams, filterOptions),
    [searchParams]
  );

  const getFilterValueCallback = useCallback(
    (param: string) => getFilterValue(searchParams, param),
    [searchParams]
  );

  const updateURL = useCallback(
    (params: URLSearchParams) => {
      const newUrl = params.toString() ? `/?${params.toString()}` : "/";
      router.push(newUrl, { scroll: false });
    },
    [router]
  );

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

  const toggleFilter = useCallback((filterName: string) => {
    setOpenFilter((prev) => (prev === filterName ? null : filterName));
  }, []);

  const handleFilterSelect = useCallback(
    (param: string, value: string) => {
      const params = createURLParams(searchParams);
      const currentValue = getFilterValue(searchParams, param);

      if (value === currentValue) {
        if (param === "min_age") {
          params.delete("min_age");
          params.delete("max_age");
        } else {
          params.delete(param);
        }
      } else {
        if (param === "min_age") {
          const selectedOption = filterOptions[0].options.find(
            (opt) => opt.value === value
          );

          if (selectedOption) {
            if (selectedOption.minAgeValue) {
              params.set("min_age", selectedOption.minAgeValue);
            } else {
              params.delete("min_age");
            }

            if (selectedOption.maxAgeValue) {
              params.set("max_age", selectedOption.maxAgeValue);
            } else {
              params.delete("max_age");
            }
          }
        } else {
          params.set(param, value);
        }
      }

      updateURL(params);
      setOpenFilter(null);
    },
    [searchParams, updateURL]
  );

  const handleRemoveFilter = useCallback(
    (param: string) => {
      const params = createURLParams(searchParams);

      if (param === "min_age") {
        params.delete("min_age");
        params.delete("max_age");
      } else {
        params.delete(param);
      }

      updateURL(params);
    },
    [searchParams, updateURL]
  );

  const handleClearAllFilters = useCallback(() => {
    const params = new URLSearchParams();
    updateURL(params);
  }, [updateURL]);

  return {
    openFilter,
    currentPetType,
    currentIsVaccinated,
    currentIsHypoallergenic,
    hasFilters,
    getFilterValue: getFilterValueCallback,
    toggleFilter,
    handlePetTypeChange,
    handleVaccinationChange,
    handleHypoallergenicChange,
    handleFilterSelect,
    handleRemoveFilter,
    handleClearAllFilters,
  };
}
