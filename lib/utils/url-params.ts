import { ReadonlyURLSearchParams } from "next/navigation";
import { FilterOption, PetType } from "@/lib/types/pets";

export function createURLParams(
  searchParams: ReadonlyURLSearchParams
): URLSearchParams {
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    params.append(key, value);
  });
  return params;
}

export function getFilterValue(
  searchParams: ReadonlyURLSearchParams,
  param: string
): string {
  if (param === "min_age") {
    const minAge = searchParams.get("min_age");
    const maxAge = searchParams.get("max_age");

    if (minAge === "3" && !maxAge) return "3+";
    if (!minAge && maxAge === "1") return "0-1";
    if (minAge === "1" && maxAge === "3") return "1-3";
    return "";
  }

  return searchParams.get(param) || "";
}

export function getPetType(searchParams: ReadonlyURLSearchParams): PetType {
  const species = searchParams.get("species");
  if (species === "cat") return "cats";
  if (species === "dog") return "dogs";
  return "all";
}

export function getIsVaccinated(
  searchParams: ReadonlyURLSearchParams
): boolean {
  return searchParams.get("is_vaccinated") === "true";
}

export function getIsHypoallergenic(
  searchParams: ReadonlyURLSearchParams
): boolean {
  return searchParams.get("is_hypoallergenic") === "true";
}

export function hasActiveFilters(
  searchParams: ReadonlyURLSearchParams,
  filterOptions: FilterOption[]
): boolean {
  return (
    getPetType(searchParams) !== "all" ||
    getIsVaccinated(searchParams) ||
    filterOptions.some((filter) => !!getFilterValue(searchParams, filter.param))
  );
}
