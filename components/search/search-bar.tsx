"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import pawPrint from "@/public/icons/paw-print.svg";
import mapPin from "@/public/icons/map-pin.svg";
import arrowDown from "@/public/icons/arrow-down.svg";
import { Check } from "lucide-react";

type FilterOption = {
  id: string;
  label: string;
};

type DropdownProps = {
  options: FilterOption[];
  selectedValue: string;
  isOpen: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  icon?: string;
  iconAlt?: string;
  name: string;
};

// Memoized FilterDropdown Component to prevent unnecessary rerenders
const FilterDropdown = memo(
  ({
    options,
    selectedValue,
    isOpen,
    onChange,
    onToggle,
    icon,
    iconAlt,
    name,
  }: DropdownProps) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle option selection
    const handleOptionSelect = useCallback(
      (label: string) => {
        onChange(label);
      },
      [onChange]
    );

    // Close dropdown when clicking outside
    useEffect(() => {
      if (!isOpen) return;

      function handleClickOutside(event: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          onToggle();
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen, onToggle]);

    // Handle keyboard accessibility
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          onToggle();
        }
      },
      [isOpen, onToggle]
    );

    return (
      <div className="relative flex-grow sm:flex-1" ref={dropdownRef}>
        <button
          type="button"
          onClick={onToggle}
          className={`w-full ${
            icon ? "pl-10" : "px-4"
          } pr-8 py-3 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-300 cursor-pointer text-left text-sm transition-colors hover:bg-gray-50`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Select ${name} option`}
          onKeyDown={handleKeyDown}>
          <span className="truncate block">{selectedValue}</span>
        </button>
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Image
              src={icon}
              alt={iconAlt || ""}
              width={20}
              height={20}
              className="w-5 h-5"
              aria-hidden="true"
            />
          </div>
        )}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Image
            src={arrowDown}
            alt=""
            width={16}
            height={16}
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Dropdown options with improved positioning */}
        {isOpen && (
          <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 max-h-60 overflow-y-auto">
            <ul
              role="listbox"
              aria-label={`${name} options`}
              className="overflow-visible">
              {options.map((option) => (
                <li
                  key={option.id}
                  role="option"
                  aria-selected={selectedValue === option.label}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                    selectedValue === option.label
                      ? "bg-gray-50 font-medium"
                      : ""
                  }`}
                  onClick={() => {
                    handleOptionSelect(option.label);
                    onToggle();
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleOptionSelect(option.label);
                      onToggle();
                    }
                  }}>
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

// Set display name for debugging
FilterDropdown.displayName = "FilterDropdown";

