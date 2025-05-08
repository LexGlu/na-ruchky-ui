"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Check } from "lucide-react";
import pawPrint from "@/public/icons/paw-print.svg";
import mapPin from "@/public/icons/map-pin.svg";
import arrowDown from "@/public/icons/arrow-down.svg";
import dogIcon from "@/public/icons/dog-icon.svg";
import catIcon from "@/public/icons/cat-icon.svg";

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
  placeholder: string;
};

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
    placeholder,
  }: DropdownProps) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleOptionSelect = useCallback(
      (label: string) => {
        onChange(label);
      },
      [onChange]
    );

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

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          onToggle();
        }
      },
      [isOpen, onToggle]
    );

    const displayValue =
      (selectedValue === placeholder ||
        !options.some((opt) => opt.label === selectedValue)) &&
      placeholder
        ? placeholder
        : selectedValue;

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
          onKeyDown={handleKeyDown}
        >
          <span
            className={`truncate block ${
              displayValue === placeholder ? "text-gray-500" : "text-gray-900"
            }`}
          >
            {displayValue}
          </span>
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
        {isOpen && (
          <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 max-h-60 overflow-y-auto">
            <ul
              role="listbox"
              aria-label={`${name} options`}
              className="overflow-visible"
            >
              {options.map((option) => (
                <li
                  key={option.id}
                  role="option"
                  aria-selected={selectedValue === option.label}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                    selectedValue === option.label
                      ? "bg-gray-50 font-medium"
                      : ""
                  } ${
                    option.label === placeholder
                      ? "text-gray-500"
                      : "text-gray-900"
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
                  }}
                >
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
FilterDropdown.displayName = "FilterDropdown";

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
      type="button"
    >
      {label}
    </button>
  )
);
CategoryTab.displayName = "CategoryTab";

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
          role="presentation"
        >
          {checked && (
            <Check size={14} className="text-white" strokeWidth={3} />
          )}
        </div>
        <label
          htmlFor="vaccinations"
          className="ml-2 block text-sm text-gray-900 cursor-pointer"
          id="vaccination-label"
        >
          Наявні усі щеплення
        </label>
      </div>
    </div>
  )
);
VaccinationCheckbox.displayName = "VaccinationCheckbox";

