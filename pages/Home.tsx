import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { CountdownTimer } from '../components/CountdownTimer';

// Utility to get a generic placeholder image and formatted title based on category string
const getCategoryDetails = (catName: string) => {
  const norm = catName.toLowerCase();
  let image = 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200'; // Default fashion
  let title = catName;

  if (norm.includes('women')) {
    image = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200';
    title = "Women's Collection";
  } else if (norm.includes('men')) {
    image = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200';
    title = "Men's Collection";
  } else if (norm.includes('access')) {
    image = 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=1200';
    title = "Accessories";
  } else if (norm.includes('shoes') || norm.includes('footwear')) {
    image = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200';
  } else if (norm.includes('electronics') || norm.includes('tech')) {
    image = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200';
  } else if (norm.includes('sale') || norm.includes('clearance')) {
    image = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200';
  }

  return { image, title };
};

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [homeSections, setHomeSections] = useState<any[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [closestFlashSaleEnd, setClosestFlashSaleEnd] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [featuredPage, setFeaturedPage] = useState(1);
  const [hasMoreFeatured, setHasMoreFeatured] = useState(false);
  const [loadingMoreFeatured, setLoadingMoreFeatured] = useState(false);

  const [heroLoading, setHeroLoading] = useState(true);    // controls hero skeleton only
  const [contentLoading, setContentLoading] = useState(true); // controls product skeletons

  // Auto-rotate hero banners every 6 seconds
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  const goToPreviousHero = () => {
    if (heroBanners.length <= 1) return;
    setCurrentHeroIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  const goToNextHero = () => {
    if (heroBanners.length <= 1) return;
    setCurrentHeroIndex((prev) => (prev + 1) % heroBanners.length);
  };

  const goToHeroSlide = (index: number) => {
    setCurrentHeroIndex(index);
  };

  // Redirect Admins and Sellers to their dashboards
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'seller') {
      navigate('/seller');
    }
  }, [user, navigate]);

  useEffect(() => {
    // ── PHASE 1: Critical path — hero + categories only ──────────────────────
    // These render above the fold immediately. Everything else waits.
    const fetchCritical = async () => {
      try {
        const [banners, cats] = await Promise.all([
          api.getHeroBanners().catch(() => []),
          api.getCategories().catch(() => []),
        ]);
        setHeroBanners(
          banners.filter((b: any) => b.is_active).sort((a: any, b: any) => a.display_order - b.display_order)
        );
        setCategories(cats);
      } catch (err) {
        console.error('Critical fetch failed:', err);
        setError('Failed to connect to the server. Please ensure the backend is running.');
      } finally {
        setHeroLoading(false); // hero shows immediately
      }
    };

    // ── PHASE 2: Non-critical — products & sections (deferred) ─────────────
    // Runs in parallel with Phase 1 but does not block the hero render.
    const fetchContent = async () => {
      try {
        const [sections, featuredRes, popularRes, allProductsRes] = await Promise.all([
          api.getHomeSections().catch(() => []),
          api.getProducts({ isFeatured: true }).catch(() => ({ results: [], next: null })),
          api.getProducts({ isPopular: true }).catch(() => ({ results: [] })),
          api.getProducts({}).catch(() => ({ results: [] }))
        ]);

        const featured = (featuredRes as any).results || [];
        const popular = (popularRes as any).results || [];
        const allProducts = (allProductsRes as any).results || [];

        setHomeSections(
          sections.filter((s: any) => s.is_active).sort((a: any, b: any) => a.display_order - b.display_order)
        );
        setFeaturedProducts(featured);
        setHasMoreFeatured(!!(featuredRes as any).next);
        setPopularProducts(popular.slice(0, 4));

        const now = new Date();
        const flashSales = allProducts.filter((p: any) =>
          p.flashSaleEnd && new Date(p.flashSaleEnd) > now
        );
        setFlashSaleProducts(flashSales);

        if (flashSales.length > 0) {
          const ends = flashSales.map((p: any) => new Date(p.flashSaleEnd!).getTime());
          const earliestEnd = new Date(Math.min(...ends));
          setClosestFlashSaleEnd(earliestEnd.toISOString());
        }
      } catch (err) {
        console.error('Content fetch failed:', err);
      } finally {
        setContentLoading(false);
      }
    };

    fetchCritical();
    fetchContent(); // fire both in parallel — hero resolves first
  }, []);

  const handleLoadMoreFeatured = async () => {
    if (loadingMoreFeatured || !hasMoreFeatured) return;
    setLoadingMoreFeatured(true);
    try {
      const nextPage = featuredPage + 1;
      const res = await api.getProducts({ isFeatured: true, page: nextPage });
      setFeaturedProducts(prev => [...prev, ...res.results]);
      setFeaturedPage(nextPage);
      setHasMoreFeatured(!!res.next);
    } catch (err) {
      console.error('Failed to load more featured products:', err);
    } finally {
      setLoadingMoreFeatured(false);
    }
  };

  if (user?.role === 'admin' || user?.role === 'seller') return null;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white dark:bg-gray-950 text-center px-4 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white pb-20 dark:bg-gray-900 transition-colors duration-300">

      {/* Hero Section — shows skeleton while loading, then crossfade carousel */}
      {heroLoading ? (
        // Professional shimmer skeleton — same dimensions as real hero
        <div className="relative overflow-hidden w-full h-[420px] md:h-[500px] bg-gray-100 dark:bg-gray-800">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s infinite',
            }}
          />
          {/* Skeleton content blocks */}
          <div className="max-w-[1600px] mx-auto h-full px-8 md:px-16 flex items-center">
            <div className="w-full md:w-1/2 space-y-4">
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-10 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="flex gap-3 pt-4">
                <div className="h-12 w-36 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                <div className="h-12 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ) : heroBanners.length > 0 ? (
        <div className="relative overflow-hidden w-full h-[500px] md:h-[420px]">
          <AnimatePresence mode="wait" initial={false}>
            {heroBanners.map((banner: any, index: number) => {
              if (index !== currentHeroIndex) return null;
              return (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                  className="absolute inset-0 w-full h-full"
                  style={{ backgroundColor: banner.background_color || '#f6f6f6' }}
                >
                  <div className="max-w-[1600px] mx-auto h-full px-4 sm:px-8 md:px-16 flex flex-col md:flex-row items-center">
                    {/* Text Container */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left z-10 py-8 md:py-0">
                      {banner.subtitle && (
                        <span className="text-primary font-bold tracking-widest text-sm uppercase mb-4">
                          {banner.subtitle}
                        </span>
                      )}
                      <h1
                        className="font-black text-black leading-tight mb-6 font-heading dark:text-white"
                        style={{ fontSize: `calc(${(banner.content_scale ?? 100) * 0.01} * 3.75rem)` }}
                      >
                        {banner.title}
                      </h1>
                      {banner.description && (
                        <p
                          className="text-gray-600 mb-8 max-w-md dark:text-gray-300 line-clamp-2 md:line-clamp-3"
                          style={{ fontSize: `calc(${(banner.content_scale ?? 100) * 0.01} * 1.125rem)` }}
                        >
                          {banner.description}
                        </p>
                      )}
                      <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        {banner.cta_text && (
                          <Link
                            to={banner.cta_link || '/products'}
                            className="bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-all dark:bg-white dark:text-black dark:hover:bg-gray-200 text-center flex items-center justify-center min-w-[180px] px-10"
                            style={{
                              height: `calc(${(banner.content_scale ?? 100) * 0.01} * 3.5rem)`,
                              padding: `0 calc(${(banner.content_scale ?? 100) * 0.01} * 2.5rem)`,
                              fontSize: `calc(${(banner.content_scale ?? 100) * 0.01} * 0.875rem)`
                            }}
                          >
                            {banner.cta_text}
                          </Link>
                        )}
                        <Link
                          to="/register"
                          className="bg-white border-2 border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all dark:bg-transparent dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black text-center flex items-center justify-center min-w-[180px] px-10"
                          style={{
                            height: `calc(${(banner.content_scale ?? 100) * 0.01} * 3.5rem)`,
                            padding: `0 calc(${(banner.content_scale ?? 100) * 0.01} * 2.5rem)`,
                            fontSize: `calc(${(banner.content_scale ?? 100) * 0.01} * 0.875rem)`
                          }}
                        >
                          Sell Now
                        </Link>
                      </div>
                    </div>

                    {/* Image Container */}
                    <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden order-first md:order-last">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          fetchPriority={index === 0 ? 'high' : 'auto'}
                          className="absolute inset-0 w-full h-full"
                          style={{
                            objectFit: (banner.image_fit as any) || 'cover',
                            objectPosition: banner.image_position || 'center'
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Navigation Arrows */}
          {heroBanners.length > 1 && (
            <>
              <button
                onClick={goToPreviousHero}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-20"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-gray-900" />
              </button>
              <button
                onClick={goToNextHero}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-20"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-gray-900" />
              </button>
            </>
          )}

          {/* Navigation Dots */}
          {heroBanners.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {heroBanners.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => goToHeroSlide(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${currentHeroIndex === index
                    ? 'bg-black w-8'
                    : 'bg-black/30 hover:bg-black/50 w-3'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Default Hero Section */
        <div className="relative bg-[#f6f6f6] dark:bg-gray-800 transition-colors duration-300 h-[500px] md:h-[420px] overflow-hidden">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center h-full px-4 sm:px-8 md:px-16">
            <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left py-8 md:py-0">
              <span className="text-primary font-bold tracking-widest text-sm uppercase mb-4">Summer Sale</span>
              <h1 className="text-4xl md:text-5xl font-black text-black leading-tight mb-4 font-heading dark:text-white">
                UP TO <span className="text-primary">70%</span> OFF
              </h1>
              <p className="text-gray-600 text-sm md:text-base mb-6 max-w-md dark:text-gray-300 line-clamp-2 md:line-clamp-3">
                Discover the hottest trends of the season. Shop the collection now before it's gone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/products" className="bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-all dark:bg-white dark:text-black dark:hover:bg-gray-200 text-center flex items-center justify-center min-w-[180px] h-14 px-10">
                  Shop Now
                </Link>
                <Link to="/register" className="bg-white border-2 border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all dark:bg-transparent dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black text-center flex items-center justify-center min-w-[180px] h-14 px-10">
                  Sell Now
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden order-first md:order-last">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                alt="Fashion Model"
                className="absolute inset-0 w-full h-full object-cover object-top hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </div>
        </div>
      )}

      {/* Categories Row (Dynamic Layout) */}
      {categories.length > 0 && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2 font-heading text-zinc-900 dark:text-white">Shop By Category</h2>
            <div className="w-16 h-1 bg-zinc-900 mx-auto dark:bg-white"></div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 w-full">
            {categories.slice(0, 4).map((cat, idx) => {
              const { image, title } = getCategoryDetails(cat);
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] max-w-[400px]"
                >
                  <Link to={`/products?category=${cat}`} className="group relative block w-full h-[320px] overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-sm">
                    <img
                      src={image}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/90"></div>

                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h3>
                      <div className="flex items-center gap-2 text-white/90 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Explore Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Flash Sale Banner */}
      {flashSaleProducts.length > 0 && closestFlashSaleEnd && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-16"
        >
          <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group dark:bg-primary/10 dark:border-primary/30">
            {/* ... banner content ... */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>

            <div className="flex items-center gap-8 z-10">
              <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <Zap className="w-10 h-10 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase rounded-full tracking-tighter">Limited Time</span>
                  <h2 className="text-4xl font-black uppercase text-primary italic font-heading tracking-tighter">Flash Sale</h2>
                </div>
                <p className="text-gray-500 font-bold text-lg uppercase tracking-tight dark:text-gray-400">Up to <span className="text-black dark:text-white">60% OFF</span> on {flashSaleProducts.length} curated items</p>
              </div>
            </div>

            <div className="z-10 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-xl dark:bg-black/50 dark:border-white/10">
              <CountdownTimer endTime={closestFlashSaleEnd} onExpire={() => setFlashSaleProducts([])} />
            </div>

            <Link
              to="/products?flash_sale=true"
              className="px-12 py-5 bg-black text-white font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 transition-all shadow-2xl hover:shadow-black/20 hover:-translate-y-1 z-10 group-hover:scale-105 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:shadow-white/20"
            >
              Shop the Drop
            </Link>
          </div>
        </motion.div>
      )}

      {/* Featured Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-2 font-heading text-zinc-900 dark:text-white">Daily Drops</h2>
          <div className="w-16 h-1 bg-zinc-900 mx-auto dark:bg-white"></div>
        </div>

        {contentLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12">
            <SkeletonCard count={10} />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12"
          >
            {featuredProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} priority={i < 4} />
            ))}
          </motion.div>
        )}

        {hasMoreFeatured ? (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMoreFeatured}
              disabled={loadingMoreFeatured}
              className="bg-black text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg hover:shadow-black/20 hover:-translate-y-1 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {loadingMoreFeatured ? 'Loading...' : 'Load More Drops'}
            </button>
          </div>
        ) : (
          <div className="mt-12 text-center">
            <Link to="/products" className="inline-flex items-center gap-2 border-b-2 border-black pb-1 text-sm font-bold uppercase tracking-widest hover:text-primary hover:border-primary transition-all dark:border-white dark:text-white dark:hover:text-primary dark:hover:border-primary">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Full Width Banner */}
      <div className="mt-20 relative h-[500px] bg-fixed bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop)' }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">Sustainable Fashion</h2>
          <p className="text-lg md:text-xl max-w-2xl mb-8 font-light">
            Style that doesn't cost the earth. Check out our new eco-friendly collection made from 100% recycled materials.
          </p>
          <Link to="/products" className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-100 transition-all">
            Explore Collection
          </Link>
        </div>
      </div>

    </div>
  );
};