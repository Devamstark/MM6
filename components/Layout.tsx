import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, User as UserIcon, Shield, Package, Search, Menu, Store, LayoutDashboard, X, Trash2, Plus, Minus } from 'lucide-react';

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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Modern Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Left: Logo & Desktop Links */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                   <Store className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl text-indigo-900 tracking-tight">CloudMart</span>
              </Link>
              
              <div className="hidden md:flex space-x-6">
                <Link to="/products" className={`text-sm font-medium transition-colors ${isActive('/products') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>
                  Marketplace
                </Link>
                <Link to="/products?category=Electronics" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Electronics
                </Link>
                <Link to="/products?category=Fashion" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Fashion
                </Link>
              </div>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 flex items-center justify-center px-6 lg:ml-6 lg:justify-end">
              <div className="max-w-lg w-full lg:max-w-xs">
                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-indigo-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                  {isSeller && (
                    <Link to="/seller" className="hidden md:flex items-center gap-1 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-full transition-colors shadow-sm">
                      <Store className="w-4 h-4" />
                      Seller Hub
                    </Link>
                  )}
                  
                  <div className="relative group">
                     <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none py-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                           {user?.name.charAt(0)}
                        </div>
                     </button>
                     {/* Dropdown with padding-top to bridge the gap */}
                     <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                        <div className="bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-xs text-gray-500">Signed in as</p>
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                          </div>
                          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                     </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">Sign in</Link>
                  <Link to="/register" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Cart Button */}
              <button 
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-400 hover:text-gray-500"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>
              
               {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-400 hover:text-gray-500">
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
             <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Shop All</Link>
                {isAdmin && <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50">Admin Dashboard</Link>}
                {isSeller && <Link to="/seller" className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50">Seller Dashboard</Link>}
             </div>
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setCartOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                    <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-500">
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mt-8">
                    {items.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Your cart is empty.</p>
                        <button onClick={() => { setCartOpen(false); navigate('/products'); }} className="mt-4 text-indigo-600 font-medium hover:underline">Start Shopping</button>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {items.map((item) => (
                          <li key={item.id} className="py-6 flex">
                            <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-center object-cover" />
                            </div>
                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>{item.name}</h3>
                                  <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">{item.brand}</p>
                              </div>
                              <div className="flex-1 flex items-end justify-between text-sm">
                                <div className="flex items-center border border-gray-300 rounded">
                                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                                  <span className="px-2 font-medium">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                                </div>
                                <button type="button" onClick={() => removeFromCart(item.id)} className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                                  <Trash2 className="w-4 h-4" /> Remove
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>${cartTotal.toFixed(2)}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                    <div className="mt-6">
                      <button className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                        Checkout
                      </button>
                    </div>
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

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <span className="text-gray-400 hover:text-gray-500 cursor-pointer">Facebook</span>
            <span className="text-gray-400 hover:text-gray-500 cursor-pointer">Twitter</span>
            <span className="text-gray-400 hover:text-gray-500 cursor-pointer">GitHub</span>
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