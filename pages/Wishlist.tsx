import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { Loader2, Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Wishlist = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            const data = await api.getWishlist();
            setProducts(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId: string) => {
        await api.toggleWishlist(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-gray-900 min-h-screen pt-12 pb-24 transition-colors"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-3xl font-bold text-gray-900 dark:text-white mb-8 font-serif"
                >
                    My Wishlist
                    {products.length > 0 && (
                        <span className="ml-3 text-lg font-normal text-gray-400">({products.length} items)</span>
                    )}
                </motion.h1>

                <AnimatePresence mode="wait">
                    {products.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="text-center py-20"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.08, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <Heart className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                            </motion.div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">Save items you love to your wishlist.</p>
                            <Link to="/products" className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                                Start Shopping
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            <AnimatePresence>
                                {products.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        variants={{
                                            hidden: { opacity: 0, y: 28, scale: 0.95 },
                                            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } }
                                        }}
                                        exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.25 } }}
                                        className="group relative"
                                    >
                                        <div className="aspect-3/4 w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 relative">
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 right-4 space-y-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.15 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleRemove(product.id)}
                                                    className="bg-white dark:bg-gray-900 p-2 rounded-full shadow-lg text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <Heart className="w-5 h-5 fill-current" />
                                                </motion.button>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                                    <Link to={`/product/${product.slug}`}>
                                                        <span aria-hidden="true" className="absolute inset-0" />
                                                        {product.name}
                                                    </Link>
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{product.brand}</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">${product.price}</p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addToCart(product);
                                            }}
                                            className="mt-4 w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 relative z-10"
                                        >
                                            <ShoppingCart className="w-4 h-4" /> Add to Cart
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
