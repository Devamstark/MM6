import React from 'react';
import { Product } from '../types';
import { ShoppingCart, Star, Plus } from 'lucide-react';
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
    <div className="bg-white rounded-[28px] overflow-hidden hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 flex flex-col h-full group border border-gray-100 relative">
      {/* Image Container */}
      <div className="relative pt-[110%] bg-[#f4f7fc] overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="absolute top-0 left-0 w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-transform duration-500 ease-out"
        />
        {product.isFeatured && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-indigo-700 text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-sm">
            Best Seller
          </span>
        )}
        
        {/* Quick Add Button overlay */}
        <button 
          onClick={handleBuy}
          className="absolute bottom-4 right-4 bg-white text-indigo-600 p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-indigo-600 hover:text-white"
          title="Add to Cart"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{product.brand}</div>
            <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-orange-400 fill-current" />
                <span className="text-xs font-medium text-gray-500">4.8</span>
            </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
            {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">${Math.floor(product.price)}</span>
            <span className="text-sm font-semibold text-gray-500 ml-0.5">.{(product.price % 1).toFixed(2).substring(2)}</span>
          </div>
          
          <button 
            onClick={handleBuy}
            className="bg-gray-900 hover:bg-indigo-600 text-white font-medium py-2.5 px-5 rounded-full text-sm transition-all shadow-md shadow-gray-200 hover:shadow-indigo-200 flex items-center gap-2 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};