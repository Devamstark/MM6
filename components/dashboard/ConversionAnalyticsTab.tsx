import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import {
    TrendingUp, DollarSign, Users, Send, ShoppingBag,
    ArrowUpRight, ArrowDownRight, Calendar, Filter, Download,
    RefreshCw, BarChart3, PieChart, Activity
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

// Register ChartJS components
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

interface CampaignConversionData {
    campaign_id: string;
    campaign_name: string;
    total_sent: number;
    total_conversions: number;
    conversion_rate: number;
    total_revenue: string;
    click_through_rate: number;
    revenue_per_email: string;
    avg_order_value: string;
    status: string;
    sent_at: string;
}

interface OverallAnalytics {
    total_campaigns: number;
    total_revenue: number;
    avg_conversion_rate: number;
    avg_click_through_rate: number;
    total_conversions: number;
    total_emails_sent: number;
}

interface TrendData {
    date: string;
    conversions: number;
    revenue: number;
    emails_sent: number;
}

export const ConversionAnalyticsTab: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState<CampaignConversionData[]>([]);
    const [overallStats, setOverallStats] = useState<OverallAnalytics | null>(null);
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all');

    const loadConversionData = useCallback(async () => {
        setLoading(true);
        try {
            // Load all campaigns and their conversion data
            const allCampaigns = await api.getCampaigns({});
            const campaignsWithConversions = await Promise.all(
                allCampaigns
                    .filter((c: any) => c.status === 'sent' || c.status === 'sending')
                    .map(async (c: any) => {
                        try {
                            const convData = await api.getCampaignConversionAnalytics(c.id);
                            return {
                                campaign_id: c.id,
                                campaign_name: c.name,
                                total_sent: convData.total_sent || 0,
                                total_conversions: convData.total_conversions || 0,
                                conversion_rate: convData.conversion_rate || 0,
                                total_revenue: convData.total_revenue || '0',
                                click_through_rate: convData.click_through_rate || 0,
                                revenue_per_email: convData.revenue_per_email || '0',
                                avg_order_value: convData.avg_order_value || '0',
                                status: c.status,
                                sent_at: c.sent_at || c.created_at,
                            };
                        } catch (e) {
                            console.error(`Failed to load conversions for campaign ${c.id}`, e);
                            return null;
                        }
                    })
            );

            const validCampaigns = campaignsWithConversions.filter(Boolean);
            setCampaigns(validCampaigns);

            // Calculate overall stats
            const totalRevenue = validCampaigns.reduce((sum, c: any) => sum + parseFloat(c.total_revenue), 0);
            const totalConversions = validCampaigns.reduce((sum, c: any) => sum + c.total_conversions, 0);
            const avgConvRate = validCampaigns.length > 0
                ? validCampaigns.reduce((sum, c: any) => sum + c.conversion_rate, 0) / validCampaigns.length
                : 0;
            const avgCTR = validCampaigns.length > 0
                ? validCampaigns.reduce((sum, c: any) => sum + c.click_through_rate, 0) / validCampaigns.length
                : 0;

            setOverallStats({
                total_campaigns: validCampaigns.length,
                total_revenue: totalRevenue,
                avg_conversion_rate: avgConvRate,
                avg_click_through_rate: avgCTR,
                total_conversions: totalConversions,
                total_emails_sent: validCampaigns.reduce((sum, c: any) => sum + c.total_sent, 0),
            });

            // Generate trend data (mock for now - can be enhanced with backend endpoint)
            const trends = generateTrendData(validCampaigns, dateRange);
            setTrendData(trends);

        } catch (error) {
            console.error('Failed to load conversion analytics', error);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        loadConversionData();
    }, [loadConversionData]);

    // Generate mock trend data based on campaigns
    const generateTrendData = (campaigns: any[], range: string): TrendData[] => {
        const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 180;
        const data: TrendData[] = [];
        const now = new Date();

        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                conversions: Math.floor(Math.random() * 20),
                revenue: Math.floor(Math.random() * 2000),
                emails_sent: Math.floor(Math.random() * 500),
            });
        }
        return data;
    };

    // Chart Data
    const trendChartData = {
        labels: trendData.map(d => d.date),
        datasets: [
            {
                label: 'Conversions',
                data: trendData.map(d => d.conversions),
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Revenue ($)',
                data: trendData.map(d => d.revenue),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const topCampaignsData = {
        labels: campaigns
            .sort((a, b) => parseFloat(b.total_revenue) - parseFloat(a.total_revenue))
            .slice(0, 5)
            .map(c => c.campaign_name.length > 20 ? c.campaign_name.substring(0, 20) + '...' : c.campaign_name),
        datasets: [{
            label: 'Revenue ($)',
            data: campaigns
                .sort((a, b) => parseFloat(b.total_revenue) - parseFloat(a.total_revenue))
                .slice(0, 5)
                .map(c => parseFloat(c.total_revenue)),
            backgroundColor: [
                'rgba(168, 85, 247, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
            ],
            borderRadius: 8,
        }],
    };

    const conversionRateDistribution = {
        labels: ['0-1%', '1-3%', '3-5%', '5-10%', '10%+'],
        datasets: [{
            label: 'Campaigns',
            data: [
                campaigns.filter((c: any) => c.conversion_rate < 1).length,
                campaigns.filter((c: any) => c.conversion_rate >= 1 && c.conversion_rate < 3).length,
                campaigns.filter((c: any) => c.conversion_rate >= 3 && c.conversion_rate < 5).length,
                campaigns.filter((c: any) => c.conversion_rate >= 5 && c.conversion_rate < 10).length,
                campaigns.filter((c: any) => c.conversion_rate >= 10).length,
            ],
            backgroundColor: [
                'rgba(239, 68, 68, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(168, 85, 247, 0.8)',
            ],
            borderWidth: 0,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent animate-spin rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                        Conversion Analytics
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Track campaign performance, revenue, and conversion metrics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                        {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dateRange === range
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {range === 'all' ? 'All Time' : range.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={loadConversionData}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Overall Stats */}
            {overallStats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard
                        icon={<BarChart3 className="w-5 h-5" />}
                        label="Total Campaigns"
                        value={overallStats.total_campaigns}
                        color="purple"
                    />
                    <StatCard
                        icon={<DollarSign className="w-5 h-5" />}
                        label="Total Revenue"
                        value={`$${overallStats.total_revenue.toLocaleString()}`}
                        color="green"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-5 h-5" />}
                        label="Avg Conversion Rate"
                        value={`${overallStats.avg_conversion_rate.toFixed(2)}%`}
                        color="blue"
                    />
                    <StatCard
                        icon={<Activity className="w-5 h-5" />}
                        label="Avg CTR"
                        value={`${overallStats.avg_click_through_rate.toFixed(2)}%`}
                        color="orange"
                    />
                    <StatCard
                        icon={<ShoppingBag className="w-5 h-5" />}
                        label="Total Conversions"
                        value={overallStats.total_conversions}
                        color="emerald"
                    />
                    <StatCard
                        icon={<Send className="w-5 h-5" />}
                        label="Emails Sent"
                        value={overallStats.total_emails_sent.toLocaleString()}
                        color="indigo"
                    />
                </div>
            )}

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion & Revenue Trend */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                            Conversion & Revenue Trend
                        </h3>
                        <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="h-64">
                        <Line data={trendChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Top Performing Campaigns */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                            Top 5 Campaigns by Revenue
                        </h3>
                        <PieChart className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="h-64">
                        <Bar data={topCampaignsData} options={{
                            ...chartOptions,
                            plugins: {
                                ...chartOptions.plugins,
                                legend: { display: false },
                            },
                        }} />
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conversion Rate Distribution */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                            Conversion Rate Distribution
                        </h3>
                        <PieChart className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="h-48">
                        <Doughnut data={conversionRateDistribution} options={{
                            ...chartOptions,
                            cutout: '60%',
                            plugins: {
                                legend: {
                                    position: 'right' as const,
                                    labels: { boxWidth: 12, font: { size: 10 } },
                                },
                            },
                        }} />
                    </div>
                </div>

                {/* Best Performers Table */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                            Campaign Performance
                        </h3>
                        <Filter className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase tracking-wider text-gray-500 font-black">
                                <tr>
                                    <th className="px-4 py-3 text-left">Campaign</th>
                                    <th className="px-4 py-3 text-center">Sent</th>
                                    <th className="px-4 py-3 text-center">Conversions</th>
                                    <th className="px-4 py-3 text-center">Conv. Rate</th>
                                    <th className="px-4 py-3 text-center">CTR</th>
                                    <th className="px-4 py-3 text-right">Revenue</th>
                                    <th className="px-4 py-3 text-right">Rev/Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {campaigns
                                    .sort((a, b) => parseFloat(b.total_revenue) - parseFloat(a.total_revenue))
                                    .map((campaign) => (
                                        <tr key={campaign.campaign_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-900 dark:text-white">{campaign.campaign_name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(campaign.sent_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                                                {campaign.total_sent.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg text-xs font-bold">
                                                    <ShoppingBag className="w-3 h-3" />
                                                    {campaign.total_conversions}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className={`font-bold ${campaign.conversion_rate >= 5
                                                            ? 'text-green-600'
                                                            : campaign.conversion_rate >= 2
                                                                ? 'text-blue-600'
                                                                : 'text-orange-600'
                                                        }`}>
                                                        {campaign.conversion_rate.toFixed(2)}%
                                                    </span>
                                                    {campaign.conversion_rate >= 5 && (
                                                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                                                {campaign.click_through_rate.toFixed(2)}%
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-black text-emerald-600">
                                                    ${parseFloat(campaign.total_revenue).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-400">
                                                    ${parseFloat(campaign.revenue_per_email).toFixed(2)}
                                                </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => {
    const colorMap: Record<string, string> = {
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800',
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-800',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
    };

    return (
        <div className={`p-4 rounded-2xl border ${colorMap[color] || colorMap.purple}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{label}</span>
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
    );
};
