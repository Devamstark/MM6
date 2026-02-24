import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2, Plus, Minus, ArrowRight, ShoppingBag,
    ArrowLeft, ShieldCheck, Truck, CreditCard,
    Star, Heart, Share2, Tag
} from 'lucide-react';

export const Cart = () => {
    const { items, cartTotal, removeFromCart, updateQuantity, itemCount } = useCart();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-4xl flex items-center justify-center mb-8 transform -rotate-6">
                    <ShoppingBag className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Your cart is feeling lonely</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10 text-lg leading-relaxed">
                    Looks like you haven't added any items to your shopping bag yet. Explore our latest collections and find something you love!
                </p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.4)] hover:-translate-y-1 active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" /> Explore Collections
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-20 transition-colors duration-300">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-up">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link to="/products" className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline flex items-center gap-1 group">
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Store
                            </Link>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Shopping Bag</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">You have <span className="text-indigo-600 dark:text-indigo-400 font-bold">{itemCount} items</span> in your cart</p>
                    </div>

                    <div className="hidden lg:flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="pr-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Security Guaranteed</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-200">PCI Compliant Checkouts</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Items List - Large Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: -50 }}
                                    transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                                    key={item.id}
                                    className="bg-white dark:bg-gray-900 rounded-4xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-indigo-500/5 transition-all group overflow-hidden relative"
                                >
                                    {/* Decorative Background Gradient */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 dark:bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>

                                    {/* Image Section */}
                                    <div className="w-full sm:w-44 h-44 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 relative group/img">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="h-full w-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg text-[10px] font-black text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 shadow-sm">
                                            QTY: {item.quantity}
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex-1 flex flex-col justify-between w-full h-44 py-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">{item.brand}</p>
                                                <Link to={`/product/${item.id}`} className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 transition-colors line-clamp-2 pr-8">{item.name}</Link>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-gray-900 dark:text-white">${item.price.toFixed(2)}</p>
                                                {item.price > 100 && <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">Express Available</p>}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-6">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center bg-gray-50 dark:bg-gray-800/80 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner group-hover:border-indigo-100 transition-colors">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:text-red-500 transition-all text-gray-400 shadow-sm"
                                                >
                                                    {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                                </button>
                                                <span className="w-12 text-center text-lg font-black text-gray-900 dark:text-white">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:text-indigo-600 transition-all text-gray-400 shadow-sm"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all border border-transparent hover:border-red-100"
                                                    onClick={() => removeFromCart(item.id)}
                                                    title="Remove from bag"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className="p-3 text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-2xl transition-all border border-transparent hover:border-pink-100"
                                                    title="Move to wishlist"
                                                >
                                                    <Heart className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Order Features Labels */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 transition-colors">
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900 dark:text-gray-200">Express Shipping</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Ships within 24 hours</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                    <Share2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900 dark:text-gray-200">Easy Returns</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">30-day return policy</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900 dark:text-gray-200">Secure Payment</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">100% encrypted checkout</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar - Right Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 sticky top-28 shadow-xl shadow-gray-200/50 dark:shadow-none transition-colors overflow-hidden">
                            {/* Decorative Background for Summary */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                            <h3 className="text-2xl font-black mb-8 border-b border-gray-50 dark:border-gray-800 pb-4 tracking-tight opacity-40 uppercase">Payment Abstract</h3>

                            <div className="space-y-5">
                                <div className="flex justify-between items-center group">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">Subtotal</span>
                                    <span className="text-gray-900 dark:text-white font-black">${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium group-hover:text-gray-900 transition-colors">Shipping Fee</span>
                                    <span className="text-green-600 font-black uppercase text-xs tracking-widest">Calculated Next</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium group-hover:text-gray-900 transition-colors">Tax Estimate</span>
                                    <span className="text-gray-400 dark:text-gray-500 font-bold italic text-xs">Included</span>
                                </div>

                                {/* Promo Input Section */}
                                <div className="pt-6 mt-6 border-t border-gray-50 dark:border-gray-800">
                                    <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3 block">Promotion Code</label>
                                    <div className="flex gap-2 relative group/promo">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/promo:text-indigo-600 transition-colors">
                                            <Tag className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="ENTER CODE"
                                            className="grow bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 tracking-widest transition-all dark:text-white"
                                        />
                                        <button className="bg-gray-900 dark:bg-white dark:text-black text-white px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200 dark:shadow-none">
                                            Apply
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-8 mt-8 border-t border-gray-900/5 dark:border-gray-800">
                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Valuation</p>
                                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Including all levies</p>
                                        </div>
                                        <p className="text-4xl font-black text-gray-900 dark:text-white">${cartTotal.toFixed(2)}</p>
                                    </div>

                                    <button
                                        onClick={() => navigate('/checkout')}
                                        className="w-full bg-gray-900 dark:bg-indigo-600 text-white rounded-3xl py-6 text-base font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                        Proceed to Checkout
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </button>

                                    <div className="mt-8 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-2xl flex items-start gap-3 border border-indigo-100/50 dark:border-indigo-800/30 transition-colors">
                                        <Star className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                                        <p className="text-[10px] text-indigo-800 dark:text-indigo-300 font-medium leading-relaxed">
                                            Checkout today and earn <span className="font-bold">{(cartTotal * 0.1).toFixed(0)} SmartPoints</span> to use on your next purchase.
                                            <Link to="/points" className="underline ml-1">Learn More</Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info Cards under summary */}
                        <div className="mt-6 space-y-4">
                            {!isAuthenticated && (
                                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4 animate-fade-up">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                        !
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">Shopping as Guest</p>
                                        <p className="text-[10px] text-gray-500 flex items-center gap-1 group">
                                            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Sign in</Link> for loyalty points
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
