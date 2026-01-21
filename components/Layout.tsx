import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, User as UserIcon, Shield, Package, Search, Menu, Store, LayoutDashboard, X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isAdmin, isSeller, logout } = useAuth();
  const { items, itemCount, cartTotal, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/products');
    }
  };

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-slate-900">
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Modern Floating Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Left: Logo & Desktop Links */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                <div className="bg-indigo-600 p-2 rounded-xl group-hover:bg-indigo-700 transition-colors duration-300 shadow-sm shadow-indigo-200">
                   <Store className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-2xl text-gray-800 tracking-tight group-hover:text-indigo-600 transition-colors">CloudMart</span>
              </Link>
              
              <div className="hidden md:flex space-x-1">
                <Link to="/products" className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive('/products') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  Marketplace
                </Link>
                <Link to="/products?category=Electronics" className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200">
                  Electronics
                </Link>
                <Link to="/products?category=Fashion" className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200">
                  Fashion
                </Link>
              </div>
            </div>

            {/* Center: Search Bar (Pill Shape) */}
            <div className="hidden lg:flex flex-1 max-w-xl px-8">
              <form onSubmit={handleSearch} className="w-full relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-3 border-none rounded-full leading-5 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:shadow-lg transition-all duration-300 ease-out"
                  placeholder="Search for products, brands and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="hidden md:flex items-center gap-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                  {isSeller && (
                    <Link to="/seller" className="hidden md:flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full transition-colors shadow-sm shadow-indigo-200">
                      <Store className="w-4 h-4" />
                      Seller Hub
                    </Link>
                  )}
                  
                  <div className="relative group">
                     <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-all">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                           {user?.name.charAt(0)}
                        </div>
                     </button>
                     {/* Dropdown */}
                     <div className="absolute right-0 top-full pt-2 w-56 hidden group-hover:block z-50">
                        <div className="bg-white rounded-2xl shadow-xl py-2 ring-1 ring-black ring-opacity-5 overflow-hidden">
                          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Signed in as</p>
                            <p className="text-sm font-bold text-gray-900 truncate mt-1">{user?.email}</p>
                          </div>
                          <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                     </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all">Sign in</Link>
                  <Link to="/register" className="px-5 py-2.5 rounded-full text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:scale-105">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Cart Button */}
              <button 
                onClick={() => setCartOpen(true)}
                className="relative p-3 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-all active:scale-95"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full border-2 border-white shadow-sm">
                    {itemCount}
                  </span>
                )}
              </button>
              
               {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
             <div className="px-4 pt-4 pb-6 space-y-2">
                <Link to="/products" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">Shop All</Link>
                {isAdmin && <Link to="/admin" className="block px-4 py-3 rounded-xl text-base font-medium text-indigo-600 hover:bg-indigo-50 transition-colors">Admin Dashboard</Link>}
                {isSeller && <Link to="/seller" className="block px-4 py-3 rounded-xl text-base font-medium text-indigo-600 hover:bg-indigo-50 transition-colors">Seller Dashboard</Link>}
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
              <div className="h-full flex flex-col bg-white shadow-2xl rounded-l-3xl overflow-hidden border-l border-white/50">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
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
                      <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center transform rotate-3">
                        <ShoppingCart className="w-10 h-10 text-indigo-300" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-gray-900">Your cart is empty</p>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
                      </div>
                      <button 
                        onClick={() => { setCartOpen(false); navigate('/products'); }} 
                        className="px-8 py-3 bg-white border border-gray-200 text-indigo-600 font-bold rounded-full hover:bg-gray-50 hover:shadow-md transition-all"
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
                                <p className="whitespace-nowrap font-bold text-indigo-600">${(item.price * item.quantity).toFixed(2)}</p>
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
                                  className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-full transition-colors text-gray-400 m-1"
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
                  <div className="border-t border-gray-100 p-6 bg-white z-10">
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
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-4 text-base font-bold text-white shadow-xl shadow-gray-200 hover:bg-indigo-600 hover:shadow-indigo-200 transition-all duration-300 active:scale-[0.98]"
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

      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-8 md:order-2">
            <span className="text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors">Facebook</span>
            <span className="text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors">Twitter</span>
            <span className="text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors">GitHub</span>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2023 CloudMart Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};