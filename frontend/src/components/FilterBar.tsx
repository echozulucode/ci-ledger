import React from "react";
import Chip from "./Chip";

export interface FilterItem {
  key: string;
  label: string;
}

interface SavedView {
  label: string;
  description?: string;
  onSelect: () => void;
}

interface FilterBarProps {
  activeFilters: FilterItem[];
  onRemoveFilter?: (key: string) => void;
  onClearAll?: () => void;
  children?: React.ReactNode;
  savedViews?: SavedView[];
}

export default function FilterBar({ activeFilters, onRemoveFilter, onClearAll, children, savedViews }: FilterBarProps) {
  const hasFilters = activeFilters.length > 0;

  return (
    <div className="filter-bar" aria-label="Filters">
      <div className="filter-bar__top">
        <div className="filter-bar__controls">{children}</div>
        <div className="filter-bar__saved">
          {savedViews?.map((view) => (
            <button key={view.label} className="btn-ghost" type="button" onClick={view.onSelect} title={view.description}>
              {view.label}
            </button>
          ))}
          {hasFilters && (
            <button className="btn-ghost" type="button" onClick={onClearAll} aria-label="Clear all filters">
              Clear all
            </button>
          )}
        </div>
      </div>
      {hasFilters ? (
        <div className="filter-bar__chips" aria-label="Active filters">
          {activeFilters.map((filter) => (
            <Chip key={filter.key} label={filter.label} onRemove={() => onRemoveFilter?.(filter.key)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
