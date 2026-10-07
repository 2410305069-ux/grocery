import React from 'react';

export const FilterBar = ({ filters, selectedFilter, onSelectFilter }) => {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {filters.map((filter) => {
        const isSelected = selectedFilter === filter;
        return (
          <button
            key={filter}
            onClick={() => onSelectFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 ${
              isSelected
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:border-primary hover:text-primary'
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
};
