import React from 'react';
import { ShoppingBag, Loader2, Truck, CheckCircle, Package, ShieldAlert } from 'lucide-react';
import { Order } from '../../types';

interface StatusOverviewProps {
    orders: Order[];
    productsCount: number;
    lowStockCount: number;
}

export const StatusOverview: React.FC<StatusOverviewProps> = ({ orders, productsCount, lowStockCount }) => {
    const stats = [
        {
            label: "Total Orders",
            value: orders.length,
            icon: ShoppingBag,
            color: "text-orange-600",
            bg: "bg-orange-50",
            borderColor: "border-orange-100"
        },
        {
            label: "Pending",
            value: orders.filter(o => o.status === 'pending' || !o.status).length,
            icon: Loader2,
            color: "text-teal-600",
            bg: "bg-teal-50",
            borderColor: "border-teal-100"
        },
        {
            label: "Inventory",
            value: productsCount,
            icon: Package,
            color: "text-purple-600",
            bg: "bg-purple-50",
            borderColor: "border-purple-100"
        },
        {
            label: "Low Stock",
            value: lowStockCount,
            icon: ShieldAlert,
            color: "text-rose-600",
            bg: "bg-rose-50",
            borderColor: "border-rose-100",
            isAlert: lowStockCount > 0
        },
        {
            label: "Delivered",
            value: orders.filter(o => o.status === 'delivered').length,
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            borderColor: "border-emerald-100"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {stats.map((stat, idx) => (
                <div key={idx} className={`bg-white dark:bg-gray-900 p-6 rounded-4xl border ${stat.borderColor} dark:border-gray-800 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300 ${stat.isAlert ? 'ring-2 ring-rose-500 ring-offset-2' : ''}`}>
                    <div className={`w-14 h-14 shrink-0 rounded-2xl ${stat.bg} dark:bg-opacity-10 ${stat.color} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.label === 'Pending' ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
