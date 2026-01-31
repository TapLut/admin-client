'use client';

import { ReactNode } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { Card } from './Card';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string; // Label prefix like "Type" or "Platform"
  options: FilterOption[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

interface SearchFilterProps {
  // Search props
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  
  // Optional filters
  filters?: FilterConfig[];
  
  // Clear all handler (optional)
  onClearAll?: () => void;
  showClearAll?: boolean;
  
  // Styling
  className?: string;
  
  // Optional action button on the right
  action?: ReactNode;
  
  // Whether to wrap in a Card
  withCard?: boolean;
  
  // Show filters button
  showFiltersButton?: boolean;
  onFiltersClick?: () => void;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  onClearAll,
  showClearAll = false,
  className,
  action,
  withCard = true,
  showFiltersButton = false,
  onFiltersClick,
}: SearchFilterProps) {
  // Check if any filter has a non-empty value
  const hasActiveFilters = filters?.some(f => f.value !== '') || searchValue !== '';

  const content = (
    <div className={clsx('flex flex-col md:flex-row items-center gap-3', className)}>
      {/* Filters Button */}
      {showFiltersButton && (
        <button
          onClick={onFiltersClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-full font-medium text-sm hover:bg-primary/20 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>FILTERS</span>
        </button>
      )}

      {/* Search Input */}
      <div className="flex-1 min-w-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
            className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-full text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>
      
      {/* Filters */}
      {filters && filters.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => {
            const selectedOption = filter.options.find(o => o.value === filter.value);
            const displayLabel = selectedOption?.label || filter.options[0]?.label || '';
            
            return (
              <div key={filter.key} className="relative">
                <select
                  value={filter.value}
                  onChange={filter.onChange}
                  className={clsx(
                    'appearance-none pl-4 pr-10 py-2.5 rounded-full text-sm font-medium cursor-pointer transition-colors',
                    'bg-[#2D2D3A] text-white',
                    'dark:bg-[#2D2D3A] dark:text-white',
                    'hover:bg-[#3D3D4A] dark:hover:bg-[#3D3D4A]',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20',
                    filter.className
                  )}
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {filter.label}: {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}
      
      {/* Clear All */}
      {(showClearAll || hasActiveFilters) && onClearAll && (
        <button
          onClick={onClearAll}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
        >
          Clear All
        </button>
      )}
      
      {/* Optional Action */}
      {action && (
        <div className="flex items-center">
          {action}
        </div>
      )}
    </div>
  );

  if (withCard) {
    return <Card className="!p-4">{content}</Card>;
  }

  return content;
}

// Compact version for inline use
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={clsx('relative', className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-full text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
    </div>
  );
}
