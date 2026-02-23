import React from 'react';
import { DollarSign, TrendingUp, Calendar, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Order, DashboardStats } from '../../types';

interface SalesOverviewProps {
    stats: DashboardStats | null;
    orders: Order[];
}

export const SalesOverview: React.FC<SalesOverviewProps> = ({ stats, orders }) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const todaySales = orders
        .filter(o => o.createdAt.startsWith(today))
        .reduce((sum, o) => sum + o.totalPrice, 0);

    const yesterdaySales = orders
        .filter(o => o.createdAt.startsWith(yesterday))
        .reduce((sum, o) => sum + o.totalPrice, 0);

    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthSales = orders
        .filter(o => o.createdAt.startsWith(thisMonth))
        .reduce((sum, o) => sum + o.totalPrice, 0);

    const cards = [
        {
            icon: <Clock className="w-6 h-6" />,
            title: "Today's Revenue",
            value: `$${todaySales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            bg: "bg-indigo-600",
            description: "Live updates"
        },
        {
            icon: <Calendar className="w-6 h-6" />,
            title: "Yesterday",
            value: `$${yesterdaySales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            bg: "bg-purple-500",
            description: "Previous close"
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: "This Month",
            value: `$${thisMonthSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            bg: "bg-blue-500",
            description: "MTD Growth"
        },
        {
            icon: <DollarSign className="w-6 h-6" />,
            title: "Total Lifetime",
            value: `$${(stats?.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            bg: "bg-emerald-600",
            description: "All-time earnings"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className={cn(
                        "p-6 rounded-[2rem] text-white flex flex-col justify-between min-h-[160px] shadow-lg transition-transform hover:-translate-y-1 duration-300",
                        card.bg
                    )}
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            {card.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{card.description}</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">{card.title}</p>
                        <p className="text-3xl font-black tracking-tight">{card.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
