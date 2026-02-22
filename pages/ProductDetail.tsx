import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
    Star, ShoppingBag, ArrowLeft, Truck, RotateCcw,
    ShieldCheck, Heart, Share2, Plus, Minus, Check,
    CreditCard, Info, MessageSquare, Package, X
} from 'lucide-react';
import { CountdownTimer } from '../components/CountdownTimer';
import { ProductCard } from '../components/ProductCard';

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
                    const related = await api.getProducts({ category: data.category });
                    setRelatedProducts(related.filter(p => p.id !== data.id).slice(0, 4));

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
        <div className="bg-white min-h-screen pb-16 pt-20 dark:bg-gray-900 transition-colors duration-300 font-body">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Navigation */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-[10px] uppercase font-bold text-gray-400 hover:text-black transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3 mr-1.5" />
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
                                        className={`w-16 h-16 rounded-sm overflow-hidden border transition-all p-0.5 flex-shrink-0
                                            ${mainImage === img ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-100 hover:border-gray-300'}`}
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
                                <img
                                    src={mainImage || PLACEHOLDER_IMAGE}
                                    alt={product.name}
                                    className={`max-w-full max-h-full ${product.imageFit === 'contain' ? 'object-contain' : 'object-cover'} transition-all duration-300`}
                                    onError={handleImageError}
                                />

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
                                            className={`w-16 h-16 flex-shrink-0 rounded-sm overflow-hidden border transition-all
                                                ${mainImage === img ? 'border-orange-500' : 'border-gray-100'}`}
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
                    <div className="lg:col-span-6 flex flex-col sticky top-24 space-y-6 lg:pl-8">
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

                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100 pb-4">
                            <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}></span>
                            {isOutOfStock ? 'Out of Stock' : 'In Stock & Ready to ship'}
                        </div>

                        {/* Selection Area */}
                        <div className="space-y-6 border-b border-gray-100 pb-6">
                            {/* Color Selector */}
                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Color</label>
                                        <span className="text-[10px] text-gray-900 uppercase font-bold">{selectedColor}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {product.colors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-8 h-8 rounded-full transition-all p-0.5 border
                                                    ${selectedColor === color ? 'border-black ring-1 ring-black ring-offset-2' : 'border-gray-200 hover:border-gray-400'}`}
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
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size</label>
                                        <button className="text-[9px] font-bold text-gray-400 underline uppercase tracking-wider hover:text-black">
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
                                                        ? 'bg-black text-white border-black'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300'}`}
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
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Quantity</label>
                                    <div className="flex items-center w-fit border border-gray-200 rounded-sm overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-400 border-r border-gray-200"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-12 text-center font-bold text-xs">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-12 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-400 border-l border-gray-200"
                                        >
                                            <Plus className="w-3 h-3" />
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
                                        className="w-full bg-black text-white py-4 rounded-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-all flex items-center justify-center gap-3 active:scale-[0.99] text-[11px]"
                                    >
                                        Add to Bag
                                    </button>

                                    <button
                                        onClick={handleBuyNow}
                                        className="w-full py-3.5 border border-black text-black rounded-sm font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all text-[11px] active:scale-[0.99]"
                                    >
                                        Buy it now
                                    </button>
                                </>
                            )}

                            <button
                                onClick={handleWishlistToggle}
                                className={`w-full flex items-center justify-center gap-2 py-3 text-[10px] uppercase font-bold tracking-widest border border-gray-100 rounded-sm transition-all hover:bg-gray-50
                                    ${inWishlist ? 'text-red-600 bg-red-50/50 border-red-100' : 'text-gray-400'}`}
                            >
                                <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
                                {inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
                            </button>
                        </div>

                        {/* Trust Badges - Improved Layout */}
                        <div className="pt-8">
                            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 dark:border-gray-800">
                                <div className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 flex-shrink-0 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 dark:bg-gray-800">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-0.5 dark:text-white leading-none">Free Delivery</p>
                                        <p className="text-[9px] text-gray-400 leading-tight">Orders over $150</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 flex-shrink-0 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 dark:bg-gray-800">
                                        <RotateCcw className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-0.5 dark:text-white leading-none">Easy Returns</p>
                                        <p className="text-[9px] text-gray-400 leading-tight">30-day policy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Section: Tabbed Experience */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <div className="flex justify-center gap-12 mb-10 border-b border-gray-100">
                        {[
                            { id: 'description', label: 'Description' },
                            { id: 'specs', label: 'Specifications' },
                            { id: 'shipping', label: 'Shipping' },
                            { id: 'reviews', label: `Reviews (${reviews.length})` }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-4 text-[13px] font-bold uppercase tracking-widest border-b-[2px] transition-all
                                    ${activeTab === tab.id
                                        ? 'border-black text-black'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-4xl mx-auto min-h-[400px] animate-fade-in">
                        {activeTab === 'description' && (
                            <div className="animate-fade-in py-6">
                                <p className="text-gray-600 leading-relaxed text-lg max-w-3xl mx-auto text-center italic mb-12">
                                    "{product.description}"
                                </p>
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-8 rounded-2xl dark:bg-gray-800">
                                        <h4 className="font-bold text-indigo-600 uppercase tracking-widest text-xs mb-4">Core Benefits</h4>
                                        <ul className="space-y-4 text-base font-medium text-gray-700 dark:text-gray-300">
                                            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-green-500 mt-0.5" /> High-performance ergonomic design</li>
                                            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-green-500 mt-0.5" /> Sustainable and durable materials</li>
                                            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-green-500 mt-0.5" /> Certified and tested for extreme conditions</li>
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 p-8 rounded-2xl dark:bg-gray-800">
                                        <h4 className="font-bold text-purple-600 uppercase tracking-widest text-xs mb-4">Craftsmanship</h4>
                                        <ul className="space-y-4 text-base font-medium text-gray-700 dark:text-gray-300">
                                            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-purple-500 mt-0.5" /> Hand-finished details</li>
                                            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-purple-500 mt-0.5" /> Precision engineered components</li>
                                            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-purple-500 mt-0.5" /> Luxury aesthetic and feel</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold mb-6 dark:text-white">Technical Specifications</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { label: 'Brand', value: product.brand },
                                        { label: 'Category', value: product.category },
                                        { label: 'Gender', value: product.gender || 'Unisex' },
                                        { label: 'Inventory', value: `${product.stock} units` },
                                        { label: 'SKU', value: product.id.slice(0, 12).toUpperCase() }
                                    ].map((spec, i) => (
                                        <div key={i} className="flex justify-between py-4 border-b border-gray-100 dark:border-gray-800 group px-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{spec.label}</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'shipping' && (
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <div className="flex items-center gap-6 mb-12 p-8 bg-indigo-50 rounded-[2.5rem] dark:bg-indigo-900/10">
                                    <Truck className="w-14 h-14 text-indigo-600" />
                                    <div>
                                        <h3 className="text-2xl font-black text-indigo-900 dark:text-white mb-2">Priority Global Logistics</h3>
                                        <p className="text-base font-bold text-indigo-600">Free delivery on all orders over $150</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div>
                                        <h4 className="text-base font-black uppercase tracking-widest mb-6 border-b-2 border-indigo-100 pb-2 inline-block">Dispatch Times</h4>
                                        <ul className="space-y-4 text-gray-600 dark:text-gray-400 text-base font-medium">
                                            <li>• Standard: 3-5 business days</li>
                                            <li>• Express: 1-2 business days</li>
                                            <li>• International: 7-10 business days</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black uppercase tracking-widest mb-6 border-b-2 border-indigo-100 pb-2 inline-block">Returns Policy</h4>
                                        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                            We offer a hassle-free <strong className="font-black text-black dark:text-white">30-day return policy</strong>. Items must be returned in their original packaging and condition. Return labels are provided for all domestic orders.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-12">
                                <div className="flex flex-col md:flex-row items-center gap-12 bg-gray-50 p-10 rounded-[3rem] dark:bg-gray-800">
                                    <div className="text-center md:text-left">
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Total Score</p>
                                        <h4 className="text-7xl font-black text-gray-900 dark:text-white">{averageRating.toFixed(1)}</h4>
                                        <div className="flex items-center gap-1 justify-center md:justify-start mt-2">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} className={`w-5 h-5 ${s <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">Based on {reviews.length} reviews</p>
                                    </div>

                                    <div className="flex-1 w-full space-y-3">
                                        {[5, 4, 3, 2, 1].map((r) => {
                                            const count = reviews.filter(rev => rev.rating === r).length;
                                            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                            return (
                                                <div key={r} className="flex items-center gap-4">
                                                    <span className="text-xs font-black w-4">{r}</span>
                                                    <div className="flex-1 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                                                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-400 w-8">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {canReview && (
                                    <div className="p-10 border-2 border-dashed border-gray-100 rounded-[3rem] dark:border-gray-800">
                                        <h3 className="text-xl font-black mb-6 dark:text-white flex items-center gap-3">
                                            <div className="p-2 bg-indigo-600 text-white rounded-xl"><Plus className="w-5 h-5" /></div>
                                            Share Your Experience
                                        </h3>
                                        <div className="flex gap-4 mb-8">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setNewReviewRating(s)}
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all
                                                        ${s <= newReviewRating ? 'bg-yellow-50 text-yellow-400 scale-110 shadow-lg' : 'bg-gray-50 text-gray-300 dark:bg-gray-800'}`}
                                                >
                                                    <Star className={`w-6 h-6 ${s <= newReviewRating ? 'fill-current' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            className="w-full p-6 border border-gray-100 rounded-[2rem] mb-6 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all dark:bg-gray-800 dark:border-gray-700 outline-none font-medium"
                                            rows={5}
                                            placeholder="What did you love about this item?"
                                            value={newReviewComment}
                                            onChange={e => setNewReviewComment(e.target.value)}
                                        ></textarea>
                                        <button
                                            onClick={submitReview}
                                            className="px-12 py-5 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest transition-all hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 active:scale-95 shadow-xl"
                                        >
                                            Publish Review
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-10">
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 rounded-[3rem] dark:bg-gray-800/50">
                                            <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-400 font-bold italic tracking-wide uppercase text-[10px]">Be the first to leave a mark</p>
                                        </div>
                                    ) : (
                                        reviews.map((rev) => (
                                            <div key={rev.id} className="group p-8 border border-gray-50 rounded-[3rem] hover:border-indigo-100 hover:bg-gray-50/50 transition-all dark:border-gray-800 dark:bg-gray-800/20">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg uppercase shadow-lg shadow-indigo-100">
                                                            {rev.userName.slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-black text-gray-900 dark:text-white">{rev.userName}</p>
                                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex text-yellow-400 scale-110">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-100 dark:text-gray-700'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 text-base font-medium leading-relaxed italic border-l-4 border-indigo-600 pl-8 py-2 bg-white/50 rounded-r-lg">
                                                    "{rev.comment}"
                                                </p>
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
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm transition-all animate-fade-in"
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
            )}
        </div>
    );
};
