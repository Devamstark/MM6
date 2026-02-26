import React, { useState, useEffect } from 'react';
import { MarketingTab } from '../components/dashboard/MarketingTab';
import { Mail, Sparkles, Users, Send, Tag, TrendingUp, Activity, Clock } from 'lucide-react';
import { api } from '../services/api';

interface QuickStats {
    total_subscribers: number;
    emails_sent_this_month: number;
    avg_open_rate: number;
    avg_click_rate: number;
    active_coupons: number;
    revenue_from_campaigns: number;
}

interface ActivityLog {
    id: string;
    type: 'campaign_sent' | 'coupon_created' | 'subscriber_added' | 'campaign_created';
    message: string;
    timestamp: string;
}

export const MarketingDashboard: React.FC = () => {
    const [stats, setStats] = useState<QuickStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch analytics for stats
                const analytics = await api.getMarketingAnalytics();

                // Mock stats for now (can be enhanced with backend API)
                setStats({
                    total_subscribers: analytics.active_users,
                    emails_sent_this_month: analytics.total_emails_sent,
                    avg_open_rate: analytics.avg_open_rate,
                    avg_click_rate: analytics.avg_click_rate,
                    active_coupons: 0, // Would need separate API call
                    revenue_from_campaigns: 0, // Would need tracking implementation
                });

                // Mock recent activity (can be enhanced with backend activity log endpoint)
                if (analytics.last_campaign) {
                    setRecentActivity([
                        {
                            id: '1',
                            type: 'campaign_sent',
                            message: `Campaign "${analytics.last_campaign.name}" sent - ${analytics.last_campaign.emails_sent.toLocaleString()} emails`,
                            timestamp: analytics.last_campaign.sent_at || new Date().toISOString(),
                        },
                    ]);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20 transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
                {/* Header */}
                <div className="mb-10 animate-fade-up">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-[0.3em]">Enterprise Marketing</span>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
                                Marketing Command Center
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-base">
                                Create campaigns, target audiences, track deliveries, and analyze performance — all in one place.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Enterprise Edition</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Cards */}
                {!loading && stats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 animate-fade-up" style={{ animationDelay: '50ms' }}>
                        <StatCard
                            icon={<Users className="w-5 h-5" />}
                            label="Subscribers"
                            value={stats.total_subscribers.toLocaleString()}
                            color="blue"
                        />
                        <StatCard
                            icon={<Send className="w-5 h-5" />}
                            label="Emails Sent"
                            value={stats.emails_sent_this_month.toLocaleString()}
                            color="indigo"
                        />
                        <StatCard
                            icon={<TrendingUp className="w-5 h-5" />}
                            label="Avg Open Rate"
                            value={`${stats.avg_open_rate}%`}
                            color="green"
                        />
                        <StatCard
                            icon={<Activity className="w-5 h-5" />}
                            label="Avg Click Rate"
                            value={`${stats.avg_click_rate}%`}
                            color="purple"
                        />
                        <StatCard
                            icon={<Tag className="w-5 h-5" />}
                            label="Active Coupons"
                            value={stats.active_coupons.toLocaleString()}
                            color="orange"
                        />
                        <StatCard
                            icon={<TrendingUp className="w-5 h-5" />}
                            label="Revenue"
                            value={`$${stats.revenue_from_campaigns.toLocaleString()}`}
                            color="emerald"
                        />
                    </div>
                )}

                {/* Main Content */}
                <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
                    <MarketingTab />
                </div>

                {/* Recent Activity Feed */}
                {!loading && recentActivity.length > 0 && (
                    <div className="mt-8 animate-fade-up" style={{ animationDelay: '150ms' }}>
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Recent Activity
                            </h3>
                            <div className="space-y-3">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            activity.type === 'campaign_sent' ? 'bg-green-100 text-green-600' :
                                            activity.type === 'coupon_created' ? 'bg-blue-100 text-blue-600' :
                                            activity.type === 'subscriber_added' ? 'bg-purple-100 text-purple-600' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {activity.type === 'campaign_sent' ? <Send className="w-4 h-4" /> :
                                             activity.type === 'coupon_created' ? <Tag className="w-4 h-4" /> :
                                             activity.type === 'subscriber_added' ? <Users className="w-4 h-4" /> :
                                             <Mail className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{activity.message}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800',
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-800',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
    };

    return (
        <div className={`p-4 rounded-2xl border ${colorClasses[color] || colorClasses.blue}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{label}</span>
            </div>
            <p className="text-xl font-black">{value}</p>
        </div>
    );
};
