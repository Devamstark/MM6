import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, User as UserIcon, Shield, Package, Search, Menu, Store, LayoutDashboard, X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { SearchSuggestions } from '../types';
import { Clock, TrendingUp, History } from 'lucide-react';
import { useAtom } from 'jotai';
import { searchQueryAtom, isCartOpenAtom, isDarkModeAtom, themeColorAtom, fontScaleAtom, densityAtom } from '../store/atoms';
import { NotificationCenter } from './NotificationCenter';
import { ThemeCustomizer } from './ThemeCustomizer';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isAdmin, isSeller, logout } = useAuth();
  const { items, itemCount, cartTotal, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({ categories: [], products: [] });
  const [recentSearches, setRecentSearches] = useState<string[]>(JSON.parse(localStorage.getItem('ss_recent_searches') || '[]'));
  const [isTrendingOpen, setIsTrendingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useAtom(isCartOpenAtom);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isDarkMode] = useAtom(isDarkModeAtom);
  const [themeColor] = useAtom(themeColorAtom);
  const [fontScale] = useAtom(fontScaleAtom);
  const [density] = useAtom(densityAtom);

  // Apply Theme Settings
  React.useEffect(() => {
    // 1. Dark Mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Font Scale
    // We set a CSS variable that can be used or just set root font-size percentage
    document.documentElement.style.fontSize = `${fontScale * 100}%`;

    // 3. Density
    document.body.setAttribute('data-density', density);

    // 4. Theme Color
    const colors: Record<string, string> = {
      blue: '#4f46e5',   // Indigo-600
      purple: '#7c3aed', // Violet-600
      green: '#10b981',  // Emerald-500
      orange: '#f97316', // Orange-500
      red: '#ef4444',    // Red-500
      teal: '#14b8a6',   // Teal-500
      pink: '#ec4899'    // Pink-500
    };
    // Set the CSS variable that Tailwind (v4) might use if configured, 
    // or we use it for custom styles
    document.documentElement.style.setProperty('--primary-color', colors[themeColor]);

    // Also try to set a text color for immediate feedback if using inline styles somewhere
  }, [isDarkMode, themeColor, fontScale, density]);

  // Sync search query from URL on mount
  React.useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams, setSearchQuery]);

  // Fetch suggestions when query changes
  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 1) {
        const results = await api.getSuggestions(searchQuery);
        setSuggestions(results);
      } else {
        setSuggestions({ categories: [], products: [] });
      }
    };
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Keyboard shortcut (/) to focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e?: React.FormEvent, query?: string) => {
    if (e) e.preventDefault();
    const finalQuery = query || searchQuery;
    if (finalQuery.trim()) {
      // Save to recent searches
      const updatedRecent = [finalQuery, ...recentSearches.filter(s => s !== finalQuery)].slice(0, 5);
      setRecentSearches(updatedRecent);
      localStorage.setItem('ss_recent_searches', JSON.stringify(updatedRecent));

      navigate(`/products?search=${encodeURIComponent(finalQuery)}`);
      setSearchOpen(false);
    } else {
      navigate('/products');
      setSearchOpen(false);
    }
  };

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-slate-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Top Black Banner */}
      <div className="bg-black text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
        Free Shipping on Orders Over $100 | Winter Sale - Up to 50% Off
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Left: Logo */}
            <Link to="/" className="flex-shrink-0 text-2xl font-bold tracking-widest text-black uppercase dark:text-white transition-colors">
              SMARTSHOP
            </Link>

            {/* Center: Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/products?sort=newest" className="text-sm font-medium text-gray-900 hover:text-primary transition-colors dark:text-gray-200 dark:hover:text-primary">
                New Arrivals
              </Link>
              <div className="relative group flex items-center gap-1 cursor-pointer py-4 h-full">
                <span className="text-sm font-medium text-gray-900 group-hover:text-primary dark:text-gray-200">Women</span>
                <svg className="w-3 h-3 text-gray-500 group-hover:text-primary transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>

                {/* Women's Mega Menu */}
                <div className="absolute top-full -left-20 w-[800px] bg-white shadow-xl border-t border-gray-100 hidden group-hover:block p-8 z-50 animate-fade-in">
                  <div className="grid grid-cols-4 gap-8">
                    <div>
                      <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Dresses</h4>
                      <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link to="/products?category=Women&subcategory=Casual+Dresses" className="hover:text-primary hover:underline">Casual Dresses</Link></li>
                        <li><Link to="/products?category=Women&subcategory=Evening+Dresses" className="hover:text-primary hover:underline">Evening Dresses</Link></li>
                        <li><Link to="/products?category=Women&subcategory=Maxi+Dresses" className="hover:text-primary hover:underline">Maxi Dresses</Link></li>
                        <li><Link to="/products?category=Women&subcategory=Mini+Dresses" className="hover:text-primary hover:underline">Mini Dresses</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Tops</h4>
                      <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link to="/products?category=Women&subcategory=T-Shirts" className="hover:text-primary hover:underline">T-Shirts</Link></li>
                        <li><Link to="/products?category=Women&subcategory=Blouses" className="hover:text-primary hover:underline">Blouses</Link></li>
                        <li><Link to="/products?category=Women&subcategory=Sweaters" className="hover:text-primary hover:underline">Sweaters</Link></li>
                        <li><Link to="/products?category=Women&subcategory=Crop+Tops" className="hover:text-primary hover:underline">Crop Tops</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Bottoms</h4>
                      <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link to="/products?category=Women&subcategory=Jeans" className="hover:text-primary hover:underline">Jeans</Link></li>
                        <li><Link to="/products?category=Women&subcategory=Skirts" className="hover:text-primary hover:underline">Skirts</Link></li>
                        <li><Link to="/products?category=Women&subcategory=Pants" className="hover:text-primary hover:underline">Pants</Link></li>
                        <li><Link to="/products?category=Women&subcategory=Shorts" className="hover:text-primary hover:underline">Shorts</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Outerwear</h4>
                      <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link to="/products?category=Women&subcategory=Jackets" className="hover:text-primary hover:underline">Jackets</Link></li>
                        <li><Link to="/products?category=Women&subcategory=Coats" className="hover:text-primary hover:underline">Coats</Link></li>
                        <li><Link to="/products?category=Women&subcategory=Blazers" className="hover:text-primary hover:underline">Blazers</Link></li>
                        <li><Link to="/products?category=Women&subcategory=Cardigans" className="hover:text-primary hover:underline">Cardigans</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group flex items-center gap-1 cursor-pointer py-4 h-full">
                <Link to="/products?category=Men" className="text-sm font-medium text-gray-900 group-hover:text-primary dark:text-gray-200">Men</Link>
                <svg className="w-3 h-3 text-gray-500 group-hover:text-primary transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>

                {/* Men's Mega Menu */}
                <div className="absolute top-full -left-20 w-[800px] bg-white shadow-xl border-t border-gray-100 hidden group-hover:block p-8 z-50 animate-fade-in">
                  <div className="grid grid-cols-4 gap-8">
                    <div>
                      <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Tops</h4>
                      <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link to="/products?category=Men&subcategory=T-Shirts" className="hover:text-primary hover:underline">T-Shirts</Link></li>
                        <li><Link to="/products?category=Men&subcategory=Shirts" className="hover:text-primary hover:underline">Shirts</Link></li>
                        <li><Link to="/products?category=Men&subcategory=Polos" className="hover:text-primary hover:underline">Polos</Link></li>
                        <li><Link to="/products?category=Men&subcategory=Sweaters" className="hover:text-primary hover:underline">Sweaters</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Bottoms</h4>
                      <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link to="/products?category=Men&subcategory=Jeans" className="hover:text-primary hover:underline">Jeans</Link></li>
                        <li><Link to="/products?category=Men&subcategory=Chinos" className="hover:text-primary hover:underline">Chinos</Link></li>
                        <li><Link to="/products?category=Men&subcategory=Joggers" className="hover:text-primary hover:underline">Joggers</Link></li>
                        <li><Link to="/products?category=Men&subcategory=Shorts" className="hover:text-primary hover:underline">Shorts</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Outerwear</h4>
                      <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link to="/products?category=Men&subcategory=Jackets" className="hover:text-primary hover:underline">Jackets</Link></li>
                        <li><Link to="/products?category=Men&subcategory=Coats" className="hover:text-primary hover:underline">Coats</Link></li>
                        <li><Link to="/products?category=Men&subcategory=Hoodies" className="hover:text-primary hover:underline">Hoodies</Link></li>
                        <li><Link to="/products?category=Men&subcategory=Blazers" className="hover:text-primary hover:underline">Blazers</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Suits</h4>
                      <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link to="/products?category=Men&subcategory=Full+Suits" className="hover:text-primary hover:underline">Full Suits</Link></li>
                        <li><Link to="/products?category=Men&subcategory=Suit+Jackets" className="hover:text-primary hover:underline">Suit Jackets</Link></li>
                        <li><Link to="/products?category=Men&subcategory=Dress+Pants" className="hover:text-primary hover:underline">Dress Pants</Link></li>
                        <li><Link to="/products?category=Men&subcategory=Vests" className="hover:text-primary hover:underline">Vests</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <Link to="/products?category=Accessories" className="text-sm font-medium text-gray-900 hover:text-primary transition-colors dark:text-gray-200">
                Accessories
              </Link>
              <Link to="/products?on_sale=true" className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                Sale
              </Link>
            </div>



            {/* Right: Icons */}
            <div className="flex items-center gap-4 lg:gap-6">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-gray-900 hover:text-primary transition-colors dark:text-gray-200"
                title="Search"
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              <NotificationCenter />


              {/* User Account */}
              {isAuthenticated ? (
                <div className="relative group">
                  {isAdmin ? (
                    <div className="text-gray-900 hover:text-primary transition-colors flex items-center justify-center cursor-pointer dark:text-gray-200">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  ) : (
                    <Link to="/profile" className="text-gray-900 hover:text-primary transition-colors flex items-center justify-center dark:text-gray-200">
                      <UserIcon className="w-5 h-5" />
                    </Link>
                  )}
                  {/* Minimal Dropdown */}
                  <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                    <div className="bg-white border border-gray-100 shadow-xl rounded-lg py-2">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">My Profile</Link>
                      {isAdmin && <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">Admin Dashboard</Link>}
                      {isSeller && <Link to="/seller" className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">Seller Dashboard</Link>}
                      {!isAdmin && <Link to="/affiliate" className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">Affiliate</Link>}
                      <button onClick={() => setIsThemeOpen(true)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center justify-between">
                        Theme & Display
                        <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
                      </button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 mt-1">Sign out</button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="text-gray-900 hover:text-primary transition-colors dark:text-gray-200">
                  <UserIcon className="w-5 h-5" />
                </Link>
              )}

              <ThemeCustomizer isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />

              {/* Wishlist */}
              <Link to="/wishlist" className="text-gray-900 hover:text-primary transition-colors relative dark:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </Link>

              {/* Shopping Bag */}
              <button
                onClick={() => setCartOpen(true)}
                className="text-gray-900 hover:text-primary transition-colors relative dark:text-gray-200"
              >
                <div className="relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-3 h-3 text-[8px] font-bold text-white bg-black rounded-full">
                      {itemCount}
                    </span>
                  )}
                </div>
              </button>

              {/* Mobile Menu Toggle */}
              <div className="flex items-center lg:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 text-gray-900 rounded-md dark:text-gray-200">
                  <Menu className="w-6 h-6" />
                </button>
              </div>

            </div>
          </div>

          {/* Search Overlay */}
          {searchOpen && (
            <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-2xl p-8 z-40 animate-fade-in max-h-[85vh] overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSearch} className="relative group">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-300 group-focus-within:text-black transition-colors" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for items, brands, or categories..."
                    className="w-full text-3xl font-bold border-none pl-12 py-6 focus:outline-none placeholder:text-gray-200"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="absolute right-12 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                  <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-2xl hover:bg-gray-800 transition-all">
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8 pt-8 border-t border-gray-50">
                  {/* Left Column: Recent & Trending */}
                  <div className="space-y-8">
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <History className="w-3 h-3" /> Recent Searches
                          </h4>
                          <button onClick={() => { setRecentSearches([]); localStorage.removeItem('ss_recent_searches'); }} className="text-[10px] font-bold text-gray-300 hover:text-red-500 uppercase tracking-tighter">Clear All</button>
                        </div>
                        <div className="space-y-2">
                          {recentSearches.map((s, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSearch(undefined, s)}
                              className="flex items-center gap-3 w-full text-left py-2 px-3 hover:bg-gray-50 rounded-xl transition-all group"
                            >
                              <Clock className="w-4 h-4 text-gray-300 group-hover:text-black" />
                              <span className="text-sm font-semibold text-gray-600 group-hover:text-black">{s}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <TrendingUp className="w-3 h-3" /> Trending
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {['New Year Specials', 'Sustainable Fashion', 'Accessories', 'Limited Drop'].map((t) => (
                          <button
                            key={t}
                            onClick={() => handleSearch(undefined, t)}
                            className="px-4 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-full hover:bg-black hover:text-white transition-all shadow-sm border border-gray-100"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Collections (Categories) */}
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Quick Collections</h4>
                      <div className="grid grid-cols-1 gap-1">
                        {suggestions.categories.length > 0 ? (
                          suggestions.categories.map((c) => (
                            <Link
                              key={c}
                              to={`/products?category=${encodeURIComponent(c)}`}
                              onClick={() => setSearchOpen(false)}
                              className="py-3 px-4 hover:bg-primary/5 text-gray-600 hover:text-primary font-bold rounded-xl transition-all flex items-center justify-between group"
                            >
                              {c}
                              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                            </Link>
                          ))
                        ) : (
                          [
                            { name: 'New Arrivals', to: '/products?sort=newest' },
                            { name: 'Women', to: '/products?category=Women' },
                            { name: 'Men', to: '/products?category=Men' },
                            { name: 'Accessories', to: '/products?category=Accessories' }
                          ].map((item) => (
                            <Link
                              key={item.name}
                              to={item.to}
                              onClick={() => setSearchOpen(false)}
                              className="py-3 px-4 hover:bg-gray-50 text-gray-600 hover:text-black font-bold rounded-xl transition-all flex items-center justify-between group"
                            >
                              {item.name}
                              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Featured Products */}
                  <div className="md:col-span-1">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                      {suggestions.products.length > 0 ? 'Top Results' : 'Featured Products'}
                    </h4>
                    <div className="space-y-4">
                      {suggestions.products.length > 0 ? (
                        suggestions.products.map((p) => (
                          <Link
                            key={p.id}
                            to={`/product/${p.id}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-4 group p-2 hover:bg-gray-50 rounded-2xl transition-all"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-bold text-gray-900 truncate group-hover:text-primary">{p.name}</span>
                              <span className="text-xs text-gray-500 font-bold">${p.price}</span>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 font-medium italic">Start typing to see product matches...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            {/* Mobile Search */}
            <div className="px-4 pt-4 pb-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  className="w-full bg-gray-100 border-none rounded-md py-2 px-4 text-sm focus:ring-1 focus:ring-black"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-2 text-gray-400">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
            <div className="px-4 py-4 space-y-1">
              <Link to="/products?sort=newest" className="block px-3 py-2 text-base font-medium text-gray-900 rounded-md hover:bg-gray-50">New Arrivals</Link>
              <Link to="/products" className="block px-3 py-2 text-base font-medium text-gray-900 rounded-md hover:bg-gray-50">Women</Link>
              <Link to="/products" className="block px-3 py-2 text-base font-medium text-gray-900 rounded-md hover:bg-gray-50">Men</Link>
              <Link to="/products?category=Accessories" className="block px-3 py-2 text-base font-medium text-gray-900 rounded-md hover:bg-gray-50">Accessories</Link>
              <Link to="/products?sort=price_asc" className="block px-3 py-2 text-base font-medium text-red-600 rounded-md hover:bg-gray-50">Sale</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setCartOpen(false)}
          ></div>
          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md animate-slide-in-right">
              <div className="h-full flex flex-col bg-white shadow-2xl rounded-l-3xl overflow-hidden border-l border-white/50 dark:bg-gray-900 dark:border-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 bg-gray-50/50 dark:bg-gray-800 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 dark:text-white">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    Your Cart
                    <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm">{itemCount} items</span>
                  </h2>
                  <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Items List - Scrollable Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/30">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-6">
                      <div className="w-24 h-24 bg-primary/5 rounded-3xl flex items-center justify-center transform rotate-3">
                        <ShoppingCart className="w-10 h-10 text-primary/50" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-gray-900">Your cart is empty</p>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
                      </div>
                      <button
                        onClick={() => { setCartOpen(false); navigate('/products'); }}
                        className="px-8 py-3 bg-white border border-gray-200 text-primary font-bold rounded-full hover:bg-gray-50 hover:shadow-md transition-all"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {items.map((item) => (
                        <li key={item.id} className="flex p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>

                          <div className="ml-4 flex flex-1 flex-col justify-between">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3 className="line-clamp-2 pr-4 leading-tight">{item.name}</h3>
                                <p className="whitespace-nowrap font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">{item.brand}</p>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              {/* Quantity Controls */}
                              <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 shadow-sm">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1.5 hover:bg-white hover:text-red-500 rounded-full transition-colors text-gray-400 m-1"
                                >
                                  {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                </button>
                                <span className="px-2 text-sm font-semibold text-gray-900 min-w-[1.5rem] text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1.5 hover:bg-white hover:text-primary rounded-full transition-colors text-gray-400 m-1"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer - Fixed at Bottom */}
                {items.length > 0 && (
                  <div className="border-t border-gray-100 p-6 bg-white z-10 dark:bg-gray-900 dark:border-gray-800">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-base font-medium text-gray-500">
                        <p>Subtotal</p>
                        <p>${cartTotal.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between text-base font-medium text-gray-500">
                        <p>Shipping</p>
                        <p>Free</p>
                      </div>
                      <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t border-gray-100">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-4 text-base font-bold text-white shadow-xl shadow-gray-200 hover:bg-primary hover:shadow-primary/20 transition-all duration-300 active:scale-[0.98]"
                    >
                      Proceed to Checkout <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 mt-auto dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* Column 1: Company Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase dark:text-white">Company Info</h3>
              <ul className="space-y-3">
                <li><Link to="/page/about-us" className="text-sm text-gray-500 hover:text-primary transition-colors dark:text-gray-400">About Us</Link></li>
                {!isAdmin && <li><Link to="/affiliate" className="text-sm text-gray-500 hover:text-primary transition-colors dark:text-gray-400">Affiliate</Link></li>}
                <li><Link to="/page/fashion-blogger" className="text-sm text-gray-500 hover:text-primary transition-colors dark:text-gray-400">Fashion Blogger</Link></li>
              </ul>
            </div>

            {/* Column 2: Help & Support */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase dark:text-white">Help & Support</h3>
              <ul className="space-y-3">
                <li><Link to="/page/shipping-info" className="text-sm text-gray-500 hover:text-primary transition-colors dark:text-gray-400">Shipping Info</Link></li>
                <li><Link to="/page/returns" className="text-sm text-gray-500 hover:text-primary transition-colors dark:text-gray-400">Returns</Link></li>
                <li><Link to="/page/how-to-order" className="text-sm text-gray-500 hover:text-primary transition-colors dark:text-gray-400">How to Order</Link></li>
                <li><Link to="/page/size-guide" className="text-sm text-gray-500 hover:text-primary transition-colors dark:text-gray-400">Size Guide</Link></li>
              </ul>
            </div>

            {/* Column 3: Customer Care */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase dark:text-white">Customer Care</h3>
              <ul className="space-y-3">
                <li><Link to="/contact" className="text-sm text-gray-500 hover:text-primary transition-colors dark:text-gray-400">Contact Us</Link></li>
                <li><Link to="/page/payment-method" className="text-sm text-gray-500 hover:text-primary transition-colors dark:text-gray-400">Payment Method</Link></li>
                {!isAdmin && <li><Link to="/bonus-points" className="text-sm text-gray-500 hover:text-primary transition-colors dark:text-gray-400">Bonus Point System</Link></li>}
              </ul>
            </div>

            {/* Column 4: Newsletter / Socials (Optional but good for aesthetic) */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase dark:text-white">Stay Connected</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sign up for our newsletter to get updates on new arrivals and special offers.</p>
              <div className="flex space-x-4 pt-2">
                {/* Social Icons Placeholder */}
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer">
                  <span className="font-bold text-xs">FB</span>
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer">
                  <span className="font-bold text-xs">IG</span>
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer">
                  <span className="font-bold text-xs">TW</span>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; 2026 SmartShop Inc. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png" alt="PayPal" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};