// Memoized CategoryTab component
const CategoryTab = memo(
  ({
    id,
    label,
    isActive,
    onClick,
  }: {
    id: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      key={id}
      className={`px-2 py-1 cursor-pointer transition-colors text-xs leading-tight rounded-sm ${
        isActive ? "bg-white font-medium" : "bg-[#C1E270] hover:bg-opacity-80"
      }`}
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Show ${
        label === "Усі" ? "all pets" : `only ${label.toLowerCase()}`
      }`}
      role="tab"
      tabIndex={0}
      type="button">
      {label}
    </button>
  )
);

CategoryTab.displayName = "CategoryTab";

// Memoized VaccinationCheckbox component
const VaccinationCheckbox = memo(
  ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <div className="mt-2 flex items-center">
      <div className="relative flex items-center">
        <input
          id="vaccinations"
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
          aria-label="Filter by vaccination status"
        />
        <div
          className={`
          h-5 w-5 flex items-center justify-center
          rounded-full border transition-colors duration-200 ease-in-out
          cursor-pointer 
          ${checked ? "bg-black border-black" : "bg-white border-gray-300"}
          peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-lime-300
        `}
          onClick={onChange}
          role="presentation">
          {checked && (
            <Check size={14} className="text-white" strokeWidth={3} />
          )}
        </div>
        <label
          htmlFor="vaccinations"
          className="ml-2 block text-sm text-gray-900 cursor-pointer">
          Наявні усі щеплення
        </label>
      </div>
    </div>
  )
);

VaccinationCheckbox.displayName = "VaccinationCheckbox";

export default function SearchBar() {
  const router = useRouter();

  // Filter category state
  const [housingFilter, setHousingFilter] = useState<string>(
    "Можна утримувати в квартирі"
  );
  const [locationFilter, setLocationFilter] = useState<string>("Уся Україна");
  const [ageFilter, setAgeFilter] = useState<string>("Вік");
  const [vaccinated, setVaccinated] = useState<boolean>(false);

  // Active dropdown state - using single state instead of multiple booleans
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>("all");

  // Common options
  const housingOptions: FilterOption[] = [
    { id: "apartment", label: "Можна утримувати в квартирі" },
    { id: "house", label: "Можна утримувати в будинку" },
    { id: "outdoor", label: "Можна утримувати на вулиці" },
  ];

  const locationOptions: FilterOption[] = [
    { id: "all", label: "Уся Україна" },
    { id: "kyiv", label: "Київ" },
    { id: "lviv", label: "Львів" },
    { id: "odesa", label: "Одеса" },
    { id: "kharkiv", label: "Харків" },
  ];

  const ageOptions: FilterOption[] = [
    { id: "any", label: "Вік" },
    { id: "puppy", label: "До 1 року" },
    { id: "young", label: "1-3 роки" },
    { id: "adult", label: "3-8 років" },
    { id: "senior", label: "Від 8 років" },
  ];

  // Improved dropdown toggle handlers with useCallback
  const toggleHousingDropdown = useCallback(() => {
    setActiveDropdown((prev) => (prev === "housing" ? null : "housing"));
  }, []);

  const toggleLocationDropdown = useCallback(() => {
    setActiveDropdown((prev) => (prev === "location" ? null : "location"));
  }, []);

  const toggleAgeDropdown = useCallback(() => {
    setActiveDropdown((prev) => (prev === "age" ? null : "age"));
  }, []);

  // Filter change handlers with useCallback
  const handleHousingChange = useCallback((value: string) => {
    setHousingFilter(value);
  }, []);

  const handleLocationChange = useCallback((value: string) => {
    setLocationFilter(value);
  }, []);

  const handleAgeChange = useCallback((value: string) => {
    setAgeFilter(value);
  }, []);

  // Tab change handler with useCallback
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  // Toggle vaccination checkbox with useCallback
  const toggleVaccinated = useCallback(() => {
    setVaccinated((prev) => !prev);
  }, []);

  // Handle search button click with useCallback
  const handleSearch = useCallback(() => {
    const queryParams = new URLSearchParams();

    if (activeTab !== "all") {
      queryParams.set("species", activeTab);
    }

    if (housingFilter !== "Можна утримувати в квартирі") {
      queryParams.set("housing", housingFilter);
    }

    if (locationFilter !== "Уся Україна") {
      queryParams.set("location", locationFilter);
    }

    if (ageFilter !== "Вік") {
      queryParams.set("age", ageFilter);
    }

    if (vaccinated) {
      queryParams.set("vaccinated", "true");
    }

    router.push(`/search?${queryParams.toString()}`);
  }, [activeTab, housingFilter, locationFilter, ageFilter, vaccinated, router]);

  // Category tabs data
  const categoryTabs = [
    { id: "all", label: "Усі" },
    { id: "dog", label: "Собаки" },
    { id: "cat", label: "Коти" },
  ];

  return (
    <div className="w-full">
      {/* Category tabs */}
      <div className="flex mb-4 gap-[6px] inline-flex">
        {categoryTabs.map((tab) => (
          <CategoryTab
            key={tab.id}
            id={tab.id}
            label={tab.label}
            isActive={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
          />
        ))}
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-col sm:flex-row gap-1 mb-3">
        {/* Housing filter dropdown */}
        <FilterDropdown
          options={housingOptions}
          selectedValue={housingFilter}
          isOpen={activeDropdown === "housing"}
          onChange={handleHousingChange}
          onToggle={toggleHousingDropdown}
          icon={pawPrint}
          iconAlt="Housing type"
          name="housing"
        />

        {/* Location filter dropdown */}
        <FilterDropdown
          options={locationOptions}
          selectedValue={locationFilter}
          isOpen={activeDropdown === "location"}
          onChange={handleLocationChange}
          onToggle={toggleLocationDropdown}
          icon={mapPin}
          iconAlt="Location"
          name="location"
        />

        {/* Age filter dropdown */}
        <FilterDropdown
          options={ageOptions}
          selectedValue={ageFilter}
          isOpen={activeDropdown === "age"}
          onChange={handleAgeChange}
          onToggle={toggleAgeDropdown}
          name="age"
        />

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="py-3 px-8 bg-black text-white leading-none rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors cursor-pointer"
          aria-label="Search for pets"
          type="button">
          Пошук
        </button>
      </div>

      {/* Vaccination checkbox */}
      <VaccinationCheckbox checked={vaccinated} onChange={toggleVaccinated} />
    </div>
  );
}
