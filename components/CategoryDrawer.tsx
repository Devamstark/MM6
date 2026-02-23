import React from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../utils/categories';

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Group subcategories for better organization
const WOMEN_GROUPS = {
  'Dresses': ['Casual Dresses', 'Evening Dresses', 'Maxi Dresses', 'Mini Dresses'],
  'Tops': ['T-Shirts', 'Blouses', 'Sweaters', 'Crop Tops'],
  'Bottoms': ['Jeans', 'Skirts', 'Pants', 'Shorts'],
  'Outerwear': ['Jackets', 'Coats', 'Blazers', 'Cardigans']
};

const MEN_GROUPS = {
  'Tops': ['T-Shirts', 'Shirts', 'Polos', 'Sweaters', 'Hoodies'],
  'Bottoms': ['Jeans', 'Chinos', 'Joggers', 'Shorts', 'Dress Pants'],
  'Outerwear': ['Jackets', 'Coats', 'Blazers'],
  'Suits': ['Full Suits', 'Suit Jackets', 'Vests']
};

const ACCESSORIES_LIST = ['Bags', 'Jewelry', 'Watches', 'Belts', 'Hats', 'Scarves', 'Sunglasses'];

export const CategoryDrawer: React.FC<CategoryDrawerProps> = ({ isOpen, onClose }) => {
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = React.useState<string | null>(null);

  const handleCategoryClick = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
      setExpandedGroup(null);
    } else {
      setExpandedCategory(category);
      setExpandedGroup(null);
    }
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Only visible on mobile/tablet */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer - Only visible on mobile/tablet */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-[61] shadow-2xl transform transition-transform duration-300 ease-out dark:bg-gray-900 dark:border-r dark:border-gray-800 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with Gradient */}
        <div className="relative p-5 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                Shop by Category
              </h2>
              <p className="text-xs text-gray-400 mt-1">Discover your style</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div className="overflow-y-auto h-[calc(100vh-100px)] bg-gray-50 dark:bg-gray-900">
          
          {/* Quick Access - All Products */}
          <Link
            to="/products"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">All Products</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Browse everything</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          {/* Women Category */}
          <div className="border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => handleCategoryClick('Women')}
              className="flex items-center justify-between w-full px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <span className="text-lg font-bold">👩</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Women</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{CATEGORIES['Women'].length} subcategories</p>
                </div>
              </div>
              {expandedCategory === 'Women' ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Women Subcategories - Grouped */}
            {expandedCategory === 'Women' && (
              <div className="bg-gray-50 dark:bg-gray-900/50">
                {Object.entries(WOMEN_GROUPS).map(([group, items]) => (
                  <div key={group} className="border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                      className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-gray-100 transition-colors dark:hover:bg-gray-800"
                    >
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider dark:text-gray-400">{group}</span>
                      {expandedGroup === group ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {expandedGroup === group && (
                      <div className="grid grid-cols-2 gap-1.5 p-3 pt-0">
                        {items.map((item) => (
                          <Link
                            key={item}
                            to={`/products?category=Women&subcategory=${encodeURIComponent(item)}`}
                            onClick={onClose}
                            className="px-3 py-2 text-xs font-medium text-gray-700 bg-white rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm border border-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Men Category */}
          <div className="border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => handleCategoryClick('Men')}
              className="flex items-center justify-between w-full px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <span className="text-lg font-bold">👨</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Men</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{CATEGORIES['Men'].length} subcategories</p>
                </div>
              </div>
              {expandedCategory === 'Men' ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Men Subcategories - Grouped */}
            {expandedCategory === 'Men' && (
              <div className="bg-gray-50 dark:bg-gray-900/50">
                {Object.entries(MEN_GROUPS).map(([group, items]) => (
                  <div key={group} className="border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                      className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-gray-100 transition-colors dark:hover:bg-gray-800"
                    >
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider dark:text-gray-400">{group}</span>
                      {expandedGroup === group ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {expandedGroup === group && (
                      <div className="grid grid-cols-2 gap-1.5 p-3 pt-0">
                        {items.map((item) => (
                          <Link
                            key={item}
                            to={`/products?category=Men&subcategory=${encodeURIComponent(item)}`}
                            onClick={onClose}
                            className="px-3 py-2 text-xs font-medium text-gray-700 bg-white rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm border border-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accessories */}
          <div className="border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => handleCategoryClick('Accessories')}
              className="flex items-center justify-between w-full px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <span className="text-lg font-bold">👜</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Accessories</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ACCESSORIES_LIST.length} items</p>
                </div>
              </div>
              {expandedCategory === 'Accessories' ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Accessories List */}
            {expandedCategory === 'Accessories' && (
              <div className="grid grid-cols-2 gap-1.5 p-3 bg-gray-50 dark:bg-gray-900/50">
                {ACCESSORIES_LIST.map((item) => (
                  <Link
                    key={item}
                    to={`/products?category=Accessories&subcategory=${encodeURIComponent(item)}`}
                    onClick={onClose}
                    className="px-3 py-2 text-xs font-medium text-gray-700 bg-white rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm border border-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sale - Highlighted */}
          <Link
            to="/products?on_sale=true"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100 hover:from-red-100 hover:to-pink-100 transition-all dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-900/30"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-red-500/30">
              <span className="text-lg font-bold">🔥</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700 dark:text-red-400">Sale</p>
              <p className="text-xs text-red-500 dark:text-red-400/70">Up to 70% off</p>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400" />
          </Link>

          {/* Quick Filters */}
          <div className="p-4 bg-white border-t border-gray-100 dark:bg-gray-800 dark:border-gray-800">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Quick Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/products?sort=newest"
                onClick={onClose}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs font-bold rounded-full hover:from-indigo-100 hover:to-purple-100 transition-all border border-indigo-100 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300 dark:border-indigo-800"
              >
                ✨ New
              </Link>
              <Link
                to="/products?isFeatured=true"
                onClick={onClose}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 text-xs font-bold rounded-full hover:from-amber-100 hover:to-yellow-100 transition-all border border-amber-100 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-300 dark:border-amber-800"
              >
                ⭐ Featured
              </Link>
              <Link
                to="/products?isPopular=true"
                onClick={onClose}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-xs font-bold rounded-full hover:from-emerald-100 hover:to-teal-100 transition-all border border-emerald-100 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-300 dark:border-emerald-800"
              >
                🔥 Trending
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
