import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { X } from 'lucide-react';

import { CATEGORIES, MAIN_CATEGORIES } from '../utils/categories';

interface FilterPanelProps {
  filters: {
    category: string;
    subcategory?: string;
    brand: string;
    minPrice: string;
    maxPrice: string;
    sort: string;
    isFeatured?: boolean;
    isPopular?: boolean;
    onSale?: boolean;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onClearFilters }) => {
  // Use constants for categories
  const categories = MAIN_CATEGORIES;
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    // Only fetch brands from API
    const fetchBrands = async () => {
      setBrands(await api.getBrands());
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    // derive subcategories from constant
    if (filters.category && CATEGORIES[filters.category]) {
      setSubcategories(CATEGORIES[filters.category]);
    } else {
      setSubcategories([]);
    }
  }, [filters.category]);

  const hasActiveFilters = filters.category || filters.brand || filters.minPrice || filters.maxPrice;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded-md transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price Filter */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide dark:text-gray-200">Price Range</h3>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
            <input
              type="number"
              placeholder="0"
              className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:bg-gray-800"
              value={filters.minPrice}
              onChange={(e) => onFilterChange('minPrice', e.target.value)}
            />
          </div>
          <span className="text-gray-300 font-light">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
            <input
              type="number"
              placeholder="Max"
              className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:bg-gray-800"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide px-1 dark:text-gray-200">Categories</h3>
        <div className="space-y-2">
          <div
            className={`cursor-pointer px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filters.category === '' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'}`}
            onClick={() => onFilterChange('category', '')}
          >
            All Departments
          </div>
          {categories.map(cat => (
            <div
              key={cat}
              className={`cursor-pointer px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filters.category === cat ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'}`}
              onClick={() => onFilterChange('category', cat)}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Subcategory Filter */}
      {filters.category && subcategories.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide px-1 dark:text-gray-200">Subcategories</h3>
          <div className="space-y-2">
            <div
              className={`cursor-pointer px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${!filters.subcategory ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'}`}
              onClick={() => onFilterChange('subcategory', '')}
            >
              All {filters.category}
            </div>
            {subcategories.map(sub => (
              <div
                key={sub}
                className={`cursor-pointer px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filters.subcategory === sub ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'}`}
                onClick={() => onFilterChange('subcategory', sub)}
              >
                {sub}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brand Filter */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide px-1 dark:text-gray-200">Brands</h3>
        <div className="flex flex-wrap gap-2">
          <div
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filters.brand === '' ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500'}`}
            onClick={() => onFilterChange('brand', '')}
          >
            All
          </div>
          {brands.map(brand => (
            <div
              key={brand}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filters.brand === brand ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500'}`}
              onClick={() => onFilterChange('brand', brand)}
            >
              {brand}
            </div>
          ))}
        </div>
      </div>

      {/* Visibility Filters */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide px-1 dark:text-gray-200">Other</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 transition-all cursor-pointer dark:bg-gray-700 dark:border-gray-600"
              checked={!!filters.isFeatured}
              onChange={(e) => onFilterChange('isFeatured', e.target.checked ? 'true' : '')}
            />
            <span className="text-sm font-semibold text-gray-600 group-hover:text-black transition-colors dark:text-gray-400 dark:group-hover:text-gray-200">Featured Only</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 transition-all cursor-pointer dark:bg-gray-700 dark:border-gray-600"
              checked={!!filters.isPopular}
              onChange={(e) => onFilterChange('isPopular', e.target.checked ? 'true' : '')}
            />
            <span className="text-sm font-semibold text-gray-600 group-hover:text-black transition-colors dark:text-gray-400 dark:group-hover:text-gray-200">Trending (Popular)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300 transition-all cursor-pointer"
              checked={!!filters.onSale}
              onChange={(e) => onFilterChange('on_sale', e.target.checked ? 'true' : '')}
            />
            <span className="text-sm font-semibold text-gray-600 group-hover:text-red-600 transition-colors">On Sale</span>
          </label>
        </div>
      </div>
    </div>
  );
};