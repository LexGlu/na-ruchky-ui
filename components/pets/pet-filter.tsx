"use client";

import { memo } from "react";
import { filterOptions } from "@/lib/types/pets";
import { usePetsFilter } from "@/hooks/use-pets-filter";
import PetTypeTab from "@/components/pets/pet-type-tab";
import FilterDropdown from "@/components/pets/filter-dropdown";
import VaccinationToggle from "@/components/pets/vaccination-toggle";

function PetsFilter() {
  const {
    openFilter,
    currentPetType,
    currentIsVaccinated,
    hasFilters,
    getFilterValue,
    toggleFilter,
    handlePetTypeChange,
    handleVaccinationChange,
    handleFilterSelect,
    handleRemoveFilter,
    handleClearAllFilters,
  } = usePetsFilter();

  return (
    <div className="flex flex-col text-black gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <h2 className="text-4xl" id="pets-heading">
            Пухнастики
          </h2>
        </div>
        <div className="md:w-1/2 flex flex-col gap-4">
          <p className="text-2xl md:text-4xl font-light">
            Наші спеціалісти, які очікують на свого власника
          </p>

          {/* Pet Type Tabs */}
          <div
            className="flex gap-2 w-full"
            role="tablist"
            aria-labelledby="pets-heading">
            <PetTypeTab
              type="all"
              activeType={currentPetType}
              onSelect={handlePetTypeChange}
            />
            <PetTypeTab
              type="cats"
              activeType={currentPetType}
              onSelect={handlePetTypeChange}
            />
            <PetTypeTab
              type="dogs"
              activeType={currentPetType}
              onSelect={handlePetTypeChange}
            />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row items-center justify-between pt-4">
        <div
          className="w-full md:w-2/3 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter options">
          {filterOptions.map((filter) => (
            <FilterDropdown
              key={filter.label}
              filter={filter}
              isOpen={openFilter === filter.label}
              onToggle={() => toggleFilter(filter.label)}
              selectedValue={getFilterValue(filter.param)}
              onSelect={handleFilterSelect}
              onRemove={handleRemoveFilter}
            />
          ))}

          {/* Clear all filters button */}
          {hasFilters && (
            <button
              onClick={handleClearAllFilters}
              className="ml-2 text-sm text-black hover:underline cursor-pointer"
              aria-label="Очистити всі фільтри">
              Очистити фільтри
            </button>
          )}
        </div>

        <div className="w-full md:w-1/3 flex justify-end items-center mt-4 md:mt-0">
          <VaccinationToggle
            isVaccinated={currentIsVaccinated}
            onToggle={handleVaccinationChange}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(PetsFilter);
