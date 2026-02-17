import React, { useState, useMemo } from 'react';
import { Order, Product } from '../types';
import { Calendar, BarChart3, Calculator, PieChart, TrendingUp, Percent, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';

interface AdminAnalyticsProps {
    orders: Order[];
    products: Product[];
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ orders, products }) => {
    const [activeTool, setActiveTool] = useState<'daily_report' | 'profit_dashboard' | 'calculate_profit' | 'category_analysis' | 'top_opportunities' | 'fee_calculator'>('daily_report');

    // Helper: Calculate profit for an order
    const calculateOrderProfit = (order: Order) => {
        let revenue = order.totalPrice;
        let cost = 0;

        // Match items to products to get COGS
        order.items?.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                const itemCost = (product.cogs || 0) + (product.shippingCost || 0) + (product.marketingCost || 0);
                cost += itemCost * item.quantity;
            }
        });

        // If we can't find product data, we might assume a margin or just 0 cost (which is risky, but standard for missing data)
        // Let's assume 0 cost if missing for now, but highlight it? 
        // Actually, let's just use what we have.

        return revenue - cost;
    };

    // 1. Daily Activity Summary
    const dailyReport = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const todaysOrders = orders.filter(o => o.createdAt.startsWith(today));
        const revenue = todaysOrders.reduce((sum, o) => sum + o.totalPrice, 0);
        const profit = todaysOrders.reduce((sum, o) => sum + calculateOrderProfit(o), 0);

        return {
            date: today,
            ordersCount: todaysOrders.length,
            revenue,
            profit,
            itemsSold: todaysOrders.reduce((sum, o) => sum + (o.items?.length || 0), 0)
        };
    }, [orders, products]);

    // 2. Profit Dashboard (Monthly)
    const profitDashboard = useMemo(() => {
        const monthlyData: Record<string, { revenue: number, cost: number, profit: number }> = {};

        orders.forEach(order => {
            const month = order.createdAt.slice(0, 7); // YYYY-MM
            if (!monthlyData[month]) monthlyData[month] = { revenue: 0, cost: 0, profit: 0 };

            const p = calculateOrderProfit(order);
            const c = order.totalPrice - p;

            monthlyData[month].revenue += order.totalPrice;
            monthlyData[month].cost += c;
            monthlyData[month].profit += p;
        });

        return Object.entries(monthlyData).sort((a, b) => b[0].localeCompare(a[0]));
    }, [orders, products]);

    // 4. Category Analysis
    const categoryAnalysis = useMemo(() => {
        const catStats: Record<string, { revenue: number, sales: number }> = {};

        orders.forEach(order => {
            order.items?.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    const cat = product.category || 'Uncategorized';
                    if (!catStats[cat]) catStats[cat] = { revenue: 0, sales: 0 };
                    catStats[cat].revenue += item.price * item.quantity;
                    catStats[cat].sales += item.quantity;
                }
            });
        });

        return Object.entries(catStats).sort((a, b) => b[1].revenue - a[1].revenue);
    }, [orders, products]);

    // 5. Arbitrage Opportunities (High Margin Products)
    const arbitrageOpportunities = useMemo(() => {
        return products
            .map(p => {
                const cost = (p.cogs || 0) + (p.marketingCost || 0) + (p.shippingCost || 0);
                const margin = p.price - cost;
                const marginPercent = p.price > 0 ? (margin / p.price) * 100 : 0;
                return { ...p, calculatedMargin: margin, calculatedMarginPercent: marginPercent, totalCost: cost };
            })
            .sort((a, b) => b.calculatedMargin - a.calculatedMargin)
            .slice(0, 10);
    }, [products]);

    // 6. Fee Calculator State
    const [calcState, setCalcState] = useState({ buyPrice: '', sellPrice: '', platformFeePercent: '15', shipping: '' });
    const calculatedFee = useMemo(() => {
        const buy = parseFloat(calcState.buyPrice) || 0;
        const sell = parseFloat(calcState.sellPrice) || 0;
        const fee = (parseFloat(calcState.platformFeePercent) || 0) / 100 * sell;
        const ship = parseFloat(calcState.shipping) || 0;
        const net = sell - buy - fee - ship;
        const margin = sell > 0 ? (net / sell) * 100 : 0;
        return { fee, net, margin };
    }, [calcState]);


    const renderToolContent = () => {
        switch (activeTool) {
            case 'daily_report':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-8 text-white shadow-xl">
                            <h3 className="text-2xl font-black tracking-tight mb-2">Daily Summary</h3>
                            <p className="opacity-80 font-medium">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
                                <div>
                                    <p className="text-xs uppercase tracking-widest opacity-60 font-bold mb-1">Revenue Today</p>
                                    <p className="text-3xl font-black">${dailyReport.revenue.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest opacity-60 font-bold mb-1">Net Profit</p>
                                    <p className="text-3xl font-black text-green-300">+${dailyReport.profit.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest opacity-60 font-bold mb-1">Orders</p>
                                    <p className="text-3xl font-black">{dailyReport.ordersCount}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest opacity-60 font-bold mb-1">Items Sold</p>
                                    <p className="text-3xl font-black">{dailyReport.itemsSold}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'profit_dashboard':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-black text-gray-900">Profit & Loss Statement</h3>
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Period</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Revenue</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Est. Cost</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Net Profit</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Margin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {profitDashboard.map(([period, data]) => (
                                        <tr key={period} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900">{period}</td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-600">${data.revenue.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-medium text-red-400">-${data.cost.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-bold text-green-600">+${data.profit.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                {data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0}%
                                            </td>
                                        </tr>
                                    ))}
                                    {profitDashboard.length === 0 && (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">No data available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'calculate_profit':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-black text-gray-900">Per-Order Profit Analysis</h3>
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Total</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.map(order => {
                                        const profit = calculateOrderProfit(order);
                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-indigo-600">#{order.id}</td>
                                                <td className="px-6 py-4 font-bold text-gray-900">{order.customerName}</td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-900">${order.totalPrice.toFixed(2)}</td>
                                                <td className={`px-6 py-4 text-right font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    ${profit.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'category_analysis':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-black text-gray-900">Category Performance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryAnalysis.map(([cat, data], i) => (
                                <div key={cat} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-black text-gray-900 text-lg">{cat}</h4>
                                        <span className="text-xs font-black text-gray-300">#{i + 1}</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue</p>
                                            <p className="text-2xl font-black text-indigo-600">${data.revenue.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Units Sold</p>
                                            <p className="text-xl font-bold text-gray-900">{data.sales}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'top_opportunities':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Arbitrage Opportunities</h3>
                                <p className="text-sm text-gray-500 mt-1">Top products ranked by profit margin potential.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {arbitrageOpportunities.map((p, i) => (
                                <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate">{p.name}</h4>
                                        <p className="text-xs text-gray-500 truncate">{p.brand} • {p.category}</p>
                                    </div>
                                    <div className="text-right whitespace-nowrap px-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Margin</p>
                                        <p className="text-lg font-black text-green-600">${p.calculatedMargin.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right whitespace-nowrap">
                                        <p className="text-xs font-bold text-gray-400 uppercase">ROI</p>
                                        <p className="text-lg font-black text-indigo-600">{p.calculatedMarginPercent.toFixed(0)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'fee_calculator':
                return (
                    <div className="space-y-8 animate-fade-in max-w-2xl">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Fee & Net Margin Calculator</h3>
                            <p className="text-sm text-gray-500 mt-1">Estimate profitability for potential products.</p>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Buy Price ($)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100"
                                        placeholder="0.00"
                                        value={calcState.buyPrice}
                                        onChange={e => setCalcState({ ...calcState, buyPrice: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Sell Price ($)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100"
                                        placeholder="0.00"
                                        value={calcState.sellPrice}
                                        onChange={e => setCalcState({ ...calcState, sellPrice: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Shipping Cost ($)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100"
                                        placeholder="0.00"
                                        value={calcState.shipping}
                                        onChange={e => setCalcState({ ...calcState, shipping: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Platform Fee (%)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100"
                                        value={calcState.platformFeePercent}
                                        onChange={e => setCalcState({ ...calcState, platformFeePercent: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-500">Platform Fee</span>
                                        <span className="font-bold text-gray-900">-${calculatedFee.fee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                                        <span className="text-sm font-bold text-gray-500">Total Costs</span>
                                        <span className="font-bold text-gray-900">-${((parseFloat(calcState.buyPrice) || 0) + calculatedFee.fee + (parseFloat(calcState.shipping) || 0)).toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Net Profit</p>
                                        <p className={`text-4xl font-black ${calculatedFee.net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            ${calculatedFee.net.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Margin</p>
                                        <p className={`text-2xl font-black ${calculatedFee.margin >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                                            {calculatedFee.margin.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    const tools = [
        { id: 'daily_report', label: 'Daily Activity', icon: Calendar },
        { id: 'profit_dashboard', label: 'Profit P&L', icon: BarChart3 },
        { id: 'calculate_profit', label: 'Order Profit', icon: DollarSign },
        { id: 'category_analysis', label: 'Categories', icon: PieChart },
        { id: 'top_opportunities', label: 'Arbitrage Opps', icon: TrendingUp },
        { id: 'fee_calculator', label: 'Fee Calc', icon: Calculator },
    ] as const;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-2">
                {tools.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${activeTool === tool.id
                                ? 'bg-black text-white shadow-lg shadow-gray-200 scale-105'
                                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <tool.icon className={`w-5 h-5 ${activeTool === tool.id ? 'text-white' : 'text-gray-400'}`} />
                        <span className="font-bold text-sm">{tool.label}</span>
                    </button>
                ))}
            </div>

            <div className="lg:col-span-3">
                {renderToolContent()}
            </div>
        </div>
    );
}
