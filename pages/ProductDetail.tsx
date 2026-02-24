import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star, ShoppingBag, ArrowLeft, Truck, RotateCcw,
    ShieldCheck, Heart, Share2, Plus, Minus, Check,
    CreditCard, Info, MessageSquare, Package, X
} from 'lucide-react';
import { CountdownTimer } from '../components/CountdownTimer';
import { ProductCard } from '../components/ProductCard';
import { SizeGuideModal } from '../components/SizeGuideModal';

export const ProductDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping' | 'reviews'>('description');
    const [mainImage, setMainImage] = useState<string>('');
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

    const [reviews, setReviews] = useState<Review[]>([]);
    const [canReview, setCanReview] = useState(false);
    const [newReviewRating, setNewReviewRating] = useState(5);
    const [newReviewComment, setNewReviewComment] = useState('');
    const [inWishlist, setInWishlist] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const data = await api.getProduct(slug);
                if (data) {
                    setProduct(data);
                    setMainImage(data.imageUrl);
                    if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
                    if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);

                    // Fetch Related
                    const relatedRes = await api.getProducts({ category: data.category });
                    const related = (relatedRes as any).results || [];
                    setRelatedProducts(related.filter((p: any) => p.id !== data.id).slice(0, 4));

                    // Fetch Reviews
                    const revs = await api.getReviews(data.id);
                    setReviews(revs);

                    // Check Wishlist
                    if (user) {
                        const wishlist = await api.getWishlist();
                        setInWishlist(wishlist.some(p => p.id === data.id));

                        // Check purchase for review permission
                        const orders = await api.getRecentOrders();
                        const hasBought = orders.some(o => o.items?.some(i => i.id === data.id));
                        setCanReview(hasBought);
                    }
                }
            } catch (err) {
                console.error("Failed to load product data", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [slug, user]);

    const handleWishlistToggle = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (product) {
            const status = await api.toggleWishlist(product.id);
            setInWishlist(status);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            const variant = product.variants?.find(v => v.size === selectedSize && v.color === selectedColor);
            const stockLimit = variant ? variant.stock : product.stock;
            // Add 'quantity' times
            for (let i = 0; i < quantity; i++) {
                addToCart({ ...product, stock: stockLimit });
            }
        }
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/checkout');
    };

    const submitReview = async () => {
        if (!product || !user) return;
        if (!newReviewComment.trim()) return;

        try {
            await api.createReview(product.id, newReviewRating, newReviewComment, user);
            const revs = await api.getReviews(product.id);
            setReviews(revs);
            setNewReviewComment('');
            setActiveTab('reviews');
        } catch (e) {
            console.error(e);
        }
    };

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0; // Live data only, no fallback 4.5

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-400 font-medium animate-pulse">Loading perfection...</p>
            </div>
        </div>
    );

    if (!product) return <div className="text-center py-20">Product not found</div>;

    const allImages = Array.from(new Set([product.imageUrl, ...(product.additionalImages || [])])).filter(Boolean);
    const isOutOfStock = product.stock <= 0;

    const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/800x800?text=No+Image+Available';

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white min-h-screen pb-16 pt-20 dark:bg-gray-900 transition-colors duration-300 font-body"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Navigation */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>

                {/* Top Section: Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

                    {/* Left: Image Gallery (Span 6) - Amazon Style */}
                    <div className="lg:col-span-6 flex gap-4">
                        {/* Vertical Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="hidden sm:flex flex-col gap-2 w-16">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onMouseEnter={() => setMainImage(img)}
                                        className={`w-16 h-16 rounded-sm overflow-hidden border transition-all p-0.5 shrink-0
                                            ${mainImage === img ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                    >
                                        <img
                                            src={img}
                                            alt=""
                                            className="w-full h-full object-contain"
                                            onError={handleImageError}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main Image Container */}
                        <div className="flex-1 min-w-0">
                            <div className="relative group bg-white rounded-sm overflow-hidden border border-gray-100 dark:bg-gray-800 dark:border-gray-700 aspect-square flex items-center justify-center p-4">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={mainImage}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        src={mainImage || PLACEHOLDER_IMAGE}
                                        alt={product.name}
                                        className={`max-w-full max-h-full ${product.imageFit === 'contain' ? 'object-contain' : 'object-cover'} transition-all`}
                                        onError={handleImageError}
                                    />
                                </AnimatePresence>

                                {/* Zoom Placeholder / Hover Effect */}
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                            </div>

                            {/* Mobile Thumbnails (Horizontal) */}
                            {allImages.length > 1 && (
                                <div className="flex sm:hidden gap-2 mt-4 overflow-x-auto pb-2 px-1">
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setMainImage(img)}
                                            className={`w-16 h-16 shrink-0 rounded-sm overflow-hidden border transition-all
                                                ${mainImage === img ? 'border-orange-500' : 'border-gray-100 dark:border-gray-800'}`}
                                        >
                                            <img
                                                src={img}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={handleImageError}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info (Span 6) - Sticky */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-6 flex flex-col sticky top-24 space-y-6 lg:pl-8"
                    >
                        <div>
                            {/* Brand & Category */}
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {product.brand}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-xl sm:text-2xl font-medium text-gray-900 tracking-tight leading-tight mb-3 dark:text-white uppercase">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4">
                                {/* Rating */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-0.5 text-yellow-500">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className={`w-3 h-3 ${s <= Math.round(averageRating) ? 'fill-current' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">{averageRating > 0 ? averageRating.toFixed(1) : ''}</span>
                                </div>

                                {/* Trust Proof */}
                                <div className="flex items-center gap-2 px-2 py-0.5 bg-green-50 rounded-sm dark:bg-green-900/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    <span className="text-[9px] font-bold text-green-700 uppercase tracking-wider dark:text-green-400">Verified Seller</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-4 pt-4">
                            {product.salePrice && product.salePrice < product.price ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold text-red-600">${product.salePrice.toFixed(2)}</span>
                                    <span className="text-lg text-gray-400 line-through font-medium">${product.price.toFixed(2)}</span>
                                </div>
                            ) : (
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
                            )}
                        </div>

                        {/* Stock indicator with real count */}
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isOutOfStock ? 'bg-red-500' : product.stock <= 5 ? 'bg-orange-500' : 'bg-green-500'}`} />
                            <span className={`text-sm font-semibold ${isOutOfStock ? 'text-red-600 dark:text-red-400'
                                : product.stock <= 5 ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-green-700 dark:text-green-400'
                                }`}>
                                {isOutOfStock
                                    ? 'Out of Stock'
                                    : product.stock <= 5
                                        ? `Only ${product.stock} left — order soon!`
                                        : `In Stock & Ready to Ship (${product.stock} available)`
                                }
                            </span>
                        </div>

                        {/* Selection Area */}
                        <div className="space-y-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                            {/* Color Selector */}
                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Color</label>
                                        <span className="text-xs text-gray-900 dark:text-gray-100 font-semibold">{selectedColor}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {product.colors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-8 h-8 rounded-full transition-all p-0.5 border
                                                    ${selectedColor === color ? 'border-black dark:border-white ring-1 ring-black dark:ring-white ring-offset-2 dark:ring-offset-gray-900' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'}`}
                                                title={color}
                                            >
                                                <div
                                                    className="w-full h-full rounded-full border border-black/5 shadow-inner"
                                                    style={{ backgroundColor: color.toLowerCase() }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Selector */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Size</label>
                                        <button
                                            onClick={() => setIsSizeGuideOpen(true)}
                                            className="text-xs font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                        >
                                            Size Guide
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {product.sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`py-3 rounded-sm font-bold text-[11px] uppercase transition-all border
                                                    ${selectedSize === size
                                                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            {!isOutOfStock && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 block">Quantity</label>
                                    <div className="flex items-center w-fit border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-11 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-r-2 border-gray-200 dark:border-gray-700 transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-14 text-center font-bold text-sm text-gray-900 dark:text-white">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-12 h-11 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-l-2 border-gray-200 dark:border-gray-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {isOutOfStock ? (
                                <button className="w-full py-4 bg-gray-100 text-gray-400 rounded-sm font-bold uppercase tracking-widest cursor-allowed text-[11px]">
                                    Sold Out
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full bg-black text-white dark:bg-white dark:text-black py-4 rounded-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-900 dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-3 active:scale-[0.99] text-[11px]"
                                    >
                                        Add to Bag
                                    </button>

                                    <button
                                        onClick={handleBuyNow}
                                        className="w-full py-3.5 border border-black text-black dark:border-white dark:text-white rounded-sm font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-[11px] active:scale-[0.99]"
                                    >
                                        Buy it now
                                    </button>
                                </>
                            )}

                            {/* Wishlist — clearly visible, high contrast */}
                            <button
                                onClick={handleWishlistToggle}
                                className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-sm text-sm font-semibold tracking-wide border-2 transition-all ${inWishlist
                                    ? 'bg-red-50 border-red-400 text-red-600 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400'
                                    : 'bg-white border-gray-800 text-gray-800 hover:bg-gray-900 hover:text-white dark:bg-transparent dark:border-gray-300 dark:text-gray-200 dark:hover:bg-white dark:hover:text-black'
                                    } active:scale-[0.99]`}
                            >
                                <Heart className={`w-4 h-4 transition-colors ${inWishlist ? 'fill-current' : ''}`} />
                                {inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
                            </button>
                        </div>

                        {/* Trust Badges — no extra dead space */}
                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 shrink-0 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 dark:bg-gray-800">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-0.5 dark:text-white leading-none">Free Delivery</p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">Orders over $150</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 shrink-0 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 dark:bg-gray-800">
                                    <RotateCcw className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-0.5 dark:text-white leading-none">Easy Returns</p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">30-day policy</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Middle Section: Tabbed Experience */}
                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-center gap-12 mb-10 border-b border-gray-100 dark:border-gray-800">
                        {[
                            { id: 'description', label: 'Description' },
                            { id: 'specs', label: 'Specifications' },
                            { id: 'shipping', label: 'Shipping' },
                            { id: 'reviews', label: `Reviews (${reviews.length})` }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-4 text-[13px] font-bold uppercase tracking-widest border-b-2 transition-all
                                    ${activeTab === tab.id
                                        ? 'border-black text-black dark:border-white dark:text-white'
                                        : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="max-w-4xl mx-auto min-h-[280px]">
                        {activeTab === 'description' && (
                            <div className="py-5 space-y-5">
                                {/* Actual product description */}
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {product.description || 'No description available for this product.'}
                                </p>

                                {/* Feature chips */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {[
                                        product.gender && `${product.gender}'s Wear`,
                                        product.category,
                                        product.subcategory,
                                        product.brand,
                                        product.sizes && product.sizes.length > 0 && `Sizes: ${product.sizes.join(', ')}`,
                                    ].filter(Boolean).map((tag, i) => (
                                        <span key={i} className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                            {tag as string}
                                        </span>
                                    ))}
                                </div>

                                {/* Fashion-specific highlights grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                                    {[
                                        { icon: '✦', label: 'Fit', value: 'Regular Fit' },
                                        { icon: '⟳', label: 'Care', value: 'Machine Wash Cold' },
                                        { icon: '⬡', label: 'Material', value: 'Premium Fabric' },
                                        { icon: '◎', label: 'Origin', value: 'Imported' },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex flex-col gap-1">
                                            <span className="text-gray-400 text-xs">{item.icon} {item.label}</span>
                                            <span className="text-xs font-semibold text-gray-900 dark:text-white">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Care icons row */}
                                <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Care Instructions</span>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">🫧 Cold Wash</span>
                                        <span className="flex items-center gap-1">🚫 No Bleach</span>
                                        <span className="flex items-center gap-1">🔅 Low Heat Dry</span>
                                        <span className="flex items-center gap-1">🧺 Iron Low</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <div className="py-4">
                                {/* 2-column compact spec grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                    {[
                                        { label: 'Brand', value: product.brand },
                                        { label: 'Category', value: product.category },
                                        { label: 'Sub-Category', value: product.subcategory || '—' },
                                        { label: 'Gender', value: product.gender || 'Unisex' },
                                        { label: 'Available Sizes', value: product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') : '—' },
                                        { label: 'Colours', value: product.colors && product.colors.length > 0 ? product.colors.join(', ') : '—' },
                                        { label: 'Fit Type', value: 'Regular Fit' },
                                        { label: 'Fabric', value: 'Premium Blend' },
                                        { label: 'Care', value: 'Machine Wash Cold' },
                                        { label: 'Country of Origin', value: 'Imported' },
                                        { label: 'Season', value: 'All Season' },
                                        { label: 'SKU', value: product.id.slice(0, 12).toUpperCase() },
                                    ].map((spec, i) => (
                                        <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-800">
                                            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{spec.label}</span>
                                            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 text-right">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'shipping' && (
                            <div className="py-4 space-y-5">
                                {/* Compact shipping option cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { icon: <Truck className="w-4 h-4" />, title: 'Standard Shipping', time: '3–5 business days', cost: 'Free on orders over $150', color: 'text-green-600 dark:text-green-400' },
                                        { icon: <Package className="w-4 h-4" />, title: 'Express Delivery', time: '1–2 business days', cost: 'Calculated at checkout', color: 'text-indigo-600 dark:text-indigo-400' },
                                        { icon: <CreditCard className="w-4 h-4" />, title: 'International', time: '7–10 business days', cost: 'Duties may apply', color: 'text-gray-600 dark:text-gray-400' },
                                    ].map((opt, i) => (
                                        <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-1.5">
                                            <div className={`flex items-center gap-2 font-semibold text-xs ${opt.color}`}>
                                                {opt.icon}
                                                {opt.title}
                                            </div>
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{opt.time}</p>
                                            <p className="text-[11px] text-gray-400">{opt.cost}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Returns & conditions row */}
                                <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                    <RotateCcw className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">30-Day Returns &amp; Exchanges</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                            Items must be unworn, unwashed, and in original packaging with tags attached. Return labels provided for all domestic orders. Sale items are final sale.
                                        </p>
                                    </div>
                                </div>

                                {/* Important notes */}
                                <div className="flex items-start gap-3">
                                    <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                                        Orders placed before 2pm (Monday–Friday) are dispatched same day. Tracking information sent via email once shipped. Customs &amp; import duties are the buyer's responsibility for international orders.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="py-4 space-y-5">
                                {/* Compact rating summary */}
                                <div className="flex items-center gap-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                    <div className="text-center shrink-0">
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{averageRating.toFixed(1)}</p>
                                        <div className="flex items-center gap-0.5 justify-center mt-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} className={`w-3 h-3 ${s <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">{reviews.length} reviews</p>
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        {[5, 4, 3, 2, 1].map((r) => {
                                            const count = reviews.filter(rev => rev.rating === r).length;
                                            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                            return (
                                                <div key={r} className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 w-2">{r}</span>
                                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full dark:bg-gray-700">
                                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 w-4">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {canReview && (
                                    <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-3">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Write a Review</h3>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setNewReviewRating(s)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${s <= newReviewRating ? 'bg-yellow-50 text-yellow-400' : 'bg-gray-50 text-gray-300 dark:bg-gray-800'}`}
                                                >
                                                    <Star className={`w-4 h-4 ${s <= newReviewRating ? 'fill-current' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 dark:bg-gray-800 dark:text-white outline-none resize-none"
                                            rows={3}
                                            placeholder="Share your thoughts on fit, quality &amp; style…"
                                            value={newReviewComment}
                                            onChange={e => setNewReviewComment(e.target.value)}
                                        />
                                        <button
                                            onClick={submitReview}
                                            className="px-5 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                                        >
                                            Submit Review
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-10 text-gray-400 text-xs font-semibold">
                                            No reviews yet — be the first!
                                        </div>
                                    ) : (
                                        reviews.map((rev) => (
                                            <div key={rev.id} className="flex gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
                                                <div className="w-8 h-8 shrink-0 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                                    {rev.userName.slice(0, 2)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{rev.userName}</p>
                                                        <div className="flex text-yellow-400">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-2.5 h-2.5 ${i < rev.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-gray-400 mb-1">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{rev.comment}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* You Might Also Like */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 border-t border-gray-100 pt-12 dark:border-gray-800">
                        <div className="flex flex-col items-center mb-10 text-center">
                            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 font-display">Recommendations</span>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight font-display">You Might Also Like</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((p, i) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {
                isLightboxOpen && (
                    <div
                        className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm transition-all animate-fade-in"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <button
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <X className="w-10 h-10" />
                        </button>
                        <div
                            className="max-w-6xl w-full h-[85vh] relative flex items-center justify-center animate-scale-in"
                            onClick={e => e.stopPropagation()}
                        >
                            <img
                                src={mainImage}
                                alt={product?.name}
                                className={`w-full h-full ${product?.imageFit === 'contain' ? 'object-contain' : 'object-cover'} rounded-2xl shadow-2xl`}
                            />
                        </div>
                    </div>
                )
            }

            <SizeGuideModal
                isOpen={isSizeGuideOpen}
                onClose={() => setIsSizeGuideOpen(false)}
                category={product?.gender === 'Men' ? 'men' : product?.gender === 'Women' ? 'women' : 'unisex'}
            />
        </motion.div>
    );
};
