import React from 'react';
import { Product } from '../types';
import { ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <div className="group cursor-pointer">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-sm mb-3">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges */}
        {(product.isFeatured || product.isPopular) && (
          <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
            {product.isFeatured ? 'Hot' : 'Popular'}
          </div>
        )}

        {/* Quick Add Button */}
        <button
          onClick={handleBuy}
          className="absolute bottom-3 right-3 bg-white hover:bg-black text-black hover:text-white p-2.5 rounded-full shadow-lg translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
        >
          <ShoppingBag className="w-5 h-5" />
        </button>
      </div>

      {/* Info */}
      <h3 className="text-sm text-gray-900 truncate font-medium group-hover:underline decoration-1 underline-offset-2">
        {product.name}
      </h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-base font-bold text-red-600">${product.price.toFixed(2)}</span>
        <span className="text-xs text-gray-400 line-through">${(product.price * 1.2).toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
        <Star className="w-3 h-3 text-black fill-current" />
        <span>4.9</span>
        <span className="text-gray-300 mx-1">|</span>
        <span>1.2k+ sold</span>
      </div>
    </div>
  );
};