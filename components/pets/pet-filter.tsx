"use client";

import { memo } from "react";

import { filterOptions } from "@/lib/types/pets";
import { usePetsFilter } from "@/hooks/use-pets-filter";

import PetTypeTab from "@/components/pets/pet-type-tab";
import FilterDropdown from "@/components/pets/filter-dropdown";
import BaseToggle from "@/components/pets/base-toggle";

import hypoallergenicIcon from "@/public/icons/heart-dark.svg";
import vaccinationIcon from "@/public/icons/syringe-dark.svg";

function PetsFilter() {
  const {
    openFilter,
    currentPetType,
    currentIsVaccinated,
    currentIsHypoallergenic,
    hasFilters,
    getFilterValue,
    toggleFilter,
    handlePetTypeChange,
    handleVaccinationChange,
    handleHypoallergenicChange,
    handleFilterSelect,
    handleRemoveFilter,
    handleClearAllFilters,
  } = usePetsFilter();

  return (
    <div className="flex flex-col text-black pt-8 gap-8 px-4 md:px-0">
      <div className="flex flex-col md:flex-row gap-8 justify-between items-center">
        <div className="w-full md:w-1/3">
          <h2
            className="text-2xl sm:text-3xl md:text-8xl/[82px] font-semibold break-words hyphens-auto"
            id="pets-heading"
          >
            Готові стати другом
          </h2>
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-6 pt-5">
          <p className="text-base sm:text-lg md:text-xl leading-relaxed">
            У кожного вихованця свій характер, особливості та життєва історія.
            Створити найкращі умови для життя тварин.
          </p>

          <div
            className="flex gap-1 sm:gap-2 w-full"
            role="tablist"
            aria-labelledby="pets-heading"
          >
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

      <div className="hidden md:flex flex-col md:flex-row items-start md:items-center justify-between pt-4 gap-4">
        <div
          className="hidden md:flex md:w-2/3 flex-wrap items-center gap-1 sm:gap-2"
          role="group"
          aria-label="Filter options"
        >
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

          {hasFilters && (
            <button
              onClick={handleClearAllFilters}
              className="ml-1 sm:ml-2 text-xs sm:text-sm text-black hover:underline cursor-pointer whitespace-nowrap"
              aria-label="Очистити всі фільтри"
            >
              Очистити фільтри
            </button>
          )}
        </div>

        <div className="hidden md:flex md:w-1/3 flex-col sm:flex-row justify-start md:justify-end items-start sm:items-center mt-4 md:mt-0 gap-3 sm:gap-6">
          <BaseToggle
            isActive={currentIsHypoallergenic}
            onToggle={handleHypoallergenicChange}
            text="Гіпоалергенні"
            icon={hypoallergenicIcon}
          />
          <BaseToggle
            isActive={currentIsVaccinated}
            onToggle={handleVaccinationChange}
            text="Зроблені щеплення"
            icon={vaccinationIcon}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(PetsFilter);
