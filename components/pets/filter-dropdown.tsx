"use client";

import { memo } from "react";
import { CircleArrowDown, X } from "lucide-react";
import { useClickAway } from "@/hooks/use-click-away";
import { FilterOption } from "@/lib/types/pets";

interface FilterDropdownProps {
  filter: FilterOption;
  isOpen: boolean;
  onToggle: () => void;
  selectedValue: string;
  onSelect: (param: string, value: string) => void;
  onRemove: (param: string) => void;
}

// Memoize component to prevent unnecessary re-renders
const FilterDropdown = memo(function FilterDropdown({
  filter,
  isOpen,
  onToggle,
  selectedValue,
  onSelect,
  onRemove,
}: FilterDropdownProps) {
  const ref = useClickAway<HTMLDivElement>(() => {
    if (isOpen) onToggle();
  });

  const selectedOption = filter.options.find(
    (opt) => opt.value === selectedValue
  );

  // Handle remove click without event propagation
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(filter.param);
  };

  return (
    <div ref={ref} className="relative">
      <div
        onClick={onToggle}
        className="flex items-center h-10 gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`dropdown-${filter.param}`}>
        <span>{filter.label}</span>
        {selectedValue && (
          <div className="ml-1 flex items-center bg-gray-100 px-2 py-0.5 rounded-full text-xs">
            <span>{selectedOption?.label || selectedValue}</span>
            <button
              onClick={handleRemoveClick}
              className="ml-1 p-0.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              tabIndex={0}
              aria-label={`Видалити фільтр ${filter.label}`}>
              <X size={14} />
            </button>
          </div>
        )}
        <CircleArrowDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </div>

      {isOpen && (
        <div
          id={`dropdown-${filter.param}`}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
          role="menu">
          {filter.options.map((option) => (
            <div
              key={option.value}
              className={`w-full text-left text-sm px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors rounded-md ${
                selectedValue === option.value ? "bg-gray-100 font-medium" : ""
              }`}
              onClick={() => onSelect(filter.param, option.value)}
              role="menuitem"
              tabIndex={0}>
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default FilterDropdown;
