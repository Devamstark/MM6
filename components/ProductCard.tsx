import React from 'react';
import { Product } from '../types';
import { ShoppingCart, Star } from 'lucide-react';
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
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group">
      <div className="relative pt-[100%] bg-gray-100 overflow-hidden rounded-t-lg">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isFeatured && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
            Best Seller
          </span>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
        <h3 className="text-gray-900 font-medium line-clamp-2 mb-1 hover:text-blue-600 cursor-pointer" title={product.name}>
          {product.name}
        </h3>
        
        {/* Mock Rating */}
        <div className="flex items-center mb-2">
            {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
            <span className="text-xs text-blue-600 ml-1">128</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline mb-2">
            <span className="text-sm text-gray-500 mr-1">$</span>
            <span className="text-xl font-bold text-gray-900">{Math.floor(product.price)}</span>
            <span className="text-sm text-gray-900">{(product.price % 1).toFixed(2).substring(1)}</span>
          </div>
          
          <button 
            onClick={handleBuy}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-1.5 px-4 rounded-full text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};