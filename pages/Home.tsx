import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowRight, Zap, Clock } from 'lucide-react';

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
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
        const [featured, popular, cats] = await Promise.all([
          api.getProducts({ isFeatured: true }),
          api.getProducts({ isPopular: true }),
          api.getCategories()
        ]);
        setFeaturedProducts(featured.slice(0, 8)); // Show more items
        setPopularProducts(popular.slice(0, 4));
        setCategories(cats);
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
    <div className="bg-white pb-20">

      {/* Hero Section */}
      <div className="relative bg-[#f6f6f6]">
        <div className="max-w-[1600px] mx-auto grid md:grid-cols-2">
          <div className="flex flex-col justify-center px-8 py-16 md:py-24 lg:px-16 text-center md:text-left z-10">
            <span className="text-red-600 font-bold tracking-widest text-sm uppercase mb-4 animate-fade-in">Summer Sale</span>
            <h1 className="text-5xl md:text-7xl font-black text-black leading-tight mb-6 animate-fade-in delay-100">
              UP TO <span className="text-red-600">70%</span> OFF
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md animate-fade-in delay-200">
              Discover the hottest trends of the season. Shop the collection now before it's gone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-fade-in delay-300">
              <Link to="/products" className="px-10 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">
                Shop Now
              </Link>
              <Link to="/register" className="px-10 py-4 bg-white border border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
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
          {categories.slice(0, 8).map((cat, idx) => (
            <Link key={cat} to={`/products?category=${cat}`} className="group flex flex-col items-center gap-3 cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-transparent group-hover:border-black transition-all">
                {/* Placeholder for category image - usually dynamic */}
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold uppercase">
                  {cat.slice(0, 2)}
                </div>
              </div>
              <span className="text-sm font-bold uppercase tracking-wide group-hover:text-red-600 transition-colors">{cat}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Flash Sale Banner */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white animate-pulse">
              <Zap className="w-8 h-8 fill-current" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase text-red-600 italic">Flash Sale</h2>
              <p className="text-gray-600 font-medium">Limited time offer on selected items</p>
            </div>
          </div>

          {/* Timer Mock */}
          <div className="flex gap-4">
            {['02', '14', '35', '12'].map((t, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center font-bold text-xl">{t}</div>
                <span className="text-[10px] uppercase font-bold text-gray-500 mt-1">{['Days', 'Hrs', 'Mins', 'Secs'][i]}</span>
              </div>
            ))}
          </div>

          <Link to="/products" className="px-8 py-3 bg-red-600 text-white font-bold uppercase rounded hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
            View All
          </Link>
        </div>
      </div>

      {/* Featured Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Daily Drops</h2>
          <div className="w-16 h-1 bg-black mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/products" className="inline-flex items-center gap-2 border-b-2 border-black pb-1 text-sm font-bold uppercase tracking-widest hover:text-red-600 hover:border-red-600 transition-all">
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