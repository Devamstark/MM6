import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Product, ProductFilter } from '../types';
import { ProductCard } from '../components/ProductCard';
import { FilterPanel } from '../components/FilterPanel';
import { Loader2 } from 'lucide-react';

export const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse filters from URL
  const filters = {
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '',
    search: searchParams.get('search') || '',
    isFeatured: searchParams.get('isFeatured') === 'true',
    isPopular: searchParams.get('isPopular') === 'true'
  };

  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Convert string params to correct types for API
      const validSorts = ['price_asc', 'price_desc', 'newest'];
      const sort = validSorts.includes(filters.sort)
        ? (filters.sort as ProductFilter['sort'])
        : undefined;

      const apiFilters: ProductFilter = {
        ...filters,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        sort,
      };

      const data = await api.getProducts(apiFilters);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-up">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 flex-shrink-0 animate-fade-up delay-100">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
            <FilterPanel
              filters={filters}
              onFilterChange={updateFilter}
              onClearFilters={clearFilters}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow animate-fade-up delay-200">
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-600 px-2">
              {products.length} results {filters.search && `for "${filters.search}"`}
            </div>
            <select
              className="border-none bg-gray-50 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-100 cursor-pointer hover:bg-gray-100 transition-colors"
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="">Sort by: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center h-64 items-center">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, idx) => (
                <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${idx * 50}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-16 text-center rounded-[2rem] shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No products found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold hover:bg-indigo-100 transition-colors">Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};