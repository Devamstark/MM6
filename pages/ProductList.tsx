import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Product, ProductFilter } from '../types';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { FilterPanel } from '../components/FilterPanel';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';

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

  // Dynamic SEO based on active filter
  const seoTitle = filters.search
    ? `Search: "${filters.search}" | SmartShop`
    : filters.category
      ? `${filters.category}'s Fashion | SmartShop`
      : filters.flashSale ? 'Flash Sale | SmartShop'
        : filters.sort === 'newest' ? 'New Arrivals | SmartShop'
          : filters.onSale ? 'Sale Items | SmartShop'
            : 'All Products | SmartShop';

  const seoDesc = filters.category
    ? `Shop the latest ${filters.category}'s fashion at SmartShop. Browse clothing, accessories and more with free shipping over $100.`
    : 'Browse all products at SmartShop — premium fashion for men, women and accessories. Filter by category, brand and price.';

  const baseDomain = 'https://smartshop1.us';
  const canonicalUrl = filters.category
    ? `${baseDomain}/products?category=${encodeURIComponent(filters.category)}`
    : `${baseDomain}/products`;

  useSEO({
    title: seoTitle,
    description: seoDesc,
    canonical: canonicalUrl
  });

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

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Dynamic Page Title (mobile) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full mb-8 px-2 md:hidden"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
            {filters.search ? `Results for "${filters.search}"` :
              filters.category ? filters.category :
                filters.flashSale ? 'Flash Sale' :
                  filters.sort === 'newest' ? 'New Arrivals' :
                    filters.onSale ? 'Sale Items' :
                      'All Products'}
          </h1>
        </motion.div>

        {/* Sidebar Filters */}
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full md:w-72 shrink-0"
        >
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
        </motion.aside>

        {/* Main Content */}
        <div className="grow">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-between items-center mb-6 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors"
          >
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
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={searchParams.toString()}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {products.map((product, idx) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} index={idx} priority={idx < 4} />
                </motion.div>
              ))}
              {loading && <SkeletonCard count={4} />}
            </motion.div>
          </AnimatePresence>

          {products.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-900 p-16 text-center rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors"
            >
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">Clear all filters</button>
            </motion.div>
          )}

          {hasMore && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12 flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLoadMore}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-indigo-600 dark:hover:bg-indigo-50 transition-all shadow-lg"
              >
                Load More Products
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};