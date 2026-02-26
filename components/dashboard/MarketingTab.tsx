import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Mail, Calendar, Send, Edit, Plus, Clock, CheckCircle } from 'lucide-react';
import { MarketingCampaign } from '../../types';

export const MarketingTab: React.FC = () => {
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<MarketingCampaign>>({
        name: '',
        subject: '',
        message: '',
        discount_code: '',
        status: 'draft',
    });
    const [sendNow, setSendNow] = useState(true);

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const data = await api.getCampaigns();
            setCampaigns(data);
        } catch (e) {
            console.error('Failed to load campaigns', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let created;
            if (formData.id) {
                created = await api.updateCampaign(formData.id, formData);
            } else {
                created = await api.createCampaign(formData);
            }
            setShowModal(false);
            setFormData({ name: '', subject: '', message: '', discount_code: '', status: 'draft' });
            loadCampaigns();
        } catch (error) {
            console.error(error);
            alert('Failed to save campaign. Check fields.');
        }
    };

    const handleSend = async (id: string, isSendNow: boolean) => {
        if (!window.confirm(`Are you sure you want to ${isSendNow ? 'send' : 'schedule'} this campaign?`)) return;
        try {
            await api.sendCampaign(id, isSendNow);
            alert('Campaign status updated successfully!');
            loadCampaigns();
        } catch (error: any) {
            console.error(error);
            alert(error?.response?.data?.error || 'Failed to send campaign');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Marketing Campaigns</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Create and manage your promotional emails.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ name: '', subject: '', message: '', discount_code: '', status: 'draft' });
                        setShowModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Campaign
                </button>
            </div>

            {loading ? (
                <div className="p-10 flex justify-center text-indigo-600"><div className="w-10 h-10 border-4 border-t-transparent animate-spin rounded-full"></div></div>
            ) : campaigns.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-4xl border border-gray-100 dark:border-gray-800">
                    <Mail className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No campaigns found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Get started by creating your first marketing campaign.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 font-black border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Campaign Name</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Scheduled Date</th>
                                    <th className="px-6 py-4">Sent To</th>
                                    <th className="px-6 py-4">Created At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                {campaigns.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold">{c.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${c.status === 'sent' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:border-green-800' :
                                                c.status === 'scheduled' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30' :
                                                    'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.scheduled_date ? new Date(c.scheduled_date).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.emails_sent} users
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {c.status === 'draft' && (
                                                <button
                                                    onClick={() => handleSend(c.id, true)}
                                                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Send className="w-3 h-3" /> Send
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">Create Campaign</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="campaignForm" onSubmit={handleSave} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Campaign Name</label>
                                    <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Subject</label>
                                    <input required type="text" value={formData.subject || ''} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Promotional Message (Text or HTML)</label>
                                    <textarea required rows={5} value={formData.message || ''} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono" placeholder="<h1>Special Offer!</h1>..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Discount Code (Optional)</label>
                                    <input type="text" value={formData.discount_code || ''} onChange={e => setFormData({ ...formData, discount_code: e.target.value })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="e.g. SUMMER25" />
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-4 mb-4">
                                        <button type="button" onClick={() => setSendNow(true)} className={`flex-1 py-3 rounded-xl border font-bold flex justify-center items-center gap-2 ${sendNow ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30' : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700'}`}>
                                            <Send className="w-4 h-4" /> Send Now
                                        </button>
                                        <button type="button" onClick={() => setSendNow(false)} className={`flex-1 py-3 rounded-xl border font-bold flex justify-center items-center gap-2 ${!sendNow ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30' : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700'}`}>
                                            <Clock className="w-4 h-4" /> Schedule Later
                                        </button>
                                    </div>
                                    {!sendNow && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Scheduled Date & Time</label>
                                            <input type="datetime-local" value={formData.scheduled_date ? new Date(formData.scheduled_date).toISOString().slice(0, 16) : ''} onChange={e => setFormData({ ...formData, scheduled_date: new Date(e.target.value).toISOString() })} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4 bg-gray-50/50 dark:bg-gray-800/50">
                            <button onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                            <button type="submit" form="campaignForm" onClick={() => {
                                // If they click save, prepare the status based on sendNow and schedule Date. This will be handled in DB mostly but we can pre-set it here if we want.
                                // Actually, it's better to just save it as draft, and then have the user click "Send" from the table.
                                // Or, we can give a UI option to "Save" vs "Send Campaign".
                                // Let's make this button save, and if sendNow is true, we trigger the handleSend after save.
                            }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                Save Campaign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