export default function SearchBar() {
  const router = useRouter();

  // --- Placeholder Constants ---
  const ALL_TAB_PLACEHOLDER = "Оберіть тип житла";
  const BREED_PLACEHOLDER = "Оберіть породу";
  const LOCATION_PLACEHOLDER = "Уся Україна";
  const AGE_PLACEHOLDER = "Вік";

  // --- State for the dynamic primary filter ---
  const [primaryFilterSelectedValue, setPrimaryFilterSelectedValue] =
    useState<string>(ALL_TAB_PLACEHOLDER);
  const [primaryFilterOptions, setPrimaryFilterOptions] = useState<
    FilterOption[]
  >([]);
  const [primaryFilterIcon, setPrimaryFilterIcon] = useState<string>(pawPrint);
  const [primaryFilterIconAlt, setPrimaryFilterIconAlt] =
    useState<string>("Housing type");
  const [primaryFilterName, setPrimaryFilterName] = useState<string>("housing");
  const [currentPrimaryPlaceholder, setCurrentPrimaryPlaceholder] =
    useState<string>(ALL_TAB_PLACEHOLDER);

  // --- Other filter states ---
  const [locationFilter, setLocationFilter] =
    useState<string>(LOCATION_PLACEHOLDER);
  const [ageFilter, setAgeFilter] = useState<string>(AGE_PLACEHOLDER);
  const [vaccinated, setVaccinated] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  // --- Static Filter Options Data ---
  const housingOptionsData: FilterOption[] = [
    { id: "apartment", label: "Можна утримувати в квартирі" },
    { id: "house", label: "Можна утримувати в будинку" },
    { id: "outdoor", label: "Можна утримувати на вулиці" },
  ];

  const dogBreedOptionsData: FilterOption[] = [
    { id: "german-shepherd", label: "Німецька вівчарка" },
    { id: "yorkshire-terrier", label: "Йоркширський тер'єр" },
    { id: "labrador-retriever", label: "Лабрадор ретривер" },
    { id: "chihuahua", label: "Чихуахуа" },
    { id: "french-bulldog", label: "Французький бульдог" },
  ];

  const catBreedOptionsData: FilterOption[] = [
    { id: "british-shorthair", label: "Британська короткошерста" },
    { id: "maine-coon", label: "Мейн-кун" },
    { id: "scottish-fold", label: "Шотландська висловуха" },
    { id: "sphynx", label: "Сфінкс" },
    { id: "bengal", label: "Бенгальська" },
  ];

  const locationOptions: FilterOption[] = [
    { id: "kyiv", label: "Київ" },
    { id: "lviv", label: "Львів" },
    { id: "odesa", label: "Одеса" },
    { id: "kharkiv", label: "Харків" },
  ];
  const selectableLocationOptions: FilterOption[] = [
    { id: "all-ukraine", label: LOCATION_PLACEHOLDER },
    ...locationOptions,
  ];

  const ageOptionsData: FilterOption[] = [
    { id: "puppy", label: "До 1 року" },
    { id: "young", label: "1-3 роки" },
    { id: "adult", label: "3-8 років" },
    { id: "senior", label: "Від 8 років" },
  ];

  const selectableAgeOptions: FilterOption[] = [
    { id: "any-age", label: AGE_PLACEHOLDER },
    ...ageOptionsData,
  ];

  useEffect(() => {
    let newSelectedValue = primaryFilterSelectedValue;
    let newOptions: FilterOption[] = [];
    let newIcon = primaryFilterIcon;
    let newIconAlt = primaryFilterIconAlt;
    let newName = primaryFilterName;
    let newPlaceholder = currentPrimaryPlaceholder;

    if (activeTab === "all") {
      newOptions = housingOptionsData;
      newIcon = pawPrint;
      newIconAlt = "Housing type";
      newName = "housing";
      newPlaceholder = ALL_TAB_PLACEHOLDER;

      if (
        !housingOptionsData.some(
          (opt) => opt.label === primaryFilterSelectedValue
        ) &&
        primaryFilterSelectedValue !== ALL_TAB_PLACEHOLDER
      ) {
        newSelectedValue = ALL_TAB_PLACEHOLDER;
      }
    } else if (activeTab === "dog") {
      newOptions = dogBreedOptionsData;
      newIcon = dogIcon;
      newIconAlt = "Dog breed";
      newName = "breedDog";
      newPlaceholder = BREED_PLACEHOLDER;
      if (
        !dogBreedOptionsData.some(
          (opt) => opt.label === primaryFilterSelectedValue
        ) &&
        primaryFilterSelectedValue !== BREED_PLACEHOLDER
      ) {
        newSelectedValue = BREED_PLACEHOLDER;
      }
    } else if (activeTab === "cat") {
      newOptions = catBreedOptionsData;
      newIcon = catIcon;
      newIconAlt = "Cat breed";
      newName = "breedCat";
      newPlaceholder = BREED_PLACEHOLDER;
      if (
        !catBreedOptionsData.some(
          (opt) => opt.label === primaryFilterSelectedValue
        ) &&
        primaryFilterSelectedValue !== BREED_PLACEHOLDER
      ) {
        newSelectedValue = BREED_PLACEHOLDER;
      }
    }

    setPrimaryFilterOptions(newOptions);
    setPrimaryFilterIcon(newIcon);
    setPrimaryFilterIconAlt(newIconAlt);
    setPrimaryFilterName(newName);
    setCurrentPrimaryPlaceholder(newPlaceholder);
    setPrimaryFilterSelectedValue(newSelectedValue);

    setActiveDropdown(null); // Close dropdown when tab changes
  }, [activeTab]);

  // --- Dropdown toggle handlers ---
  const togglePrimaryFilterDropdown = useCallback(() => {
    setActiveDropdown((prev) => (prev === "primary" ? null : "primary"));
  }, []);

  const toggleLocationDropdown = useCallback(() => {
    setActiveDropdown((prev) => (prev === "location" ? null : "location"));
  }, []);

  const toggleAgeDropdown = useCallback(() => {
    setActiveDropdown((prev) => (prev === "age" ? null : "age"));
  }, []);

  // --- Filter change handlers ---
  const handlePrimaryFilterChange = useCallback((value: string) => {
    setPrimaryFilterSelectedValue(value);
  }, []);

  const handleLocationChange = useCallback((value: string) => {
    setLocationFilter(value);
  }, []);

  const handleAgeChange = useCallback((value: string) => {
    setAgeFilter(value);
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const toggleVaccinated = useCallback(() => {
    setVaccinated((prev) => !prev);
  }, []);

  // --- Handle search button click ---
  const handleSearch = useCallback(() => {
    const queryParams = new URLSearchParams();

    if (activeTab !== "all") {
      queryParams.set("species", activeTab);
    }

    if (primaryFilterSelectedValue !== currentPrimaryPlaceholder) {
      if (activeTab === "all") {
        queryParams.set("housing", primaryFilterSelectedValue);
      } else {
        queryParams.set("breed", primaryFilterSelectedValue);
      }
    }

    if (locationFilter !== LOCATION_PLACEHOLDER) {
      queryParams.set("location", locationFilter);
    }

    if (ageFilter !== AGE_PLACEHOLDER) {
      queryParams.set("age", ageFilter);
    }

    if (vaccinated) {
      queryParams.set("vaccinated", "true");
    }

    router.push(`/search?${queryParams.toString()}`);
  }, [
    activeTab,
    primaryFilterSelectedValue,
    currentPrimaryPlaceholder,
    locationFilter,
    ageFilter,
    vaccinated,
    router,
  ]);

  const categoryTabs = [
    { id: "all", label: "Усі" },
    { id: "dog", label: "Собаки" },
    { id: "cat", label: "Коти" },
  ];

  return (
    <div className="w-full">
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

      <div className="flex flex-col sm:flex-row gap-1 mb-3">
        <FilterDropdown
          options={primaryFilterOptions}
          selectedValue={primaryFilterSelectedValue}
          isOpen={activeDropdown === "primary"}
          onChange={handlePrimaryFilterChange}
          onToggle={togglePrimaryFilterDropdown}
          icon={primaryFilterIcon}
          iconAlt={primaryFilterIconAlt}
          name={primaryFilterName}
          placeholder={currentPrimaryPlaceholder}
        />

        <FilterDropdown
          options={selectableLocationOptions}
          selectedValue={locationFilter}
          isOpen={activeDropdown === "location"}
          onChange={handleLocationChange}
          onToggle={toggleLocationDropdown}
          icon={mapPin}
          iconAlt="Location"
          name="location"
          placeholder={LOCATION_PLACEHOLDER}
        />

        <FilterDropdown
          options={selectableAgeOptions}
          selectedValue={ageFilter}
          isOpen={activeDropdown === "age"}
          onChange={handleAgeChange}
          onToggle={toggleAgeDropdown}
          name="age"
          placeholder={AGE_PLACEHOLDER}
        />

        <button
          onClick={handleSearch}
          className="py-3 px-8 bg-black text-white leading-none rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors cursor-pointer"
          aria-label="Search for pets"
          type="button"
        >
          Пошук
        </button>
      </div>

      <VaccinationCheckbox checked={vaccinated} onChange={toggleVaccinated} />
    </div>
  );
}
