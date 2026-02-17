import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
    Star, ShoppingBag, ArrowLeft, Truck, RotateCcw,
    ShieldCheck, Heart, Share2, Plus, Minus, Check,
    CreditCard, Info, MessageSquare, Package
} from 'lucide-react';
import { CountdownTimer } from '../components/CountdownTimer';
import { ProductCard } from '../components/ProductCard';

export const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
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

    const [reviews, setReviews] = useState<Review[]>([]);
    const [canReview, setCanReview] = useState(false);
    const [newReviewRating, setNewReviewRating] = useState(5);
    const [newReviewComment, setNewReviewComment] = useState('');
    const [inWishlist, setInWishlist] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await api.getProduct(id);
                if (data) {
                    setProduct(data);
                    setMainImage(data.imageUrl);
                    if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
                    if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);

                    // Fetch Related
                    const related = await api.getProducts({ category: data.category });
                    setRelatedProducts(related.filter(p => p.id !== data.id).slice(0, 4));

                    // Fetch Reviews
                    const revs = await api.getReviews(id);
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
    }, [id, user]);

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

    const allImages = [product.imageUrl, ...(product.additionalImages || [])];
    const isOutOfStock = product.stock <= 0;

    return (
        <div className="bg-white min-h-screen pb-16 pt-20 dark:bg-gray-900 transition-colors duration-300 font-body">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center text-xs font-bold text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white transition-all font-display"
                    >
                        <div className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center mr-2.5 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all dark:border-gray-800">
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </div>
                        Back
                    </button>
                    <div className="flex items-center gap-3">
                        <button className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Top Section: Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

                    {/* Left: Image Gallery (Span 7) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="aspect-[3/4] bg-gray-50 rounded-3xl overflow-hidden relative group dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <img
                                src={mainImage}
                                alt={product.name}
                                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                            />

                            {/* Zoom Indicator */}
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-black shadow-xl">Zoom</span>
                            </div>

                            {/* Flash Sale Badge Overlay */}
                            {product.flashSaleEnd && new Date(product.flashSaleEnd) > new Date() && (
                                <div className="absolute top-6 left-6">
                                    <div className="bg-red-600 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
                                        <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Flash Sale</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-2">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(img)}
                                        className={`w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 transform hover:scale-105 shadow-sm
                                            ${mainImage === img ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col pt-4">
                        {/* Brand & Category */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] bg-indigo-50 px-2.5 py-1 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400 font-display">
                                {product.brand}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-display">{product.category}</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4 dark:text-white font-display">
                            {product.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 mb-8 py-6 border-y border-gray-100 dark:border-gray-800">
                            {/* Rating */}
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(averageRating) ? 'fill-indigo-600 text-indigo-600' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-gray-900 dark:text-white font-display">{averageRating > 0 ? averageRating.toFixed(1) : 'No reviews'}</span>
                                    {reviews.length > 0 && (
                                        <span className="text-xs font-bold text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors font-display" onClick={() => setActiveTab('reviews')}>
                                            ({reviews.length} Reviews)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Trust Proof */}
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 rounded-full dark:bg-green-900/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider dark:text-green-400">1.2k+ sold recently</span>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-4 mb-6">
                            <div className="flex flex-col">
                                {product.salePrice && product.salePrice < product.price ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl font-black text-red-600 font-display">${product.salePrice.toFixed(2)}</span>
                                            <div className="bg-red-50 text-red-600 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider font-display">
                                                -{product.discountPercentage}%
                                            </div>
                                        </div>
                                        <span className="text-base text-gray-400 line-through font-medium tracking-tight mt-0.5">${product.price.toFixed(2)}</span>
                                    </>
                                ) : (
                                    <span className="text-3xl font-black text-gray-900 dark:text-white font-display">${product.price.toFixed(2)}</span>
                                )}
                            </div>
                        </div>

                        {/* Stock Management */}
                        <div className="mb-8 p-4 bg-gray-50 rounded-2xl dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-display">Status</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full font-display ${isOutOfStock ? 'bg-red-100 text-red-600' : product.stock < 10 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                    {isOutOfStock ? 'Sold Out' : product.stock < 10 ? `${product.stock} Left` : 'Available'}
                                </span>
                            </div>
                            {!isOutOfStock && product.stock < 10 && (
                                <div className="w-full h-1 bg-gray-200 rounded-full mt-2 dark:bg-gray-700 overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500 w-[30%] transition-all duration-1000"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Selection Area */}
                        <div className="space-y-8 mb-10">
                            {/* Color Selector */}
                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-display">Finish</label>
                                        <span className="text-[10px] font-bold text-gray-900 dark:text-white capitalize font-display">{selectedColor}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {product.colors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-9 h-9 rounded-xl transition-all duration-300 p-0.5 border-2 relative group
                                                    ${selectedColor === color ? 'border-indigo-600 scale-105 shadow-md' : 'border-transparent hover:border-indigo-200'}`}
                                            >
                                                <div
                                                    className="w-full h-full rounded-lg shadow-inner border border-black/5"
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
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-display">Size</label>
                                        <button className="text-[9px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-1 font-display">
                                            Size Guide
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {product.sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`py-2.5 rounded-xl font-black text-xs transition-all duration-300 border-2 font-display
                                                    ${selectedSize === size
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                                        : 'border-gray-100 hover:border-indigo-200 text-gray-400 hover:text-gray-900 dark:border-gray-800'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            {!isOutOfStock && (
                                <div className="flex items-center gap-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-display">Quantity</label>
                                    <div className="flex items-center bg-gray-50 rounded-xl p-1 gap-3 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-inner">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-gray-400 hover:text-black transition-all dark:hover:bg-gray-700"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="w-6 text-center font-black text-base font-display">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-gray-400 hover:text-black transition-all dark:hover:bg-gray-700"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 mb-8">
                            {isOutOfStock ? (
                                <button className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-[0.2em] cursor-not-allowed text-xs font-display">
                                    Sold Out
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-[3] group bg-indigo-600 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2.5 active:scale-[0.98] font-display"
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        <span className="text-xs">Add to Bag</span>
                                    </button>

                                    <button
                                        onClick={handleWishlistToggle}
                                        className={`flex-1 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 
                                            ${inWishlist ? 'border-red-100 bg-red-50 text-red-600' : 'border-gray-100 hover:border-red-100 hover:bg-red-50 text-gray-400 hover:text-red-500 dark:border-gray-800'}`}
                                    >
                                        <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            )}

                            {!isOutOfStock && (
                                <button
                                    onClick={handleBuyNow}
                                    className="w-full py-3.5 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all text-xs dark:bg-white dark:text-black dark:hover:bg-gray-100 active:scale-[0.98] shadow-lg font-display"
                                >
                                    Instant Buy
                                </button>
                            )}
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 py-8 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col items-center text-center gap-2.5">
                                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 dark:bg-gray-800">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-900 dark:text-white font-display">Free Logistic</p>
                                    <p className="text-[8px] font-bold text-gray-400 font-display">Fast Dispatch</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2.5">
                                <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 dark:bg-gray-800">
                                    <RotateCcw className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-900 dark:text-white font-display">30d Return</p>
                                    <p className="text-[8px] font-bold text-gray-400 font-display">Easy Refund</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2.5">
                                <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-green-600 dark:bg-gray-800">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-900 dark:text-white font-display">Secure Auth</p>
                                    <p className="text-[8px] font-bold text-gray-400 font-display">Guaranteed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Section: Tabbed Experience */}
                <div className="mt-20 pt-12 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-center gap-8 mb-12 border-b border-gray-100 dark:border-gray-800">
                        {[
                            { id: 'description', label: 'Overview', icon: Info },
                            { id: 'specs', label: 'Specs', icon: Package },
                            { id: 'shipping', label: 'Shipping', icon: Truck },
                            { id: 'reviews', label: `Reviews ${reviews.length > 0 ? `(${reviews.length})` : ''}`, icon: MessageSquare }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 pb-5 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all duration-300 font-display
                                    ${activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-4xl mx-auto min-h-[400px] animate-fade-in">
                        {activeTab === 'description' && (
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <h3 className="text-2xl font-black mb-8 dark:text-white">Product Overview</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-[1.8] text-lg">
                                    {product.description}
                                </p>
                                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-gray-50 p-8 rounded-3xl dark:bg-gray-800">
                                        <h4 className="font-black text-indigo-600 uppercase tracking-widest text-[10px] mb-4">Core Benefits</h4>
                                        <ul className="space-y-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 mt-0.5" /> High-performance ergonomic design</li>
                                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 mt-0.5" /> Sustainable and durable materials</li>
                                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 mt-0.5" /> Certified and tested for extreme conditions</li>
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 p-8 rounded-3xl dark:bg-gray-800">
                                        <h4 className="font-black text-purple-600 uppercase tracking-widest text-[10px] mb-4">Craftsmanship</h4>
                                        <ul className="space-y-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-purple-500 mt-0.5" /> Hand-finished details</li>
                                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-purple-500 mt-0.5" /> Precision engineered components</li>
                                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-purple-500 mt-0.5" /> Luxury aesthetic and feel</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black mb-8 dark:text-white">Technical Specifications</h3>
                                <div className="grid grid-cols-1 gap-1">
                                    {[
                                        { label: 'Brand', value: product.brand },
                                        { label: 'Category', value: product.category },
                                        { label: 'Gender', value: product.gender || 'Unisex' },
                                        { label: 'Inventory', value: `${product.stock} units` },
                                        { label: 'SKU', value: product.id.slice(0, 12).toUpperCase() }
                                    ].map((spec, i) => (
                                        <div key={i} className="flex justify-between py-4 border-b border-gray-50 dark:border-gray-800 group px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-display">{spec.label}</span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white font-display">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'shipping' && (
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <div className="flex items-center gap-6 mb-12 p-8 bg-indigo-50 rounded-[2.5rem] dark:bg-indigo-900/10">
                                    <Truck className="w-12 h-12 text-indigo-600" />
                                    <div>
                                        <h3 className="text-xl font-black text-indigo-900 dark:text-white mb-1">Priority Global Logistics</h3>
                                        <p className="text-sm font-bold text-indigo-600">Free delivery on all orders over $150</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-widest mb-6">Dispatch Times</h4>
                                        <ul className="space-y-4 text-gray-600 dark:text-gray-400 text-sm font-medium">
                                            <li>• Standard: 3-5 business days</li>
                                            <li>• Express: 1-2 business days</li>
                                            <li>• International: 7-10 business days</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-widest mb-6">Returns Policy</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relax font-medium">
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
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-sm uppercase">
                                                            {rev.userName.slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900 dark:text-white">{rev.userName}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-100 dark:text-gray-700'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic border-l-4 border-indigo-600 pl-6 py-1">
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
                    <div className="mt-24 border-t border-gray-100 pt-16 dark:border-gray-800">
                        <div className="flex flex-col items-center mb-12 text-center">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 font-display">Recommendations</span>
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
        </div>
    );
};
