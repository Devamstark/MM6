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
      <Link to={`/product/${product.id}`} className="group cursor-pointer block h-full">
        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col border border-gray-100 dark:bg-gray-800 dark:border-gray-700">

          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary dark:bg-gray-700">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {(product.isFeatured || product.isPopular) && (
                <div className="bg-white/90 backdrop-blur-sm text-zinc-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm dark:bg-black/80 dark:text-white">
                  {product.isFeatured ? 'Hot' : 'Popular'}
                </div>
              )}
              {product.salePrice && product.salePrice < product.price && (
                <div className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {product.discountPercentage ? `-${product.discountPercentage}% OFF` : 'SALE'}
                </div>
              )}
            </div>

            {/* Action Buttons - Always visible as min stock is 1 */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={handleBuy}
                className="bg-white text-zinc-900 hover:bg-zinc-900 hover:text-white p-3 rounded-full shadow-lg transition-colors duration-200 dark:bg-gray-700 dark:text-white dark:hover:bg-primary"
                title="Add to Cart"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-primary text-white hover:bg-primary/90 p-3 rounded-full shadow-lg transition-colors duration-200"
                title="Buy Now"
              >
                <Zap className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-grow">
            <div className="mb-1 text-xs text-zinc-500 font-medium uppercase tracking-wider font-sans dark:text-gray-400">
              {product.category}
            </div>
            <h3 className="text-zinc-900 font-heading font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors dark:text-white dark:group-hover:text-primary">
              {product.name}
            </h3>

            {/* Rating Placeholder (if reviews exist) */}
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-zinc-500 font-medium dark:text-gray-400">4.8 (120)</span>
            </div>

            <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50 dark:border-gray-700">
              <div className="flex flex-col">
                {product.salePrice && product.salePrice < product.price ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-primary">${product.salePrice.toFixed(2)}</span>
                    <span className="text-xs text-zinc-400 line-through dark:text-gray-500">${product.price.toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-zinc-900 dark:text-white">${product.price.toFixed(2)}</span>
                )}
              </div>

              {/* Size/Color Indicator */}
              {(product.colors?.length > 0 || product.sizes?.length > 0) && (
                <div className="flex -space-x-2">
                  {product.colors?.slice(0, 3).map((c, i) => (
                    <div key={i}
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm dark:border-gray-800"
                      style={{ backgroundColor: c.toLowerCase() }}
                    />
                  ))}
                  {product.colors?.length > 3 && (
                    <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-300">
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