import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Affiliate as AffiliateType } from '../types';
import { useNavigate } from 'react-router-dom';

export const Affiliate = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [affiliate, setAffiliate] = useState<AffiliateType | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/affiliate');
            return;
        }

        const fetchAffiliate = async () => {
            const data = await api.getAffiliate();
            setAffiliate(data);
            setLoading(false);
        };
        fetchAffiliate();
    }, [isAuthenticated, navigate]);

    const handleJoinProgram = async () => {
        setGenerating(true);
        // Generate a random code based on name
        const code = (user?.name || 'USER').substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
        try {
            const newAffiliate = await api.createAffiliate(code);
            setAffiliate(newAffiliate);
        } catch (error) {
            console.error('Failed to create affiliate profile', error);
            alert('Failed to join program. You might already have a profile.');
        }
        setGenerating(false);
    };

    if (loading) return <div className="min-h-[50vh] flex items-center justify-center">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-12 text-white shadow-2xl mb-12 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold mb-4">Affiliate Program</h1>
                        <p className="text-indigo-100 text-lg max-w-2xl">
                            Partner with SmartShop and earn money by sharing your favorite products. Get up to 10% commission on every sale.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>
                </div>

                {affiliate ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Earnings</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">${affiliate.earnings.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Clicks</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{affiliate.clicks}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Referral Code</p>
                            <div className="flex items-center gap-2 mt-2">
                                <code className="bg-gray-100 px-3 py-1 rounded-lg text-xl font-mono text-indigo-600 font-bold">{affiliate.referralCode}</code>
                                <button className="text-gray-400 hover:text-indigo-600">
                                    {/* Copy Icon could go here */}
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-3 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Link</h3>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/register?ref=${affiliate.referralCode}`}
                                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-xl px-4 py-3"
                                />
                                <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                                    Copy Link
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to start earning?</h2>
                        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                            Join thousands of influencers and content creators who are monetizing their audience with SmartShop.
                        </p>
                        <button
                            onClick={handleJoinProgram}
                            disabled={generating}
                            className="bg-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:scale-105"
                        >
                            {generating ? 'Creating Profile...' : 'Join Program Now'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
