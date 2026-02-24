import React from 'react';
import { Product } from '../types';
import { ShoppingBag } from 'lucide-react'; // Removing Zap, Star if unused to clean up
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link to={`/product/${product.slug}`} className="group cursor-pointer block h-full">
        <div className="relative bg-white overflow-hidden transition-all duration-300 h-full flex flex-col border border-gray-100 dark:bg-gray-900 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-indigo-900/10">

          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-white dark:bg-gray-800">
            <motion.img
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
              src={product.imageUrl || 'https://via.placeholder.com/600x600?text=No+Image'}
              alt={product.name}
              loading="lazy"
              className={`h-full w-full ${product.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=No+Image';
              }}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 focus:z-10">
              {product.salePrice && product.salePrice < product.price && (
                <div className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  {product.discountPercentage ? `-${product.discountPercentage}%` : 'SALE'}
                </div>
              )}
            </div>

            {/* Quick Add Button */}
            <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={handleBuy}
                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl shadow-2xl hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Quick Add
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col grow">
            <div className="mb-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em]">
              {product.brand || product.category}
            </div>
            <h3 className="text-gray-900 font-bold text-sm leading-tight mb-3 line-clamp-2 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {product.name}
            </h3>

            <div className="mt-auto flex items-center justify-between">
              <div className="flex flex-col">
                {product.salePrice && product.salePrice < product.price ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-gray-900 dark:text-white">${product.salePrice.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 line-through font-medium">${product.price.toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-lg font-black text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
                )}
              </div>

              {/* stock indicator */}
              <div className={cn(
                "w-2 h-2 rounded-full",
                product.stock > 10 ? "bg-green-500" : "bg-orange-500"
              )} title={`${product.stock} in stock`} />
            </div>

            {/* Size/Color Dots */}
            {(product.colors?.length > 0) && (
              <div className="flex mt-3 gap-1.5 overflow-hidden">
                {product.colors?.slice(0, 4).map((c, i) => (
                  <div key={i}
                    className="w-3 h-3 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm"
                    style={{ backgroundColor: c.toLowerCase() }}
                  />
                ))}
                {product.colors?.length > 4 && (
                  <span className="text-[9px] font-bold text-gray-400">+{product.colors.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};