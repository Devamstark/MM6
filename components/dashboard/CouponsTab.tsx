import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Ticket, Plus, Trash2, Calendar, Percent, DollarSign, Loader2 } from 'lucide-react';

export const CouponsTab: React.FC = () => {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase: '0',
        usage_limit: '',
        is_active: true
    });

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const data = await api.getCoupons();
            setCoupons(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createCoupon(newCoupon);
            setIsAdding(false);
            setNewCoupon({
                code: '',
                discount_type: 'percentage',
                discount_value: '',
                min_purchase: '0',
                usage_limit: '',
                is_active: true
            });
            loadCoupons();
        } catch (e) {
            alert('Failed to create coupon. Code might already exist.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await api.deleteCoupon(id);
                loadCoupons();
            } catch (e) {
                alert('Failed to delete coupon.');
            }
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Promo Coupons</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Manage discount codes and promotional campaigns.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
                >
                    {isAdding ? 'Cancel' : <><Plus className="w-4 h-4" /> Create Coupon</>}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-xl animate-scale-in">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coupon Code</label>
                            <input
                                required
                                type="text"
                                placeholder="E.g. SUMMER2024"
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all uppercase dark:text-white"
                                value={newCoupon.code}
                                onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Discount Type</label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                value={newCoupon.discount_type}
                                onChange={e => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ($)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Discount Value</label>
                            <div className="relative">
                                {newCoupon.discount_type === 'percentage' ?
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /> :
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                }
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={newCoupon.discount_value}
                                    onChange={e => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Min. Purchase ($)</label>
                            <input
                                type="number"
                                className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={newCoupon.min_purchase}
                                onChange={e => setNewCoupon({ ...newCoupon, min_purchase: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Usage Limit (Optional)</label>
                            <input
                                type="number"
                                placeholder="Unlimited"
                                className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={newCoupon.usage_limit}
                                onChange={e => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full bg-gray-900 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-900/20"
                            >
                                Save Coupon
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon, idx) => (
                    <div
                        key={coupon.id}
                        className="bg-white dark:bg-gray-900 p-6 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden animate-fade-up"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        {/* Decorative background element */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />

                        <div className="relative flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <button
                                onClick={() => handleDelete(coupon.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-2"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="relative space-y-4">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{coupon.code}</h3>
                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-1">
                                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `$${coupon.discount_value} OFF`}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Min. Spend</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-200">${coupon.min_purchase}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Usage</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{coupon.used_count} / {coupon.usage_limit || '∞'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-400">
                                <Calendar className="w-3 h-3" />
                                <span className="text-[10px] font-bold">Expires: {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'Never'}</span>
                            </div>
                        </div>

                        {!coupon.is_active && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-200 shadow-sm">Inactive</span>
                            </div>
                        )}
                    </div>
                ))}

                {coupons.length === 0 && !isAdding && (
                    <div className="col-span-full border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-4xl p-20 flex flex-col items-center justify-center text-center transition-colors">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 mb-6 transition-colors">
                            <Ticket className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">No active coupons</h3>
                        <p className="text-gray-400 text-sm max-w-xs mt-2 font-medium">Create your first discount code to boost sales!</p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="mt-8 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
                        >
                            + Create Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
