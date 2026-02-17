import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowRight, Zap, Clock } from 'lucide-react';
import { CountdownTimer } from '../components/CountdownTimer';

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [closestFlashSaleEnd, setClosestFlashSaleEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Redirect Admins and Sellers to their dashboards
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'seller') {
      navigate('/seller');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featured, popular, cats, allProducts] = await Promise.all([
          api.getProducts({ isFeatured: true }),
          api.getProducts({ isPopular: true }),
          api.getCategories(),
          api.getProducts({}) // Fetch all to find flash sales
        ]);
        setFeaturedProducts(featured.slice(0, 8)); // Show more items
        setPopularProducts(popular.slice(0, 4));
        setCategories(cats);

        // Flash Sale Logic: Find products with active future end time
        const now = new Date();
        const flashSales = allProducts.filter(p =>
          p.flashSaleEnd && new Date(p.flashSaleEnd) > now
        );
        setFlashSaleProducts(flashSales);

        if (flashSales.length > 0) {
          // Find earliest end time among active flash sales
          const ends = flashSales.map(p => new Date(p.flashSaleEnd!).getTime());
          const earliestEnd = new Date(Math.min(...ends));
          setClosestFlashSaleEnd(earliestEnd.toISOString());
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to connect to the server. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (user?.role === 'admin' || user?.role === 'seller') return null;

  if (loading) return <div className="flex justify-center py-40 bg-white"><Loader2 className="animate-spin text-black w-10 h-10" /></div>;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white text-center px-4">
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

      {/* Hero Section */}
      <div className="relative bg-[#f6f6f6] dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto grid md:grid-cols-2">
          <div className="flex flex-col justify-center px-8 py-16 md:py-24 lg:px-16 text-center md:text-left z-10">
            <span className="text-primary font-bold tracking-widest text-sm uppercase mb-4 animate-fade-in">Summer Sale</span>
            <h1 className="text-5xl md:text-7xl font-black text-black leading-tight mb-6 animate-fade-in delay-100 font-heading dark:text-white">
              UP TO <span className="text-primary">70%</span> OFF
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md animate-fade-in delay-200 dark:text-gray-300">
              Discover the hottest trends of the season. Shop the collection now before it's gone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-fade-in delay-300">
              <Link to="/products" className="px-10 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-all dark:bg-white dark:text-black dark:hover:bg-gray-200">
                Shop Now
              </Link>
              <Link to="/register" className="px-10 py-4 bg-white border border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all dark:bg-transparent dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black">
                Sell Now
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] md:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
              alt="Fashion Model"
              className="absolute inset-0 w-full h-full object-cover object-top hover:scale-105 transition-transform duration-1000"
            />
          </div>
        </div>
      </div>

      {/* Categories Row */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex gap-6 min-w-max justify-center">
          {categories.slice(0, 8).map((cat) => (
            <Link key={cat} to={`/products?category=${cat}`} className="group flex flex-col items-center gap-3 cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-transparent group-hover:border-black transition-all dark:bg-gray-800 dark:group-hover:border-white">
                {/* Placeholder for category image - usually dynamic */}
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold uppercase dark:bg-gray-700 dark:text-gray-500">
                  {cat.slice(0, 2)}
                </div>
              </div>
              <span className="text-sm font-bold uppercase tracking-wide group-hover:text-red-600 transition-colors dark:text-gray-300 dark:group-hover:text-red-400">{cat}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Flash Sale Banner - Only show if active sales exist */}
      {flashSaleProducts.length > 0 && closestFlashSaleEnd && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 animate-fade-up">
          <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group dark:bg-primary/10 dark:border-primary/30">
            {/* Background Decorations */}
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
        </div>
      )}

      {/* Featured Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-2 font-heading text-zinc-900 dark:text-white">Daily Drops</h2>
          <div className="w-16 h-1 bg-zinc-900 mx-auto dark:bg-white"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12">
          {featuredProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/products" className="inline-flex items-center gap-2 border-b-2 border-black pb-1 text-sm font-bold uppercase tracking-widest hover:text-primary hover:border-primary transition-all dark:border-white dark:text-white dark:hover:text-primary dark:hover:border-primary">
            View More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
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