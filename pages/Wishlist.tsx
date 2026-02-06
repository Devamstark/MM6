import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { Loader2, Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Wishlist = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            const data = await api.getWishlist();
            setProducts(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId: string) => {
        await api.toggleWishlist(productId);
        loadWishlist();
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="bg-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 font-serif">My Wishlist</h1>

                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8">Save items you love to your wishlist.</p>
                        <Link to="/products" className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="group relative">
                                <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-100 relative">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 space-y-2">
                                        <button
                                            onClick={() => handleRemove(product.id)}
                                            className="bg-white p-2 rounded-full shadow-lg text-red-500 hover:bg-gray-100 transition-colors"
                                        >
                                            <Heart className="w-5 h-5 fill-current" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">
                                            <Link to={`/product/${product.id}`}>
                                                <span aria-hidden="true" className="absolute inset-0" />
                                                {product.name}
                                            </Link>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">${product.price}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addToCart(product);
                                    }}
                                    className="mt-4 w-full bg-black text-white py-3 rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 relative z-10"
                                >
                                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
