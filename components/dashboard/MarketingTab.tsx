import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { Mail, Calendar, Send, Plus, Clock, CheckCircle, Users, BarChart3, ChevronDown, Copy, Pause, Play, Trash2, Eye, X, AlertCircle, TrendingUp, Target, Zap, Search, Filter } from 'lucide-react';
import { MarketingCampaign, MarketingAnalytics, AudiencePreview, EmailDeliveryLog } from '../../types';

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    scheduled: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    sending: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    sent: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    paused: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    failed: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
};

const AUDIENCE_LABELS: Record<string, string> = {
    all_users: 'All Users',
    ordered_once: 'Ordered At Least Once',
    never_ordered: 'Never Ordered',
    recent_signups: 'Recent Signups',
    abandoned_cart: 'Abandoned Cart',
    manual: 'Manual Selection',
};

const TYPE_LABELS: Record<string, string> = {
    promotional: 'Promotional',
    abandoned_cart: 'Abandoned Cart',
    re_engagement: 'Re-engagement',
    thank_you: 'Thank You',
    upsell: 'Post-purchase Upsell',
};

export const MarketingTab: React.FC = () => {
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [analytics, setAnalytics] = useState<MarketingAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
    const [logs, setLogs] = useState<{ logs: EmailDeliveryLog[]; summary: Record<string, number>; total: number } | null>(null);
    const [logsLoading, setLogsLoading] = useState(false);
    const [audiencePreview, setAudiencePreview] = useState<AudiencePreview | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [activeView, setActiveView] = useState<'campaigns' | 'analytics'>('campaigns');
    const [sendNow, setSendNow] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<MarketingCampaign>>({
        name: '', subject: '', preheader: '', message: '', plain_text: '',
        banner_image_url: '', cta_text: '', cta_url: '', discount_code: '',
        status: 'draft', campaign_type: 'promotional', audience_type: 'all_users',
        audience_days: 30, manual_user_ids: [], batch_size: 200,
    });

    const loadCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (statusFilter) params.status = statusFilter;
            if (typeFilter) params.campaign_type = typeFilter;
            const data = await api.getCampaigns(params);
            setCampaigns(data);
        } catch (e) {
            console.error('Failed to load campaigns', e);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, typeFilter]);

    const loadAnalytics = useCallback(async () => {
        try {
            const data = await api.getMarketingAnalytics();
            setAnalytics(data);
        } catch (e) {
            console.error('Failed to load analytics', e);
        }
    }, []);

    useEffect(() => { loadCampaigns(); loadAnalytics(); }, [loadCampaigns, loadAnalytics]);

    const handleSave = async () => {
        if (!formData.name?.trim() || !formData.subject?.trim() || !formData.message?.trim()) {
            alert('Please fill out all required fields: Name, Subject, and Message.');
            return;
        }
        setSaving(true);
        try {
            const dataToSave = { ...formData };
            if (!sendNow && dataToSave.scheduled_date) {
                dataToSave.status = 'scheduled';
            } else {
                dataToSave.status = 'draft';
            }

            let created;
            if (dataToSave.id) {
                created = await api.updateCampaign(dataToSave.id, dataToSave);
            } else {
                created = await api.createCampaign(dataToSave);
            }

            if (sendNow && created?.id) {
                await api.sendCampaign(created.id, true);
                alert('Campaign saved and sending initiated!');
            } else if (!sendNow && dataToSave.scheduled_date && created?.id) {
                try { await api.sendCampaign(created.id, false); } catch (e) { /* schedule fallback */ }
                alert('Campaign saved and scheduled!');
            } else {
                alert('Campaign saved as draft!');
            }

            setShowModal(false);
            resetForm();
            loadCampaigns();
            loadAnalytics();
        } catch (error: any) {
            console.error(error);
            alert(error?.response?.data?.message || error?.response?.data?.detail || error?.response?.data?.error || 'Failed to save campaign.');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', subject: '', preheader: '', message: '', plain_text: '',
            banner_image_url: '', cta_text: '', cta_url: '', discount_code: '',
            status: 'draft', campaign_type: 'promotional', audience_type: 'all_users',
            audience_days: 30, manual_user_ids: [], batch_size: 200,
        });
        setSendNow(true);
        setAudiencePreview(null);
    };

    const handleSend = async (id: string, isSendNow: boolean) => {
        if (!window.confirm(`Are you sure you want to ${isSendNow ? 'send' : 'schedule'} this campaign?`)) return;
        try {
            await api.sendCampaign(id, isSendNow);
            alert('Campaign status updated!');
            loadCampaigns();
            loadAnalytics();
        } catch (error: any) {
            alert(error?.response?.data?.error || 'Failed to send campaign');
        }
    };

    const handlePause = async (id: string) => {
        try {
            await api.pauseCampaign(id);
            loadCampaigns();
        } catch (error: any) {
            alert(error?.response?.data?.error || 'Failed to pause');
        }
    };

    const handleResume = async (id: string) => {
        try {
            await api.resumeCampaign(id);
            loadCampaigns();
        } catch (error: any) {
            alert(error?.response?.data?.error || 'Failed to resume');
        }
    };

    const handleDuplicate = async (id: string) => {
        try {
            await api.duplicateCampaign(id);
            loadCampaigns();
            alert('Campaign duplicated!');
        } catch (error: any) {
            alert(error?.response?.data?.error || 'Failed to duplicate');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this campaign?')) return;
        try {
            await api.deleteCampaign(id);
            loadCampaigns();
            loadAnalytics();
        } catch (error: any) {
            alert('Failed to delete campaign');
        }
    };

    const handleViewLogs = async (campaign: MarketingCampaign) => {
        setSelectedCampaign(campaign);
        setShowLogsModal(true);
        setLogsLoading(true);
        try {
            const data = await api.getCampaignLogs(campaign.id);
            setLogs(data);
        } catch (e) {
            console.error('Failed to load logs', e);
        } finally {
            setLogsLoading(false);
        }
    };

    const handlePreviewAudience = async (type: string, days?: number) => {
        try {
            const data = await api.getAudiencePreview(type, days);
            setAudiencePreview(data);
        } catch (e) {
            console.error('Failed to preview audience', e);
            setAudiencePreview(null);
        }
    };

    const handleEditCampaign = (c: MarketingCampaign) => {
        setFormData({ ...c });
        setShowModal(true);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Analytics Summary Cards */}
            {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<Mail className="w-5 h-5" />} label="Total Campaigns" value={analytics.total_campaigns} color="indigo" />
                    <StatCard icon={<Send className="w-5 h-5" />} label="Emails Sent" value={analytics.total_emails_sent.toLocaleString()} color="green" />
                    <StatCard icon={<Users className="w-5 h-5" />} label="Active Users" value={analytics.active_users.toLocaleString()} color="blue" />
                    <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Avg Delivery Rate" value={`${analytics.avg_delivery_rate}%`} color="emerald" />
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-2">
                    <button onClick={() => setActiveView('campaigns')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'campaigns' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                        Campaigns
                    </button>
                    <button onClick={() => setActiveView('analytics')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                        <BarChart3 className="w-4 h-4 inline mr-1" /> Analytics
                    </button>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> New Campaign
                </button>
            </div>

            {/* Analytics View */}
            {activeView === 'analytics' && analytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Campaign Status</h4>
                        <div className="space-y-3">
                            {Object.entries(analytics.status_breakdown).map(([s, count]) => (
                                <div key={s} className="flex justify-between items-center">
                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${STATUS_COLORS[s] || ''}`}>{s}</span>
                                    <span className="text-xl font-black text-gray-900 dark:text-white">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Campaign Types</h4>
                        <div className="space-y-3">
                            {Object.entries(analytics.type_breakdown).map(([t, count]) => (
                                <div key={t} className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">{TYPE_LABELS[t] || t}</span>
                                    <span className="text-xl font-black text-gray-900 dark:text-white">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Performance</h4>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Delivery Rate</span>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(analytics.avg_delivery_rate, 100)}%` }}></div>
                                    </div>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{analytics.avg_delivery_rate}%</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Open Rate</span>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(analytics.avg_open_rate, 100)}%` }}></div>
                                    </div>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{analytics.avg_open_rate}%</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Click Rate</span>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(analytics.avg_click_rate, 100)}%` }}></div>
                                    </div>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{analytics.avg_click_rate}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {analytics.last_campaign && (
                        <div className="md:col-span-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800 p-6">
                            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Last Campaign</h4>
                            <p className="text-lg font-black text-gray-900 dark:text-white">{analytics.last_campaign.name}</p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${STATUS_COLORS[analytics.last_campaign.status] || ''}`}>{analytics.last_campaign.status}</span>
                                <span>{analytics.last_campaign.emails_sent} emails sent</span>
                                {analytics.last_campaign.sent_at && <span>Sent {new Date(analytics.last_campaign.sent_at).toLocaleDateString()}</span>}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Campaign List View */}
            {activeView === 'campaigns' && (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <Filter className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Filters:</span>
                        </div>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500/20">
                            <option value="">All Status</option>
                            {['draft', 'scheduled', 'sending', 'sent', 'paused', 'failed'].map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500/20">
                            <option value="">All Types</option>
                            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>

                    {loading ? (
                        <div className="p-10 flex justify-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full"></div></div>
                    ) : campaigns.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <Mail className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No campaigns found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Get started by creating your first marketing campaign.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase tracking-wider text-gray-500 font-black border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-4">Campaign</th>
                                            <th className="px-4 py-4">Type</th>
                                            <th className="px-4 py-4">Audience</th>
                                            <th className="px-4 py-4">Status</th>
                                            <th className="px-4 py-4">Recipients</th>
                                            <th className="px-4 py-4">Sent</th>
                                            <th className="px-4 py-4">Delivery %</th>
                                            <th className="px-4 py-4">Date</th>
                                            <th className="px-4 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                                        {campaigns.map(c => (
                                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 dark:text-white">{c.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.subject}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 capitalize">{TYPE_LABELS[c.campaign_type] || c.campaign_type}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{AUDIENCE_LABELS[c.audience_type] || c.audience_type}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${STATUS_COLORS[c.status] || ''}`}>{c.status}</span>
                                                </td>
                                                <td className="px-4 py-4 font-bold">{c.total_recipients.toLocaleString()}</td>
                                                <td className="px-4 py-4 font-bold">{c.emails_sent.toLocaleString()}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-12 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                                                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(c.delivery_rate, 100)}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-bold">{c.delivery_rate}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400">
                                                    {c.sent_at ? new Date(c.sent_at).toLocaleDateString() : c.scheduled_date ? `Sched: ${new Date(c.scheduled_date).toLocaleDateString()}` : new Date(c.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-end gap-1">
                                                        {c.status === 'draft' && (
                                                            <button onClick={() => handleSend(c.id, true)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all" title="Send Now">
                                                                <Send className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        {c.status === 'sending' && (
                                                            <button onClick={() => handlePause(c.id)} className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-all" title="Pause">
                                                                <Pause className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        {c.status === 'paused' && (
                                                            <button onClick={() => handleResume(c.id)} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all" title="Resume">
                                                                <Play className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        {(c.status === 'sent' || c.status === 'sending') && (
                                                            <button onClick={() => handleViewLogs(c)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all" title="View Logs">
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleDuplicate(c.id)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all" title="Duplicate">
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                        {c.status === 'draft' && (
                                                            <button onClick={() => handleEditCampaign(c)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all" title="Edit">
                                                                <Target className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all" title="Delete">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Campaign Creation/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formData.id ? 'Edit Campaign' : 'Create Campaign'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Campaign Name <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" placeholder="Summer Sale Blast" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Campaign Type</label>
                                    <select value={formData.campaign_type || 'promotional'} onChange={e => setFormData({ ...formData, campaign_type: e.target.value as any })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 text-sm">
                                        {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Email Subject <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.subject || ''} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 text-sm" placeholder="🎉 Exclusive 50% Off..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Preheader Text</label>
                                    <input type="text" value={formData.preheader || ''} onChange={e => setFormData({ ...formData, preheader: e.target.value })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 text-sm" placeholder="Preview text shown in inbox" />
                                </div>
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">HTML Content <span className="text-red-500">*</span></label>
                                <textarea rows={6} value={formData.message || ''} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 font-mono text-sm" placeholder="<h1>Big Sale!</h1><p>Shop now...</p>"></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Plain Text Fallback</label>
                                <textarea rows={3} value={formData.plain_text || ''} onChange={e => setFormData({ ...formData, plain_text: e.target.value })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 text-sm" placeholder="Text version for email clients that don't support HTML"></textarea>
                            </div>

                            {/* CTA & Extras */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Banner Image URL</label>
                                    <input type="url" value={formData.banner_image_url || ''} onChange={e => setFormData({ ...formData, banner_image_url: e.target.value })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20" placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">CTA Button Text</label>
                                    <input type="text" value={formData.cta_text || ''} onChange={e => setFormData({ ...formData, cta_text: e.target.value })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20" placeholder="Shop Now" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">CTA Button URL</label>
                                    <input type="url" value={formData.cta_url || ''} onChange={e => setFormData({ ...formData, cta_url: e.target.value })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20" placeholder="https://smartshop.com/sale" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Discount Code</label>
                                    <input type="text" value={formData.discount_code || ''} onChange={e => setFormData({ ...formData, discount_code: e.target.value })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20" placeholder="SUMMER25" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Batch Size</label>
                                    <input type="number" value={formData.batch_size || 200} onChange={e => setFormData({ ...formData, batch_size: parseInt(e.target.value) || 200 })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20" />
                                </div>
                            </div>

                            {/* Audience Targeting */}
                            <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Target className="w-4 h-4" /> Audience Targeting</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
                                        <select value={formData.audience_type || 'all_users'} onChange={e => {
                                            const val = e.target.value as any;
                                            setFormData({ ...formData, audience_type: val });
                                            handlePreviewAudience(val, formData.audience_days);
                                        }} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20">
                                            {Object.entries(AUDIENCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    {formData.audience_type === 'recent_signups' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Registered Within (Days)</label>
                                            <input type="number" value={formData.audience_days || 30} onChange={e => {
                                                const days = parseInt(e.target.value) || 30;
                                                setFormData({ ...formData, audience_days: days });
                                                handlePreviewAudience(formData.audience_type || 'recent_signups', days);
                                            }} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20" />
                                        </div>
                                    )}
                                </div>
                                {audiencePreview && (
                                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-indigo-600" />
                                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{audiencePreview.count} users</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">will receive this campaign</span>
                                        </div>
                                        {audiencePreview.sample.length > 0 && (
                                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                Sample: {audiencePreview.sample.map(u => u.email).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Scheduling */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4 mb-4">
                                    <button type="button" onClick={() => setSendNow(true)} className={`flex-1 py-3 rounded-xl border font-bold flex justify-center items-center gap-2 transition-all ${sendNow ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700' : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700'}`}>
                                        <Zap className="w-4 h-4" /> Send Now
                                    </button>
                                    <button type="button" onClick={() => setSendNow(false)} className={`flex-1 py-3 rounded-xl border font-bold flex justify-center items-center gap-2 transition-all ${!sendNow ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700' : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700'}`}>
                                        <Clock className="w-4 h-4" /> Schedule Later
                                    </button>
                                </div>
                                {!sendNow && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Scheduled Date & Time</label>
                                        <input type="datetime-local" value={formData.scheduled_date && !isNaN(new Date(formData.scheduled_date).getTime()) ? new Date(formData.scheduled_date).toISOString().slice(0, 16) : ''} onChange={e => setFormData({ ...formData, scheduled_date: e.target.value ? new Date(e.target.value).toISOString() : '' })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
                            <button onClick={() => { handleSave(); }} disabled={saving} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50" >
                                {saving ? 'Saving...' : 'Save as Draft'}
                            </button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50">
                                {saving ? 'Processing...' : sendNow ? '🚀 Save & Send' : '📅 Save & Schedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Logs Modal */}
            {showLogsModal && selectedCampaign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Delivery Logs</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedCampaign.name}</p>
                            </div>
                            <button onClick={() => { setShowLogsModal(false); setSelectedCampaign(null); setLogs(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {logsLoading ? (
                                <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full"></div></div>
                            ) : logs ? (
                                <>
                                    {/* Summary Badges */}
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        {Object.entries(logs.summary).map(([s, count]) => (
                                            <div key={s} className={`px-4 py-2 rounded-xl border text-sm font-bold ${STATUS_COLORS[s] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                {s}: {count}
                                            </div>
                                        ))}
                                        <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400">
                                            Total: {logs.total}
                                        </div>
                                    </div>
                                    {/* Logs Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase tracking-wider text-gray-500 font-black">
                                                <tr>
                                                    <th className="px-4 py-3">User</th>
                                                    <th className="px-4 py-3">Email</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Sent At</th>
                                                    <th className="px-4 py-3">Retries</th>
                                                    <th className="px-4 py-3">Error</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {logs.logs.map(log => (
                                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{log.user_name}</td>
                                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{log.email}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${STATUS_COLORS[log.status] || ''}`}>{log.status}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}</td>
                                                        <td className="px-4 py-3">{log.retry_count}</td>
                                                        <td className="px-4 py-3 text-red-500 text-xs max-w-[200px] truncate">{log.error_message || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-10">No logs available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => {
    const colorMap: Record<string, string> = {
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.indigo} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{value}</p>
                </div>
            </div>
        </div>
    );
};
