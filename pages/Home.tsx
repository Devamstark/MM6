import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Loader2, Zap, ShieldCheck, Truck, ArrowUpRight } from 'lucide-react';

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
        setFeaturedProducts(featured.slice(0, 4));
        setPopularProducts(popular.slice(0, 4));
        setCategories(cats);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // If redirecting, show nothing or a spinner
  if (user?.role === 'admin' || user?.role === 'seller') {
    return null; 
  }

  if (loading) return <div className="flex justify-center py-40 bg-[#f8f9fa]"><Loader2 className="animate-spin text-indigo-500 w-10 h-10"/></div>;

  return (
    <div className="bg-[#f0f4f8] pb-20 overflow-hidden">
      
      {/* Modern Hero Section */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 animate-fade-up">
        <div className="relative bg-gray-900 rounded-[3rem] overflow-hidden shadow-2xl shadow-gray-200 group">
          <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
            <img
              className="w-full h-full object-cover opacity-60 mix-blend-overlay"
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80"
              alt="Hero Background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
          </div>
          
          <div className="relative max-w-2xl mx-auto lg:mx-0 px-8 py-24 sm:py-32 lg:px-16 lg:py-40">
            <div className="flex items-center gap-2 mb-6 animate-fade-up delay-100">
                <span className="bg-indigo-500/20 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30 backdrop-blur-sm">NEW ARRIVALS</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight animate-fade-up delay-200">
              Enrich your <br/>
              <span className="text-indigo-400">digital life.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-lg animate-fade-up delay-300">
              Discover the latest tech, fashion, and home essentials with CloudMart. Premium quality products delivered to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-400">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-full text-indigo-700 bg-white hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Start Shopping
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 border border-gray-600 text-base font-bold rounded-full text-white hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm"
              >
                Sell with Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories - Chip Style */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 animate-fade-up delay-200">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Explore Categories</h2>
            <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-transform hover:translate-x-1">View All <ArrowUpRight className="w-4 h-4"/></Link>
         </div>
         <div className="flex flex-wrap gap-3">
            <Link to="/products" className="px-6 py-3 rounded-full bg-gray-900 text-white font-medium shadow-md hover:shadow-lg transition-all text-sm hover:-translate-y-0.5">
                All Products
            </Link>
            {categories.map((cat, idx) => (
              <Link 
                key={cat} 
                to={`/products?category=${cat}`} 
                className="px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5"
                style={{ animationDelay: `${(idx * 50) + 200}ms` }}
              >
                 {cat}
              </Link>
            ))}
         </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 animate-fade-up delay-300">
         <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Collection</h2>
                <p className="text-gray-500 mt-2">Hand-picked items just for you.</p>
            </div>
            <Link to="/products?isFeatured=true" className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md">
              View Collection <ChevronRight className="w-4 h-4" />
            </Link>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((p, i) => (
              <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
         </div>
      </div>

      {/* Features Banner */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-24 animate-fade-up delay-200">
        <div className="bg-indigo-600 rounded-[3rem] p-8 md:p-16 text-white shadow-xl shadow-indigo-200 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:opacity-10 transition-opacity duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 opacity-20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl group-hover:opacity-30 transition-opacity duration-1000"></div>
            
            <div className="relative z-10 grid md:grid-cols-3 gap-12 text-center md:text-left">
              {[
                 { name: 'Fast Delivery', desc: 'Get your products in 24 hours.', icon: Truck },
                 { name: 'Secure Payments', desc: 'Encrypted transactions.', icon: ShieldCheck },
                 { name: '24/7 Support', desc: 'We are here to help anytime.', icon: Zap },
              ].map((feature, idx) => (
                <div key={feature.name} className="flex flex-col items-center md:items-start animate-fade-up" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-6 border border-white/20 shadow-inner">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.name}</h3>
                  <p className="text-indigo-100 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};