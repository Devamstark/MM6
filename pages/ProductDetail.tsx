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
                    <div className="lg:col-span-7 space-y-4 sticky top-24">
                        <div
                            className="aspect-square bg-white rounded-2xl overflow-hidden relative group dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm cursor-zoom-in"
                            onClick={() => setIsLightboxOpen(true)}
                        >
                            <img
                                src={mainImage}
                                alt={product.name}
                                className={`w-full h-full transition-transform duration-700 ${product.imageFit === 'contain' ? 'object-contain' : 'object-cover'} object-center`}
                            />

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
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(img)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 transform hover:scale-105
                                            ${mainImage === img ? 'border-indigo-600 shadow-md' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col">
                        {/* Brand & Category */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-md dark:bg-indigo-900/30 dark:text-indigo-400 font-display">
                                {product.brand}
                            </span>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] font-display">{product.category}</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-2 dark:text-white font-display">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-4">
                            {/* Rating */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5 text-yellow-500">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(averageRating) ? 'fill-current' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{averageRating > 0 ? averageRating.toFixed(1) : ''}</span>
                                {reviews.length > 0 && (
                                    <span className="text-xs font-medium text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => setActiveTab('reviews')}>
                                        ({reviews.length} Reviews)
                                    </span>
                                )}
                            </div>

                            {/* Trust Proof */}
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-md dark:bg-green-900/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider dark:text-green-400">1.2k+ sold</span>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-4 mb-8">
                            {product.salePrice && product.salePrice < product.price ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl font-bold text-red-600">${product.salePrice.toFixed(2)}</span>
                                    <span className="text-xl text-gray-400 line-through font-medium">${product.price.toFixed(2)}</span>
                                    <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                        -{product.discountPercentage}% OFF
                                    </div>
                                </div>
                            ) : (
                                <span className="text-4xl font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
                            )}
                        </div>

                        {/* Stock Management */}
                        <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                            <div className="flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full ${isOutOfStock ? 'bg-red-500' : product.stock < 10 ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                                <span className={`text-sm font-bold uppercase tracking-wider ${isOutOfStock ? 'text-red-600' : product.stock < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {isOutOfStock ? 'Sold Out' : product.stock < 10 ? `Only ${product.stock} items left!` : 'In Stock'}
                                </span>
                            </div>
                        </div>

                        {/* Selection Area */}
                        <div className="space-y-8 mb-10">
                            {/* Color Selector */}
                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest dark:text-white">Color:</label>
                                        <span className="text-xs text-gray-500 font-medium capitalize">{selectedColor}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {product.colors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-10 h-10 rounded-full transition-all duration-200 p-0.5 border-2 
                                                    ${selectedColor === color ? 'border-indigo-600 scale-110' : 'border-gray-200 hover:border-indigo-200'}`}
                                                title={color}
                                            >
                                                <div
                                                    className="w-full h-full rounded-full border border-black/5"
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
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest dark:text-white">Size:</label>
                                        <button className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
                                            Size Guide
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`min-w-[50px] px-4 py-2 rounded-md font-bold text-xs transition-all duration-200 border-2 
                                                    ${selectedSize === size
                                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                                        : 'border-gray-200 hover:border-indigo-200 text-gray-700 dark:border-gray-700 dark:text-gray-300'}`}
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
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-widest dark:text-white mb-4 block">Quantity:</label>
                                    <div className="flex items-center w-fit border border-gray-200 rounded-md overflow-hidden dark:border-gray-700">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors border-r border-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-12 text-center font-bold text-sm">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors border-l border-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 mb-8">
                            {isOutOfStock ? (
                                <button className="w-full py-4 bg-gray-100 text-gray-400 rounded-md font-bold uppercase tracking-widest cursor-not-allowed">
                                    Sold Out
                                </button>
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-[3] bg-black text-white py-4 rounded-md font-bold uppercase tracking-widest hover:bg-gray-900 transition-all flex items-center justify-center gap-3 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-gray-100"
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        <span>Add to Cart</span>
                                    </button>

                                    <button
                                        onClick={handleWishlistToggle}
                                        className={`w-14 flex items-center justify-center rounded-md border border-gray-200 transition-all duration-200 
                                            ${inWishlist ? 'bg-red-50 text-red-600 border-red-100' : 'hover:bg-gray-50 text-gray-400 dark:border-gray-700'}`}
                                    >
                                        <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            )}

                            {!isOutOfStock && (
                                <button
                                    onClick={handleBuyNow}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-md font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-lg"
                                >
                                    Buy it now
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
                    <div className="flex justify-start gap-8 mb-10 border-b border-gray-100 dark:border-gray-800">
                        {[
                            { id: 'description', label: 'Description', icon: Info },
                            { id: 'specs', label: 'Specifications', icon: Package },
                            { id: 'shipping', label: 'Shipping', icon: Truck },
                            { id: 'reviews', label: `Reviews ${reviews.length > 0 ? `(${reviews.length})` : ''}`, icon: MessageSquare }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200
                                    ${activeTab === tab.id
                                        ? 'border-black text-black dark:border-white dark:text-white'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-4xl mx-auto min-h-[400px] animate-fade-in">
                        {activeTab === 'description' && (
                            <div className="prose prose-md dark:prose-invert max-w-none">
                                <h3 className="text-xl font-bold mb-6 dark:text-white">Product Overview</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                                    {product.description}
                                </p>
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-6 rounded-xl dark:bg-gray-800">
                                        <h4 className="font-bold text-indigo-600 uppercase tracking-widest text-[10px] mb-3">Core Benefits</h4>
                                        <ul className="space-y-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" /> High-performance ergonomic design</li>
                                            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" /> Sustainable and durable materials</li>
                                            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" /> Certified and tested for extreme conditions</li>
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-xl dark:bg-gray-800">
                                        <h4 className="font-bold text-purple-600 uppercase tracking-widest text-[10px] mb-3">Craftsmanship</h4>
                                        <ul className="space-y-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-500 mt-0.5" /> Hand-finished details</li>
                                            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-500 mt-0.5" /> Precision engineered components</li>
                                            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-500 mt-0.5" /> Luxury aesthetic and feel</li>
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
                                        <div key={i} className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800 group px-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{spec.label}</span>
                                            <span className="text-xs font-medium text-gray-900 dark:text-white">{spec.value}</span>
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
