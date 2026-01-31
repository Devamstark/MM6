import React from 'react';
import { Product } from '../types';
import { ShoppingBag, Star, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <Link to={`/product/${product.id}`} className="group cursor-pointer block">
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

        {/* Stock Badge */}
        {product.stock <= 0 && (
          <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
            Out of Stock
          </div>
        )}

        {/* Quick Add Button - Only if in stock */}
        {product.stock > 0 && (
          <div className="absolute bottom-3 right-3 flex gap-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleBuy}
              className="bg-white hover:bg-black text-black hover:text-white p-2.5 rounded-full shadow-lg"
              title="Add to Cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button
              onClick={handleBuyNow}
              className="bg-black hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg"
              title="Buy Now"
            >
              <Zap className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-sm text-gray-900 truncate font-medium group-hover:underline decoration-1 underline-offset-2">
        {product.name}
      </h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-base font-bold text-red-600">${product.price.toFixed(2)}</span>
        <span className="text-xs text-gray-400 line-through">${(product.price * 1.2).toFixed(2)}</span>
      </div>
      {product.stock > 0 && product.stock < 10 && (
        <div className="text-[10px] font-bold text-orange-600 mt-1">Only {product.stock} left</div>
      )}

    </Link>
  );
};