import React, { useRef, useEffect } from 'react';
import { Product } from '../types';
import { ShoppingBag, Zap, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { cn } from '../utils/cn';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: index * 0.1,
          ease: 'power2.out',
        }
      );
    }
  }, [index]);

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
    <div ref={cardRef} className="opacity-0">
      <Link to={`/product/${product.slug}`} className="group cursor-pointer block h-full">
        <div className="relative bg-white overflow-hidden transition-all duration-300 h-full flex flex-col border border-gray-100 dark:bg-gray-900 dark:border-gray-800">

          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-white dark:bg-gray-700">
            <img
              src={product.imageUrl || 'https://via.placeholder.com/600x600?text=No+Image'}
              alt={product.name}
              className={`h-full w-full transition-transform duration-700 group-hover:scale-110 ${product.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=No+Image';
              }}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              {product.salePrice && product.salePrice < product.price && (
                <div className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest shadow-sm">
                  {product.discountPercentage ? `-${product.discountPercentage}%` : 'SALE'}
                </div>
              )}
            </div>

            {/* Action Buttons - Always visible as min stock is 1 */}
            {/* Action Buttons - Minimal */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={handleBuy}
                className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-black transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-black hover:text-white"
              >
                Quick Add
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 flex flex-col grow text-center">
            <div className="mb-1 text-[9px] text-gray-400 font-bold uppercase tracking-[0.15em] font-sans">
              {product.brand || product.category}
            </div>
            <h3 className="text-gray-900 font-medium text-sm leading-snug mb-2 group-hover:underline transition-all dark:text-gray-100 uppercase tracking-tight">
              {product.name}
            </h3>

            <div className="mt-auto flex flex-col items-center pt-2">
              {product.salePrice && product.salePrice < product.price ? (
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-sm font-bold text-red-600">${product.salePrice.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-400 line-through">${product.price.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-sm font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
              )}

              {/* Size/Color Indicator - Subtle */}
              {(product.colors?.length > 0 || product.sizes?.length > 0) && (
                <div className="flex mt-2 -space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  {product.colors?.slice(0, 3).map((c, i) => (
                    <div key={i}
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: c.toLowerCase() }}
                    />
                  ))}
                  {product.colors?.length > 3 && (
                    <div className="w-3.5 h-3.5 rounded-full border border-white bg-gray-50 flex items-center justify-center text-[7px] font-bold text-gray-400">
                      +{product.colors.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};