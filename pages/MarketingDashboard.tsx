import React, { useState, useEffect } from 'react';
import { MarketingTab } from '../components/dashboard/MarketingTab';
import { Mail, Sparkles, Users, Send, Tag, TrendingUp, Activity, Clock, DollarSign } from 'lucide-react';
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

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Activity className="animate-spin text-indigo-600" /></div>;

    return (
        <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20 transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
                {/* Header - Large & Stationary */}
                <div className="bg-white dark:bg-gray-900 pt-8 pb-8 mb-10 px-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-indigo-500/5 animate-fade-up">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Mail className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-1" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
                                    Marketing Command Center
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className="text-indigo-600 dark:text-indigo-400 font-black text-[11px] uppercase tracking-[0.3em] opacity-80">Enterprise Marketing</span>
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    <span className="text-gray-400 font-black text-[11px] uppercase tracking-[0.3em]">Dashboard</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Enterprise Edition</span>
                        </div>
                    </div>

                    {/* Large Quick Stats Grid */}
                    {!loading && stats && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                                icon={<DollarSign className="w-5 h-5" />}
                                label="Total Revenue"
                                value={`$${stats.revenue_from_campaigns.toLocaleString()}`}
                                color="emerald"
                            />
                        </div>
                    )}
                </div>

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
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activity.type === 'campaign_sent' ? 'bg-green-100 text-green-600' :
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
        <div className={`p-5 rounded-2xl border ${colorClasses[color] || colorClasses.blue} transition-all hover:shadow-md group`}>
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/40 dark:bg-black/20 rounded-xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{label}</span>
            </div>
            <p className="text-2xl font-black tracking-tight">{value}</p>
        </div>
    );
};
