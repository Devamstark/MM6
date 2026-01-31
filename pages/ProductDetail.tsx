import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, ShoppingBag, ArrowLeft, Truck, RotateCcw, ShieldCheck, Heart, Share2 } from 'lucide-react';

export const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
    const [mainImage, setMainImage] = useState<string>('');

    const [reviews, setReviews] = useState<import('../types').Review[]>([]);
    const [canReview, setCanReview] = useState(false);
    const [newReviewRating, setNewReviewRating] = useState(5);
    const [newReviewComment, setNewReviewComment] = useState('');

    // Check if user bought the product
    useEffect(() => {
        const checkPurchase = async () => {
            if (user && product) {
                try {
                    const orders = await api.getRecentOrders();
                    const hasBought = orders.some(o => o.items?.some(i => i.id === product.id));
                    setCanReview(hasBought);
                } catch (e) {
                    console.error("Failed to check purchase history", e);
                }
            }
        };
        checkPurchase();
    }, [user, product]);

    // Fetch reviews
    useEffect(() => {
        const loadReviews = async () => {
            if (id) {
                const revs = await api.getReviews(id);
                setReviews(revs);
            }
        };
        loadReviews();
    }, [id, activeTab]);

    const handleBuyNow = () => {
        if (product) {
            addToCart(product);
            navigate('/checkout');
        }
    };

    const submitReview = async () => {
        if (!product || !user) return;
        if (!newReviewComment.trim()) return;

        await api.createReview(product.id, newReviewRating, newReviewComment, user);
        const revs = await api.getReviews(product.id);
        setReviews(revs);
        setNewReviewComment('');
    };

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const data = await api.getProduct(id);
                if (data) {
                    setProduct(data);
                    setMainImage(data.imageUrl);
                    if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
                    if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    const allImages = [product.imageUrl, ...(product.additionalImages || [])];

    return (
        <div className="bg-white min-h-screen pb-20 pt-24 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb / Back */}
                <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-black mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to products
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                    {/* Left: Images */}
                    <div className="space-y-6">
                        <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative group">
                            <img src={mainImage} alt={product.name} className="w-full h-full object-cover object-center" />
                            {/* Icons removed for cleaner look or keep them if preferred */}
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            const src = typeof img === 'string' ? img : URL.createObjectURL(img);
                                            setMainImage(src);
                                        }}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${mainImage === (typeof img === 'string' ? img : URL.createObjectURL(img)) ? 'border-black' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight mb-2">{product.name}</h1>

                        {/* Real Ratings */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center text-yellow-500">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(averageRating) ? 'fill-current' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 font-medium border-b border-gray-300 pb-0.5">
                                {reviews.length} reviews
                            </span>
                        </div>

                        <div className="text-3xl font-bold text-red-600 mb-8">${product.price.toFixed(2)}</div>

                        {/* Selection */}
                        <div className="space-y-6 mb-8">
                            {product.sizes && product.sizes.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">Select Size</label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.sizes.map(size => {
                                            // Check stock for this size if color is selected
                                            const disabled = selectedColor && product.variants && product.variants.length > 0
                                                ? (product.variants.find(v => v.size === size && v.color === selectedColor)?.stock || 0) <= 0
                                                : false;

                                            return (
                                                <button
                                                    key={size}
                                                    onClick={() => !disabled && setSelectedSize(size)}
                                                    disabled={disabled}
                                                    className={`w-12 h-12 flex items-center justify-center rounded-lg border font-bold text-sm transition-all
                                        ${selectedSize === size ? 'border-black bg-black text-white' :
                                                            disabled ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-gray-200 hover:border-black text-gray-900'}`}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">Select Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.colors.map(color => {
                                            // Check stock for this color if size is selected
                                            const disabled = selectedSize && product.variants && product.variants.length > 0
                                                ? (product.variants.find(v => v.color === color && v.size === selectedSize)?.stock || 0) <= 0
                                                : false;

                                            return (
                                                <button
                                                    key={color}
                                                    onClick={() => !disabled && setSelectedColor(color)}
                                                    disabled={disabled}
                                                    className={`w-10 h-10 rounded-full border-2 transition-all relative
                                        ${selectedColor === color ? 'border-black p-0.5' :
                                                            disabled ? 'border-gray-100 opacity-50 cursor-not-allowed' : 'border-transparent'}`}
                                                >
                                                    <span className="w-full h-full rounded-full block border border-gray-100 shadow-sm" style={{ backgroundColor: color.toLowerCase() }}></span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stock Status */}
                        {(() => {
                            const variant = product.variants?.find(v => v.size === selectedSize && v.color === selectedColor);
                            const currentStock = variant ? variant.stock : product.stock;
                            const isOutOfStock = currentStock <= 0;

                            return (
                                <div className="mb-8">
                                    <div className={`text-sm font-bold mb-4 ${isOutOfStock ? 'text-red-500' : currentStock < 5 ? 'text-orange-500' : 'text-green-600'}`}>
                                        {isOutOfStock ? 'Out of Stock' : currentStock < 5 ? `Only ${currentStock} left in stock!` : 'In Stock'}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-4">
                                        {isOutOfStock ? (
                                            <button
                                                onClick={() => alert("Restock request sent! We'll notify you when available.")}
                                                className="flex-1 bg-gray-200 text-gray-900 px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Heart className="w-5 h-5" /> Join Waitlist
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="flex-1 bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <ShoppingBag className="w-5 h-5" /> Add to Cart
                                                </button>
                                                <button
                                                    onClick={handleBuyNow}
                                                    className="flex-1 bg-white border border-black text-black px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-gray-50 transition-all font-bold">
                                                    Buy Now
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })()}

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-8 mb-10">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-900">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wide">Fast Delivery</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-900">
                                    <RotateCcw className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wide">Free Returns</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-900">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wide">Genuine Product</span>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-t border-gray-100 pt-10">
                            <div className="flex gap-8 mb-6 border-b border-gray-100 pb-1">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`text-sm font-bold uppercase tracking-widest pb-4 border-b-2 transition-colors ${activeTab === 'description' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Description
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`text-sm font-bold uppercase tracking-widest pb-4 border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Reviews ({reviews.length})
                                </button>
                            </div>

                            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                                {activeTab === 'description' ? (
                                    <p>{product.description}</p>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Review Form */}
                                        {canReview ? (
                                            <div className="bg-gray-50 p-6 rounded-xl mb-8">
                                                <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                                                <div className="flex gap-2 mb-4">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <button key={s} onClick={() => setNewReviewRating(s)}>
                                                            <Star className={`w-6 h-6 ${s <= newReviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    className="w-full p-4 border border-gray-200 rounded-lg mb-4"
                                                    rows={4}
                                                    placeholder="How was your experience?"
                                                    value={newReviewComment}
                                                    onChange={e => setNewReviewComment(e.target.value)}
                                                ></textarea>
                                                <button
                                                    onClick={submitReview}
                                                    className="px-6 py-2 bg-black text-white rounded-lg font-bold uppercase text-sm"
                                                >
                                                    Submit Review
                                                </button>
                                            </div>
                                        ) : (
                                            !user ? (
                                                <div className="p-4 bg-gray-50 rounded-lg text-sm">Please login to write a review.</div>
                                            ) : (
                                                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500 italic">Only verified buyers can write reviews.</div>
                                            )
                                        )}

                                        {/* Reviews List */}
                                        {reviews.length === 0 ? (
                                            <p className="text-gray-400 italic">No reviews yet.</p>
                                        ) : (
                                            reviews.map((rev) => (
                                                <div key={rev.id} className="border-b border-gray-100 pb-6">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-gray-900">{rev.userName}</span>
                                                        <span className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex text-yellow-400 mb-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                                                        ))}
                                                    </div>
                                                    <p className="text-gray-700">{rev.comment}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
