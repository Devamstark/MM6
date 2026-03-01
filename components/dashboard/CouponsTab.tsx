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
            // Clean up the data: empty strings for numeric fields should be null or omitted
            const payload = {
                ...newCoupon,
                usage_limit: newCoupon.usage_limit.trim() === '' ? null : parseInt(newCoupon.usage_limit),
                discount_value: parseFloat(newCoupon.discount_value),
                min_purchase: parseFloat(newCoupon.min_purchase || '0'),
            };

            await api.createCoupon(payload);
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
        } catch (err: any) {
            console.error('API Error:', err);
            const errorMsg = err.response?.data?.code?.[0] ||
                err.response?.data?.error ||
                (err.response?.data && typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : null) ||
                'Failed to create coupon. Code might already exist.';
            alert(errorMsg);
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

    const handleToggleActive = async (coupon: any) => {
        try {
            await api.updateCoupon(coupon.id, { is_active: !coupon.is_active });
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
        } catch (e) {
            console.error(e);
            alert('Failed to toggle coupon status.');
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

    return (
        <div className="space-y-8 animate-fade-in" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Promo Coupons</h2>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">Manage discount codes and promotional campaigns.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
                >
                    {isAdding ? 'Cancel' : <><Plus className="w-4 h-4" /> Create Coupon</>}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-xl animate-scale-in">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Coupon Code</label>
                            <input
                                required
                                type="text"
                                placeholder="E.g. SUMMER2024"
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all uppercase text-gray-900 dark:text-white"
                                value={newCoupon.code}
                                onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Discount Type</label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer text-gray-900"
                                value={newCoupon.discount_type}
                                onChange={e => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ($)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Discount Value</label>
                            <div className="relative">
                                {newCoupon.discount_type === 'percentage' ?
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /> :
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                }
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl p-4 pl-12 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900"
                                    value={newCoupon.discount_value}
                                    onChange={e => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Min. Purchase ($)</label>
                            <input
                                type="number"
                                className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900"
                                value={newCoupon.min_purchase}
                                onChange={e => setNewCoupon({ ...newCoupon, min_purchase: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Usage Limit (Optional)</label>
                            <input
                                type="number"
                                placeholder="Unlimited"
                                className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900"
                                value={newCoupon.usage_limit}
                                onChange={e => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full bg-gray-900 text-white p-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-900/20"
                            >
                                Save Coupon
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Coupon Table — like Zorvex style */}
            <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                        <thead className="bg-gray-50/60 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Discount</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Min. Spend</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Usage</th>
                                <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Active</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <Ticket className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No coupons yet.</p>
                                        <button onClick={() => setIsAdding(true)} className="mt-4 text-xs text-indigo-600 font-semibold hover:underline">+ Create First Coupon</button>
                                    </td>
                                </tr>
                            ) : coupons.map(coupon => (
                                <tr key={coupon.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800 transition-all group">
                                    {/* Code */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white tracking-wider">{coupon.code}</span>
                                    </td>
                                    {/* Discount */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                                        </span>
                                    </td>
                                    {/* Min. Spend */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">${coupon.min_purchase}</span>
                                    </td>
                                    {/* Usage */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{coupon.used_count || 0} / {coupon.usage_limit || '∞'}</span>
                                    </td>
                                    {/* Toggle Switch */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${coupon.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                            onClick={() => handleToggleActive(coupon)}
                                            title={coupon.is_active ? 'Active — Click to deactivate' : 'Inactive — Click to activate'}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${coupon.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </td>
                                    {/* Status Badge */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {coupon.is_active ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">Active</span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">Inactive</span>
                                        )}
                                    </td>
                                    {/* Actions */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="w-8 h-8 inline-flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                            title="Delete Coupon"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
