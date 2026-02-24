import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Product, ProductFilter } from '../types';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { FilterPanel } from '../components/FilterPanel';
import { Loader2 } from 'lucide-react';

export const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Parse filters from URL
  const filters = {
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '',
    search: searchParams.get('search') || '',
    isFeatured: searchParams.get('isFeatured'),
    isPopular: searchParams.get('isPopular'),
    onSale: searchParams.get('on_sale') === 'true',
    flashSale: searchParams.get('flash_sale') === 'true',
    isNew: searchParams.get('sort') === 'newest'
  };

  useEffect(() => {
    setProducts([]);
    setPage(1);
    loadProducts(1, true);
  }, [searchParams]);

  const loadProducts = async (pageNum: number, isNewSearch: boolean = false) => {
    setLoading(true);
    try {
      const validSorts = ['price_asc', 'price_desc', 'newest'];
      const sort = validSorts.includes(filters.sort)
        ? (filters.sort as ProductFilter['sort'])
        : undefined;

      const apiFilters: ProductFilter = {
        ...filters,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        isFeatured: filters.isFeatured === 'true' ? true : (filters.isFeatured === 'false' ? false : undefined),
        isPopular: filters.isPopular === 'true' ? true : (filters.isPopular === 'false' ? false : undefined),
        sort,
        page: pageNum,
      };

      const res: any = await api.getProducts(apiFilters).catch(() => ({ results: [], count: 0 }));
      let newProducts = res.results || [];

      // Client-side filtering for Flash Sales
      if (filters.flashSale) {
        const now = new Date();
        newProducts = newProducts.filter((p: any) =>
          p.flashSaleEnd && new Date(p.flashSaleEnd) > now
        );
      }

      setProducts(prev => isNewSearch ? newProducts : [...prev, ...newProducts]);
      setTotalCount(res.count || 0);
      setHasMore(!!res.next);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage);
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
        {/* Dynamic Page Title */}
        <div className="w-full mb-8 px-2 md:hidden">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
            {filters.search ? `Results for "${filters.search}"` :
              filters.category ? filters.category :
                filters.flashSale ? 'Flash Sale' :
                  filters.sort === 'newest' ? 'New Arrivals' :
                    filters.onSale ? 'Sale Items' :
                      'All Products'}
          </h1>
        </div>

        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 shrink-0 animate-fade-up delay-100">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24 transition-colors">
            <FilterPanel
              filters={{
                ...filters,
                isFeatured: filters.isFeatured === 'true',
                isPopular: filters.isPopular === 'true',
                onSale: filters.onSale
              } as any}
              onFilterChange={updateFilter}
              onClearFilters={clearFilters}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="grow animate-fade-up delay-200">
          <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300 px-2">
              Showing {products.length} of {totalCount} {totalCount === 1 ? 'item' : 'items'}
            </div>
            <select
              className="border-none bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-gray-200"
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="">Sort by: Featured</option>
              <option value="newest">Sort by: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} priority={idx < 4} />
            ))}
            {loading && <SkeletonCard count={4} />}
          </div>

          {products.length === 0 && !loading && (
            <div className="bg-white dark:bg-gray-900 p-16 text-center rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">Clear all filters</button>
            </div>
          )}

          {hasMore && !loading && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-indigo-600 dark:hover:bg-indigo-50 transition-all shadow-lg hover:shadow-indigo-200 dark:hover:shadow-white/20 hover:-translate-y-1"
              >
                Load More Products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};