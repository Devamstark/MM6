import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

interface ProductCardProps {
  product: Product;
  index?: number;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0, priority = false }) => {
  const { addToCart } = useCart();
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const hasDiscount = !!(product.salePrice && product.salePrice < product.price);
  const discountPct = hasDiscount && product.discountPercentage
    ? `${product.discountPercentage}`
    : hasDiscount
      ? `${Math.round(((product.price - product.salePrice!) / product.price) * 100)}`
      : null;

  const displayPrice = hasDiscount ? product.salePrice! : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1400);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      await api.toggleWishlist(product.id);
      setWishlisted(prev => !prev);
    } catch {
      // silently fail — user may not be logged in
    } finally {
      setWishlistLoading(false);
    }
  };

  const stockLabel =
    product.stock === 0
      ? { text: 'Out of stock', cls: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400' }
      : product.stock <= 5
        ? { text: `${product.stock} left`, cls: 'bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400' }
        : { text: 'In stock', cls: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.05, 0.35) }}
      className="group h-full"
    >
      <Link to={`/product/${product.slug}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl">
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 flex flex-col h-full">

          {/* ── IMAGE ────────────────────────────────────── */}
          <div className="relative overflow-hidden bg-[#f8f8f8] dark:bg-gray-800" style={{ aspectRatio: '3/4' }}>

            <img
              src={product.imageUrl || 'https://placehold.co/450x600/f3f4f6/9ca3af?text=No+Image'}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              className={`absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105 ${product.imageFit === 'contain' ? 'object-contain p-4' : 'object-cover'
                }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/450x600/f3f4f6/9ca3af?text=No+Image';
              }}
            />

            {/* Bottom gradient for CTA visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* ── Discount + Wishlist row ── */}
            <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-3 z-10">
              {/* Badge */}
              {discountPct ? (
                <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg leading-none">
                  -{discountPct}%
                </span>
              ) : (
                <span />
              )}

              {/* Wishlist button */}
              <button
                onClick={handleWishlist}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`
                  w-8 h-8 flex items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-200
                  bg-white/90 dark:bg-gray-900/90
                  opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                  hover:scale-110 active:scale-95
                `}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${wishlisted
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-500 dark:text-gray-400'
                    }`}
                />
              </button>
            </div>

            {/* ── Quick Add to Bag ── */}
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold tracking-wide backdrop-blur-sm shadow-xl transition-all duration-200
                  bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white
                  hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {addedFeedback ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-1.5 text-green-600 dark:text-green-400"
                    >
                      ✓ Added
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to Bag
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* ── INFO ─────────────────────────────────────── */}
          <div className="flex flex-col p-4 grow gap-1.5">

            {/* Brand */}
            <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest truncate leading-none">
              {product.brand || product.category || 'SmartShop'}
            </p>

            {/* Name */}
            <h3 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {product.name}
            </h3>

            {/* Price + Stock */}
            <div className="mt-auto pt-2 flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-bold text-gray-900 dark:text-white">
                  ${displayPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${stockLabel.cls}`}>
                {stockLabel.text}
              </span>
            </div>

            {/* Color swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                {product.colors.slice(0, 5).map((c, i) => (
                  <div
                    key={i}
                    title={c}
                    className="w-3.5 h-3.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-inner hover:scale-125 transition-transform cursor-default"
                    style={{ backgroundColor: c.toLowerCase() }}
                  />
                ))}
                {product.colors.length > 5 && (
                  <span className="text-[10px] font-medium text-gray-400">
                    +{product.colors.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

        </div>
      </Link>
    </motion.div>
  );
};