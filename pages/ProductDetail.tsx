import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Star, ShoppingBag, ArrowLeft, Truck, RotateCcw, ShieldCheck, Heart, Share2 } from 'lucide-react';

export const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
    const [mainImage, setMainImage] = useState<string>('');

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
                            <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                                    <Heart className="w-5 h-5" />
                                </button>
                                <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
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
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center text-yellow-500">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                            </div>
                            <span className="text-sm text-gray-500 font-medium border-b border-gray-300 pb-0.5">1,200 reviews</span>
                        </div>

                        <div className="text-3xl font-bold text-red-600 mb-8">${product.price.toFixed(2)}</div>

                        {/* Selection */}
                        <div className="space-y-6 mb-8">
                            {product.sizes && product.sizes.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">Select Size</label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`w-12 h-12 flex items-center justify-center rounded-lg border font-bold text-sm transition-all
                                        ${selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black text-gray-900'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">Select Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.colors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-10 h-10 rounded-full border-2 transition-all relative
                                        ${selectedColor === color ? 'border-black p-0.5' : 'border-transparent'}`}
                                            >
                                                <span className="w-full h-full rounded-full block border border-gray-100 shadow-sm" style={{ backgroundColor: color.toLowerCase() }}></span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-10">
                            <button
                                onClick={() => addToCart(product)}
                                className="flex-1 bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                <ShoppingBag className="w-5 h-5" /> Add to Cart
                            </button>
                            <button className="flex-1 bg-white border border-black text-black px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-gray-50 transition-all">
                                Buy Now
                            </button>
                        </div>

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
                                    Reviews
                                </button>
                            </div>

                            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                                {activeTab === 'description' ? (
                                    <p>{product.description}</p>
                                ) : (
                                    <p>No reviews yet.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
