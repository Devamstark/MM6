import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, User as UserIcon, Shield, Package, Search, Menu, Store, LayoutDashboard, X, Trash2, Plus, Minus, ArrowRight, ChevronRight, Home, Heart, FileText, Phone, Settings, Mail } from 'lucide-react';
import { api } from '../services/api';
import { SearchSuggestions } from '../types';
import { Clock, TrendingUp, History } from 'lucide-react';
import { useAtom } from 'jotai';
import { searchQueryAtom, isCartOpenAtom, isDarkModeAtom, themeColorAtom, fontScaleAtom, densityAtom } from '../store/atoms';
import { NotificationCenter } from './NotificationCenter';
import { ThemeCustomizer } from './ThemeCustomizer';
import { CategoryDrawer } from './CategoryDrawer';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isAdmin, isSeller, isBlogger, logout } = useAuth();
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
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const menuTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterStatus('loading');
    try {
      const res = await api.subscribeToNewsletter(newsletterEmail);
      setNewsletterStatus('success');
      setNewsletterMessage(res.message || 'Subscribed successfully!');
      setNewsletterEmail('');
      setTimeout(() => {
        setNewsletterStatus('idle');
        setNewsletterMessage('');
      }, 4000);
    } catch (err: any) {
      setNewsletterStatus('error');
      // If backend returns a 400 with a specific error (like a malformed email)
      const errorData = err.response?.data;
      const errorMsg = errorData?.email?.[0] || errorData?.detail || 'Something went wrong. Please try again.';
      setNewsletterMessage(errorMsg);
      setTimeout(() => {
        setNewsletterStatus('idle');
        setNewsletterMessage('');
      }, 4000);
    }
  };

  const openMenu = (menu: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setHoveredMenu(menu);
  };

  const closeMenu = () => {
    menuTimeoutRef.current = setTimeout(() => setHoveredMenu(null), 120);
  };

  const keepMenuOpen = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
  };

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isUserMenuOpen]);

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
      <nav className="sticky top-0 z-1000 bg-white border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Left: Logo */}
            <Link to="/" className="shrink-0 text-2xl font-bold tracking-widest text-black uppercase dark:text-white transition-colors">
              SmartShop
            </Link>

            {/* Center: Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/products?sort=newest" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-all">
                New Arrivals
              </Link>

              {/* Women Dropdown */}
              <div
                className="relative flex items-center h-full"
                onMouseEnter={() => openMenu('Women')}
                onMouseLeave={closeMenu}
              >
                <div className={`flex items-center gap-1 px-4 py-2 rounded-xl cursor-pointer transition-all ${hoveredMenu === 'Women' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
                  <Link to="/products?category=Women" className="text-sm font-medium">Women</Link>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${hoveredMenu === 'Women' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>

                {hoveredMenu === 'Women' && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[780px] bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 p-8 z-200 rounded-2xl"
                    onMouseEnter={keepMenuOpen}
                    onMouseLeave={closeMenu}
                  >
                    <div className="grid grid-cols-4 gap-8">
                      <div>
                        <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2 dark:text-white">Dresses</h4>
                        <ul className="space-y-1 text-sm">
                          <li><Link to="/products?category=Women&subcategory=Casual+Dresses" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Casual Dresses</Link></li>
                          <li><Link to="/products?category=Women&subcategory=Evening+Dresses" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Evening Dresses</Link></li>
                          <li><Link to="/products?category=Women&subcategory=Maxi+Dresses" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Maxi Dresses</Link></li>
                          <li><Link to="/products?category=Women&subcategory=Mini+Dresses" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Mini Dresses</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 dark:text-white dark:border-gray-800">Tops</h4>
                        <ul className="space-y-1 text-sm">
                          <li><Link to="/products?category=Women&subcategory=T-Shirts" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">T-Shirts</Link></li>
                          <li><Link to="/products?category=Women&subcategory=Blouses" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Blouses</Link></li>
                          <li><Link to="/products?category=Women&subcategory=Sweaters" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Sweaters</Link></li>
                          <li><Link to="/products?category=Women&subcategory=Crop+Tops" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Crop Tops</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 dark:text-white dark:border-gray-800">Bottoms</h4>
                        <ul className="space-y-1 text-sm">
                          <li><Link to="/products?category=Women&subcategory=Jeans" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Jeans</Link></li>
                          <li><Link to="/products?category=Women&subcategory=Skirts" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Skirts</Link></li>
                          <li><Link to="/products?category=Women&subcategory=Pants" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Pants</Link></li>
                          <li><Link to="/products?category=Women&subcategory=Shorts" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Shorts</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 dark:text-white dark:border-gray-800">Outerwear</h4>
                        <ul className="space-y-1 text-sm">
                          <li><Link to="/products?category=Women&subcategory=Jackets" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Jackets</Link></li>
                          <li><Link to="/products?category=Women&subcategory=Coats" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Coats</Link></li>
                          <li><Link to="/products?category=Women&subcategory=Blazers" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Blazers</Link></li>
                          <li><Link to="/products?category=Women&subcategory=Cardigans" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Cardigans</Link></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Men Dropdown */}
              <div
                className="relative flex items-center h-full"
                onMouseEnter={() => openMenu('Men')}
                onMouseLeave={closeMenu}
              >
                <div className={`flex items-center gap-1 px-4 py-2 rounded-xl cursor-pointer transition-all ${hoveredMenu === 'Men' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
                  <Link to="/products?category=Men" className="text-sm font-medium">Men</Link>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${hoveredMenu === 'Men' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>

                {hoveredMenu === 'Men' && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[780px] bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 p-8 z-200 rounded-2xl"
                    onMouseEnter={keepMenuOpen}
                    onMouseLeave={closeMenu}
                  >
                    <div className="grid grid-cols-4 gap-8">
                      <div>
                        <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2 dark:text-white">Tops</h4>
                        <ul className="space-y-1 text-sm">
                          <li><Link to="/products?category=Men&subcategory=T-Shirts" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">T-Shirts</Link></li>
                          <li><Link to="/products?category=Men&subcategory=Shirts" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Shirts</Link></li>
                          <li><Link to="/products?category=Men&subcategory=Polos" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Polos</Link></li>
                          <li><Link to="/products?category=Men&subcategory=Sweaters" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Sweaters</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 dark:text-white dark:border-gray-800">Bottoms</h4>
                        <ul className="space-y-1 text-sm">
                          <li><Link to="/products?category=Men&subcategory=Jeans" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Jeans</Link></li>
                          <li><Link to="/products?category=Men&subcategory=Chinos" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Chinos</Link></li>
                          <li><Link to="/products?category=Men&subcategory=Joggers" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Joggers</Link></li>
                          <li><Link to="/products?category=Men&subcategory=Shorts" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Shorts</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 dark:text-white dark:border-gray-800">Outerwear</h4>
                        <ul className="space-y-1 text-sm">
                          <li><Link to="/products?category=Men&subcategory=Jackets" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Jackets</Link></li>
                          <li><Link to="/products?category=Men&subcategory=Coats" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Coats</Link></li>
                          <li><Link to="/products?category=Men&subcategory=Hoodies" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Hoodies</Link></li>
                          <li><Link to="/products?category=Men&subcategory=Blazers" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Blazers</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 dark:text-white dark:border-gray-800">Suits</h4>
                        <ul className="space-y-1 text-sm">
                          <li><Link to="/products?category=Men&subcategory=Full+Suits" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Full Suits</Link></li>
                          <li><Link to="/products?category=Men&subcategory=Suit+Jackets" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Suit Jackets</Link></li>
                          <li><Link to="/products?category=Men&subcategory=Dress+Pants" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Dress Pants</Link></li>
                          <li><Link to="/products?category=Men&subcategory=Vests" onClick={() => setHoveredMenu(null)} className="block py-2 px-4 -mx-4 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm">Vests</Link></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/products?category=Accessories" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-all">
                Accessories
              </Link>
              <Link to="/products?on_sale=true" className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                Sale
              </Link>
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => setIsThemeOpen(true)}
                className="text-gray-900 hover:text-primary transition-colors dark:text-gray-200"
                title="Theme Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

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
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`text-gray-900 hover:text-primary transition-all flex items-center justify-center cursor-pointer dark:text-gray-200 p-2 rounded-full ${isUserMenuOpen ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    title="Account"
                  >
                    <UserIcon className="w-5 h-5" />
                  </button>

                  {/* Dropdown - Visible on Click */}
                  <div className={`absolute right-0 top-full pt-2 w-64 z-50 ${isUserMenuOpen ? 'block animate-fade-in' : 'hidden'}`}>
                    <div className="bg-white border border-gray-100 shadow-2xl rounded-2xl py-3 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 mb-2 bg-gray-50/50 dark:bg-gray-800/30">
                        <p className="text-sm font-black text-gray-900 truncate dark:text-white mb-0.5">{user?.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 truncate dark:text-gray-500 uppercase tracking-tighter">{user?.role} Portal • {user?.email}</p>
                      </div>

                      <div className="px-2 space-y-0.5">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-gray-400" /> My Account
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-indigo-50 text-indigo-600 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                          </Link>
                        )}

                        {isSeller && (
                          <Link
                            to="/seller"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-orange-50 text-orange-600 dark:hover:bg-orange-900/20 rounded-xl transition-colors"
                          >
                            <Store className="w-4 h-4" /> Seller Studio
                          </Link>
                        )}

                        {(isBlogger || isAdmin) && (
                          <Link
                            to="/blogger"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-green-50 text-green-600 dark:hover:bg-green-900/20 rounded-xl transition-colors"
                          >
                            <FileText className="w-4 h-4" /> Blogger Studio
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/marketing"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                          >
                            <Mail className="w-4 h-4" /> Marketing
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/security"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                          >
                            <Shield className="w-4 h-4" /> Security
                          </Link>
                        )}

                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-400" /> Order History
                        </Link>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 px-2 text-center">
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-[10px] font-black text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all uppercase tracking-[0.2em]"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
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
              <Link to="/wishlist" className="text-gray-900 hover:text-primary transition-colors relative dark:text-gray-200 hidden sm:block">
                <Heart className="w-5 h-5" />
              </Link>

              {/* Shopping Bag */}
              <button
                onClick={() => setCartOpen(true)}
                className="text-gray-900 hover:text-primary transition-colors relative dark:text-gray-200"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[9px] font-black text-white bg-indigo-600 rounded-full border-2 border-white dark:border-gray-900 shadow-sm">
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
          </div >

          {/* Search Overlay */}
          {
            searchOpen && (
              <div className="absolute top-16 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-2xl p-8 z-40 animate-fade-in max-h-[85vh] overflow-y-auto transition-colors">
                <div className="max-w-4xl mx-auto">
                  <form onSubmit={handleSearch} className="relative group">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-300 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for items, brands, or categories..."
                      className="w-full text-3xl font-bold border-none pl-12 py-6 focus:outline-none placeholder:text-gray-200 dark:text-white dark:placeholder:text-gray-600"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery('')} className="absolute right-12 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </button>
                    )}
                    <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-2xl hover:bg-gray-800 transition-all">
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8 pt-8 border-t border-gray-50 dark:border-gray-800 transition-colors">
                    {/* Left Column: Recent & Trending */}
                    <div className="space-y-8">
                      {recentSearches.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                              <History className="w-3 h-3" /> Recent Searches
                            </h4>
                            <button onClick={() => { setRecentSearches([]); localStorage.removeItem('ss_recent_searches'); }} className="text-[10px] font-bold text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 uppercase tracking-tighter">Clear All</button>
                          </div>
                          <div className="space-y-2">
                            {recentSearches.map((s, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSearch(undefined, s)}
                                className="flex items-center gap-3 w-full text-left py-2.5 px-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all group"
                              >
                                <Clock className="w-4 h-4 text-indigo-400 dark:text-indigo-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">{s}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                          <TrendingUp className="w-3 h-3" /> Trending
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {['New Year Specials', 'Sustainable Fashion', 'Accessories', 'Limited Drop'].map((t) => (
                            <button
                              key={t}
                              onClick={() => handleSearch(undefined, t)}
                              className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm border border-gray-100 dark:border-gray-700"
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
                                className="py-3 px-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300 font-bold rounded-xl transition-all flex items-center justify-between group"
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
                                className="py-3 px-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300 font-bold rounded-xl transition-all flex items-center justify-between group"
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
                              className="flex items-center gap-4 group p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all"
                            >
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0">
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">{p.name}</span>
                                <span className="text-xs text-gray-500 font-bold dark:text-gray-400">${p.price}</span>
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
            )
          }
        </div >

        {/* Mobile Navigation Drawer Overlay */}
        {
          mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 md:hidden transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
          )
        }

        {/* Mobile Navigation Drawer */}
        <div
          className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-51 md:hidden shadow-2xl transform transition-transform duration-300 ease-out dark:bg-gray-900 dark:border-r dark:border-gray-800 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <Link to="/" className="text-xl font-bold tracking-widest text-black uppercase dark:text-white" onClick={() => setMobileMenuOpen(false)}>
              SMARTSHOP
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-800 dark:text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Navigation Content */}
          <div className="flex-1 overflow-y-auto h-[calc(100vh-140px)]">
            {/* User Account Section */}
            {isAuthenticated ? (
              <div className="p-4 bg-gray-50 border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate dark:text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-xs font-bold text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                  >
                    <UserIcon className="w-3.5 h-3.5" /> Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-xs font-bold text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" /> Admin
                    </Link>
                  )}
                  {isSeller && (
                    <Link
                      to="/seller"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-black text-xs font-bold text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Store className="w-3.5 h-3.5" /> Seller
                    </Link>
                  )}
                  {(isBlogger || isAdmin) && (
                    <Link
                      to="/blogger"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-xs font-bold text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> Blog
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/marketing"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-xs font-bold text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" /> Market
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/security"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-xs font-bold text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" /> Security
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors text-center dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-white text-black text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}

            {/* Main Navigation Links */}
            <nav className="py-2">
              <Link
                to="/products?sort=newest"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Home className="w-5 h-5 text-gray-400" />
                New Arrivals
              </Link>

              <div className="border-b border-gray-50 dark:border-gray-800/50">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMobileExpandedCat(mobileExpandedCat === 'Women' ? null : 'Women');
                  }}
                  className="flex items-center justify-between w-full px-4 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">👩</span> Women
                  </span>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${mobileExpandedCat === 'Women' ? 'rotate-90' : ''}`} />
                </button>
                {mobileExpandedCat === 'Women' && (
                  <div className="bg-gray-50 dark:bg-black/20 px-4 py-2 space-y-1">
                    <Link to="/products?category=Women" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-bold text-indigo-600 uppercase tracking-tighter">View All Women</Link>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 py-2">
                      <Link to="/products?category=Women&subcategory=T-Shirts" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-all border border-gray-100 dark:border-gray-700 shadow-sm">T-Shirts</Link>
                      <Link to="/products?category=Women&subcategory=Dresses" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-all border border-gray-100 dark:border-gray-700 shadow-sm">Dresses</Link>
                      <Link to="/products?category=Women&subcategory=Jeans" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-all border border-gray-100 dark:border-gray-700 shadow-sm">Jeans</Link>
                      <Link to="/products?category=Women&subcategory=Tops" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-all border border-gray-100 dark:border-gray-700 shadow-sm">Tops</Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-50 dark:border-gray-800/50">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMobileExpandedCat(mobileExpandedCat === 'Men' ? null : 'Men');
                  }}
                  className="flex items-center justify-between w-full px-4 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">👨</span> Men
                  </span>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${mobileExpandedCat === 'Men' ? 'rotate-90' : ''}`} />
                </button>
                {mobileExpandedCat === 'Men' && (
                  <div className="bg-gray-50 dark:bg-black/20 px-4 py-2 space-y-1">
                    <Link to="/products?category=Men" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-bold text-indigo-600 uppercase tracking-tighter">View All Men</Link>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 py-2">
                      <Link to="/products?category=Men&subcategory=T-Shirts" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-all border border-gray-100 dark:border-gray-700 shadow-sm">T-Shirts</Link>
                      <Link to="/products?category=Men&subcategory=Shirts" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-all border border-gray-100 dark:border-gray-700 shadow-sm">Shirts</Link>
                      <Link to="/products?category=Men&subcategory=Jeans" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-all border border-gray-100 dark:border-gray-700 shadow-sm">Jeans</Link>
                      <Link to="/products?category=Men&subcategory=Hoodies" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-all border border-gray-100 dark:border-gray-700 shadow-sm">Hoodies</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Categories Button - Opens Drawer */}
              <button
                onClick={() => { setCategoryDrawerOpen(true); }}
                className="flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">📂</span> All Categories
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <Link
                to="/products?category=Accessories"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <span className="text-lg">👜</span> Accessories
              </Link>

              <Link
                to="/products?on_sale=true"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-900/20"
              >
                <span className="text-lg">🔥</span> Sale
              </Link>
            </nav>

            {/* Divider */}
            <div className="border-t border-gray-100 my-2 dark:border-gray-800" />

            {/* User Links */}
            <nav className="py-2">
              {isAuthenticated && (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <Package className="w-5 h-5 text-gray-400" />
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <Heart className="w-5 h-5 text-gray-400" />
                    Wishlist
                  </Link>
                  <Link
                    to="/points"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <span className="text-lg">⭐</span> Bonus Points
                  </Link>
                  <div className="border-t border-gray-100 my-2 dark:border-gray-800" />
                </>
              )}

              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Phone className="w-5 h-5 text-gray-400" />
                Contact Us
              </Link>

              <button
                onClick={() => { setIsThemeOpen(true); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Settings className="w-5 h-5 text-gray-400" />
                Theme & Display
              </button>

              <Link
                to="/page/about-us"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <FileText className="w-5 h-5 text-gray-400" />
                About Us
              </Link>
            </nav>
          </div>

          {/* Footer - Logout */}
          {isAuthenticated && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); navigate('/login'); }}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </nav >

      {/* Category Drawer */}
      < CategoryDrawer isOpen={categoryDrawerOpen} onClose={() => setCategoryDrawerOpen(false)} />

      {/* Cart Drawer */}
      {
        cartOpen && (
          <div className="fixed inset-0 z-[2000] overflow-hidden">
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
                    <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Items List - Scrollable Area */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/30 dark:bg-black/20 transition-colors">
                    {items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-6">
                        <div className="w-24 h-24 bg-primary/5 rounded-3xl flex items-center justify-center transform rotate-3">
                          <ShoppingCart className="w-10 h-10 text-primary/50" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">Your cart is empty</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
                        </div>
                        <button
                          onClick={() => { setCartOpen(false); navigate('/products'); }}
                          className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-primary font-bold rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all"
                        >
                          Start Shopping
                        </button>
                      </div>
                    ) : (
                      <ul className="space-y-4">
                        {items.map((item) => (
                          <li key={item.id} className="flex p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                              />
                            </div>

                            <div className="ml-4 flex flex-1 flex-col justify-between">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                                  <h3 className="line-clamp-2 pr-4 leading-tight">{item.name}</h3>
                                  <p className="whitespace-nowrap font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.brand}</p>
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                {/* Quantity Controls */}
                                <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="p-1.5 hover:bg-white dark:hover:bg-gray-700 hover:text-red-500 rounded-full transition-colors text-gray-400 m-1"
                                  >
                                    {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                  </button>
                                  <span className="px-2 text-sm font-semibold text-gray-900 dark:text-white min-w-6 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="p-1.5 hover:bg-white dark:hover:bg-gray-700 hover:text-primary rounded-full transition-colors text-gray-400 m-1"
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
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => { setCartOpen(false); navigate('/cart'); }}
                          className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-900 px-6 py-4 text-base font-bold text-gray-900 hover:bg-gray-50 transition-all duration-300 active:scale-[0.98] dark:border-white dark:text-white dark:hover:bg-gray-800"
                        >
                          View Full Bag
                        </button>
                        <button
                          onClick={handleCheckout}
                          className="w-full flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-4 text-base font-bold text-white shadow-xl shadow-gray-200 hover:bg-primary hover:shadow-primary/20 transition-all duration-300 active:scale-[0.98] dark:bg-primary dark:shadow-none"
                        >
                          Proceed to Checkout <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }

      <main className="grow">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Main Footer Content */}
          <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-5">
              <Link to="/" className="inline-block">
                <span className="text-xl font-black tracking-widest text-gray-900 dark:text-white uppercase">SmartShop</span>
              </Link>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 max-w-xs">
                Your premium destination for quality fashion, accessories, and lifestyle products. Fast shipping worldwide.
              </p>
              {/* Social Icons */}
              <div className="flex gap-3 pt-1">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:-translate-y-0.5" title="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-pink-600 hover:text-white transition-all duration-300 hover:-translate-y-0.5" title="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all duration-300 hover:-translate-y-0.5" title="X (Twitter)">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              </div>
            </div>

            {/* Shop Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-widest uppercase">Shop</h3>
              <ul className="space-y-2.5">
                <li><Link to="/products?sort=newest" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">New Arrivals</Link></li>
                <li><Link to="/products?category=Women" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">Women</Link></li>
                <li><Link to="/products?category=Men" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">Men</Link></li>
                <li><Link to="/products?category=Accessories" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">Accessories</Link></li>
                <li><Link to="/products?on_sale=true" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">Sale</Link></li>
              </ul>
            </div>

            {/* Help Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-widest uppercase">Help</h3>
              <ul className="space-y-2.5">
                <li><Link to="/faq" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">FAQ</Link></li>
                <li><Link to="/page/shipping-info" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">Shipping Info</Link></li>
                <li><Link to="/page/returns" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">Returns</Link></li>
                <li><Link to="/page/how-to-order" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">How to Order</Link></li>
                <li><Link to="/page/size-guide" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">Size Guide</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-widest uppercase">Company</h3>
              <ul className="space-y-2.5">
                <li><Link to="/about" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">About Us</Link></li>
                <li><Link to="/contact" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">Contact</Link></li>
                <li><Link to="/blog" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">Blog</Link></li>
                {!isAdmin && <li><Link to="/affiliate" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">Affiliate</Link></li>}
                {!isAdmin && <li><Link to="/bonus-points" className="block py-1 pr-3 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400">Bonus Points</Link></li>}
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-widest uppercase">Newsletter</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Get updates on new arrivals and special offers.</p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${newsletterStatus === 'success' ? 'bg-green-600 text-white' :
                    newsletterStatus === 'error' ? 'bg-red-600 text-white' :
                      'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200'
                    }`}
                >
                  {newsletterStatus === 'loading' ? 'Subscribing...' :
                    newsletterStatus === 'success' ? 'Subscribed!' :
                      newsletterStatus === 'error' ? 'Try Again' : 'Subscribe'}
                </button>
                {newsletterMessage && (
                  <p className={`text-[10px] text-center mt-1 font-medium ${newsletterStatus === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {newsletterMessage}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800" />

          {/* Bottom Bar */}
          <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                &copy; 2026 SmartShop Inc. All rights reserved.
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">
                434 Main St, New Rochelle, NY 10801
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/page/privacy-policy" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link to="/page/terms-of-service" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms of Service</Link>
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                {/* Visa */}
                <svg className="h-5 opacity-40 hover:opacity-90 transition-all" viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M293.2 348.73l33.36-195.76h53.34l-33.38 195.76H293.2zm246.11-191.54c-10.57-3.98-27.19-8.24-47.95-8.24-52.87 0-90.12 26.73-90.39 65.01-.52 28.27 26.52 44.06 46.77 53.47 20.78 9.63 27.77 15.83 27.77 24.4-.14 13.18-16.68 19.2-32.06 19.2-21.42 0-32.81-2.98-50.38-10.34l-6.95-3.15-7.51 44.09c12.52 5.5 35.67 10.27 59.72 10.52 56.23 0 92.7-26.4 93.13-67.3.21-22.42-14.07-39.5-44.94-53.56-18.72-9.11-30.19-15.18-30.07-24.41 0-8.18 9.7-16.94 30.66-16.94 17.47-.28 30.15 3.55 40.02 7.53l4.8 2.27 7.38-42.55zm139.58-4.22h-41.35c-12.81 0-22.39 3.51-28.01 16.34l-79.47 180.43h56.16s9.18-24.24 11.26-29.57l68.49.08c1.59 6.9 6.5 29.49 6.5 29.49h49.66l-43.24-196.77zM637.88 303c4.42-11.32 21.31-54.93 21.31-54.93-.31.52 4.39-11.39 7.09-18.78l3.62 16.97s10.25 46.92 12.39 56.74h-44.41zM248.72 152.97l-52.39 133.6-5.6-27.24c-9.72-31.35-40.01-65.33-73.92-82.32l47.89 171.6 56.6-.06 84.25-195.58h-56.83z" fill="#1A1F71" />
                  <path d="M146.92 152.97H60.88l-.68 4.08c67.14 16.3 111.59 55.63 129.98 102.89l-18.77-90.59c-3.24-12.46-12.64-16.02-24.49-16.38z" fill="#F9A533" />
                </svg>
                {/* Mastercard */}
                <svg className="h-5 opacity-40 hover:opacity-90 transition-all" viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="312" cy="250" r="156" fill="#EB001B" />
                  <circle cx="468" cy="250" r="156" fill="#F79E1B" />
                  <path d="M390 130.7c39.6 30 65.2 77.6 65.2 131.3s-25.6 101.3-65.2 131.3c-39.6-30-65.2-77.6-65.2-131.3s25.6-101.3 65.2-131.3z" fill="#FF5F00" />
                </svg>
                {/* PayPal */}
                <svg className="h-5 opacity-40 hover:opacity-90 transition-all" viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M622.95 194.64c-8.38-50.52-56.76-67.87-113.4-67.87H377.13c-9.22 0-17.12 6.48-18.54 15.57l-54.04 330.38c-1.05 6.71 4.18 12.78 10.96 12.78h79.82l20.04-122.61-.63 3.88c1.42-9.09 9.29-15.57 18.51-15.57h38.53c75.7 0 134.94-29.66 152.27-115.5.51-2.54.96-5.02 1.34-7.43 5.15-31.73 0-53.34-13.44-72.63z" fill="#27346A" />
                  <path d="M636.39 267.27c-17.33 85.83-76.57 115.5-152.27 115.5h-38.53c-9.22 0-17.09 6.48-18.51 15.57l-24.5 149.82c-.92 5.86 3.65 11.17 9.58 11.17h67.23c8.07 0 14.99-5.68 16.24-13.64l.67-3.36 12.86-78.71.83-4.35c1.25-7.96 8.17-13.64 16.24-13.64h10.22c66.24 0 118.09-25.95 133.24-101.06 6.33-31.37 3.06-57.56-13.7-75.93-5.07-5.56-11.39-10.1-18.6-13.37z" fill="#2790C3" />
                  <path d="M609.15 256.32c-3.19-.92-6.5-1.77-9.92-2.54-3.42-.76-6.97-1.44-10.62-2.05-12.83-2.12-26.88-3.13-41.85-3.13H443.9c-3.04 0-5.93.6-8.56 1.68-5.79 2.38-10.08 7.49-11.19 13.76l-21.38 130.73-.63 3.88c1.42-9.09 9.29-15.57 18.51-15.57h38.53c75.7 0 134.94-29.66 152.27-115.5.52-2.54.96-5.02 1.34-7.43-4.61-2.39-9.62-4.37-3.64-3.83z" fill="#1F264F" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
};