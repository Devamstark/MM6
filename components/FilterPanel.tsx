import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

interface FilterPanelProps {
  filters: {
    category: string;
    brand: string;
    minPrice: string;
    maxPrice: string;
    sort: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onClearFilters }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setCategories(await api.getCategories());
      setBrands(await api.getBrands());
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-bold text-gray-900 mb-2">Category</h3>
        <div className="space-y-1">
          <div 
             className={`cursor-pointer text-sm ${filters.category === '' ? 'font-bold text-blue-600' : 'text-gray-600'}`}
             onClick={() => onFilterChange('category', '')}
          >
            All Departments
          </div>
          {categories.map(cat => (
            <div 
              key={cat}
              className={`cursor-pointer text-sm hover:text-blue-600 ${filters.category === cat ? 'font-bold text-blue-600' : 'text-gray-600'}`}
              onClick={() => onFilterChange('category', cat)}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="font-bold text-gray-900 mb-2">Price</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            value={filters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h3 className="font-bold text-gray-900 mb-2">Brand</h3>
        <div className="space-y-1">
          <div 
             className={`cursor-pointer text-sm ${filters.brand === '' ? 'font-bold text-blue-600' : 'text-gray-600'}`}
             onClick={() => onFilterChange('brand', '')}
          >
            All Brands
          </div>
          {brands.map(brand => (
            <div 
              key={brand}
              className={`cursor-pointer text-sm hover:text-blue-600 ${filters.brand === brand ? 'font-bold text-blue-600' : 'text-gray-600'}`}
              onClick={() => onFilterChange('brand', brand)}
            >
              {brand}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onClearFilters}
        className="text-sm text-blue-600 hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
};
