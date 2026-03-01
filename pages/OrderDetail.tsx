import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Order } from '../types';
import {
    Loader2, Package, Truck, CheckCircle, XCircle, Clock,
    ArrowLeft, Calendar, MapPin, CreditCard, DollarSign,
    Download, Share2
} from 'lucide-react';

export const OrderDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await api.getOrderDetails(id);
            setOrder(data);
        } catch (e) {
            console.error('Failed to load order details', e);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'delivered': return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'shipped': return <Truck className="w-6 h-6 text-blue-600" />;
            case 'cancelled': return <XCircle className="w-6 h-6 text-red-600" />;
            default: return <Clock className="w-6 h-6 text-yellow-600" />;
        }
    };

    const getStatusStep = (status: string) => {
        const steps = ['processing', 'shipped', 'delivered'];
        const currentIndex = steps.indexOf(status);
        return currentIndex === -1 ? 0 : currentIndex + 1;
    };

    const copyOrderId = () => {
        if (order?.id) {
            navigator.clipboard.writeText(order.trackingNumber || order.id.toString());
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                <p className="text-gray-500 mb-8">The order you're looking for doesn't exist or has been removed.</p>
                <Link to="/orders" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Orders
                </Link>
            </div>
        );
    }

    const currentStep = getStatusStep(order.status);
    const steps = [
        { id: 'processing', label: 'Processing', icon: Clock },
        { id: 'shipped', label: 'Shipped', icon: Truck },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order.trackingNumber || order.id.slice(0, 8)}</h1>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" />
                            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                        <StatusIcon status={order.status} />
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <button
                        onClick={copyOrderId}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        {copySuccess ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                        {copySuccess ? 'Copied!' : 'Copy ID'}
                    </button>
                </div>
            </div>

            {/* Order Status Progress */}
            {order.status !== 'cancelled' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status</h3>
                    <div className="relative">
                        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
                        <div
                            className="absolute top-5 left-0 h-1 bg-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        ></div>
                        <div className="relative flex justify-between">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isCompleted = index < currentStep;
                                const isCurrent = index + 1 === currentStep;
                                return (
                                    <div key={step.id} className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                                                ? 'bg-indigo-600 border-indigo-600'
                                                : isCurrent
                                                    ? 'bg-white border-indigo-600'
                                                    : 'bg-white border-gray-300'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : isCurrent ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        </div>
                                        <span className={`mt-2 text-sm font-medium ${isCurrent ? 'text-indigo-600' : 'text-gray-500'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-indigo-600" />
                                Order Items
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {(order.items || []).map((item, idx) => (
                                <div key={idx} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl || 'https://placehold.co/100x100/f3f4f6/9ca3af?text=Img'}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/f3f4f6/9ca3af?text=Img';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Package className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                        <p className="text-sm text-gray-500">Unit Price: ${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="font-bold text-gray-900 text-lg">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                    Shipping Address
                                </h3>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-700 whitespace-pre-line">{order.shippingAddress}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-indigo-600" />
                                Order Summary
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${(order.totalPrice + (order.earningsApplied || 0)).toFixed(2)}</span>
                            </div>
                            {order.earningsApplied && order.earningsApplied > 0 ? (
                                <div className="flex justify-between text-indigo-600 font-medium">
                                    <span>Earnings Discount</span>
                                    <span>-${order.earningsApplied.toFixed(2)}</span>
                                </div>
                            ) : null}
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="pt-4 border-t border-gray-200 flex justify-between font-bold text-lg text-gray-900">
                                <span>Total Paid</span>
                                <span>${order.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-indigo-600" />
                                Payment Info
                            </h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Payment Method</span>
                                <span className="font-medium text-gray-900">{order.paymentMethod || 'Credit Card'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Payment Status</span>
                                <span className="font-medium text-green-600 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> Paid
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" />
                            Download Invoice
                        </button>
                        {order.status === 'processing' && (
                            <button className="w-full border border-red-300 text-red-600 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors">
                                Cancel Order
                            </button>
                        )}
                        <Link
                            to="/products"
                            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
