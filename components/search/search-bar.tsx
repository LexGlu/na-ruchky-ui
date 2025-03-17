"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Species } from "@/lib/types/pets";

import { Search } from "lucide-react";
import CircleArrowDown from "@/public/icons/circle-arrow-down.svg";
import heart from "@/public/icons/heart-syringe.svg";

type SearchCategory = {
  value: string;
  label: string;
  species?: Species;
};

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>({
    value: "all",
    label: "Знайдіть свого працівника щастя",
  });

  const router = useRouter();
  const categoriesRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchCategories: SearchCategory[] = [
    { value: "all", label: "Знайдіть свого працівника щастя" },
    { value: "dog", label: "Собаки", species: "dog" },
    { value: "cat", label: "Коти", species: "cat" },
    { value: "shelter", label: "Притулки" },
    { value: "services", label: "Послуги" },
  ];

  useEffect(() => {
    // Handle clicks outside the dropdown
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard accessibility for dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const queryParams = new URLSearchParams();
      queryParams.set("query", searchTerm);

      if (selectedCategory.species) {
        queryParams.set("species", selectedCategory.species);
      } else if (selectedCategory.value !== "all") {
        queryParams.set("category", selectedCategory.value);
      }

      router.push(`/search?${queryParams.toString()}`);
    }
  };

  const selectCategory = (category: SearchCategory) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto relative z-10">
      <div className="flex flex-col md:flex-row gap-2">
        {/* Category dropdown */}
        <div
          className="relative flex-grow md:max-w-[360px] text"
          ref={dropdownRef}>
          <button
            type="button"
            onClick={toggleDropdown}
            className="w-full pl-10 pr-10 py-3 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-300 cursor-pointer text-left hover:bg-gray-50"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            aria-label="Select search category"
            onKeyDown={handleKeyDown}>
            <span className="truncate block">{selectedCategory.label}</span>
          </button>

          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
            <Image src={heart} alt="heart icon" className="h-5 w-5" priority />
          </div>

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none">
            <Image
              src={CircleArrowDown}
              sizes="16"
              className={`transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              alt="circle-arrow-down icon"
              aria-hidden="true"
            />
          </div>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div
              ref={categoriesRef}
              className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 overflow-hidden"
              role="menu"
              onKeyDown={handleKeyDown}>
              {searchCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => selectCategory(category)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                    selectedCategory.value === category.value
                      ? "bg-gray-50 font-medium"
                      : ""
                  }`}
                  role="menuitem"
                  tabIndex={0}>
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="relative flex-grow">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder={
                selectedCategory.value === "all"
                  ? "Пошук улюбленців, притулків та послуг"
                  : selectedCategory.value === "dog"
                  ? "Пошук собак"
                  : selectedCategory.value === "cat"
                  ? "Пошук котів"
                  : selectedCategory.value === "shelter"
                  ? "Пошук притулків"
                  : selectedCategory.value === "services"
                  ? "Пошук послуг"
                  : "Пошук"
              }
              className="w-full px-4 py-3 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search input"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 rounded-full p-1 cursor-pointer"
              aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        <span className="text-sm text-gray-500">Популярні запити:</span>
        <Link
          href="/search?query=щеня"
          className="text-sm text-gray-700 hover:underline hover:text-gray-900 cursor-pointer">
          щеня
        </Link>
        <Link
          href="/search?query=кошеня"
          className="text-sm text-gray-700 hover:underline hover:text-gray-900 cursor-pointer">
          кошеня
        </Link>
        <Link
          href="/search?query=бігль"
          className="text-sm text-gray-700 hover:underline hover:text-gray-900 cursor-pointer">
          бігль
        </Link>
        <Link
          href="/search?query=вакцинація"
          className="text-sm text-gray-700 hover:underline hover:text-gray-900 cursor-pointer">
          вакцинація
        </Link>
      </div>
    </div>
  );
}
