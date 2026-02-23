import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Order, Product } from '../../types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface DashboardChartsProps {
    orders: Order[];
    products: Product[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ orders, products }) => {
    // Weekly Sales Graph
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const weeklySalesData = {
        labels: last7Days.map(date => new Date(date).toLocaleDateString(undefined, { weekday: 'short' })),
        datasets: [
            {
                fill: true,
                label: 'Revenue',
                data: last7Days.map(date =>
                    orders
                        .filter(o => o.createdAt.startsWith(date))
                        .reduce((sum, o) => sum + o.totalPrice, 0)
                ),
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
            },
        ],
    };

    // Best Sellers (By Quantity)
    const productSales: Record<string, number> = {};
    orders.forEach(o => {
        o.items?.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        });
    });

    const bestSellers = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const bestSellersData = {
        labels: bestSellers.map(b => b[0]),
        datasets: [
            {
                label: 'Units Sold',
                data: bestSellers.map(b => b[1]),
                backgroundColor: [
                    'rgba(79, 70, 229, 0.8)',
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                ],
                borderRadius: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: false,
                },
            },
            x: {
                grid: {
                    display: false,
                }
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Weekly Revenue</h3>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase tracking-widest">7 Day Trend</span>
                </div>
                <div className="h-[300px]">
                    <Line data={weeklySalesData} options={options} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Best Sellers</h3>
                    <span className="text-xs font-black text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full uppercase tracking-widest">Top Performance</span>
                </div>
                <div className="h-[300px]">
                    <Bar data={bestSellersData} options={options} />
                </div>
            </div>
        </div>
    );
};
