import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Affiliate as AffiliateType } from '../types';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CheckCircle, Copy, Check } from 'lucide-react';

const REDEEM_MINIMUM = 10;

export const Affiliate = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [affiliate, setAffiliate] = useState<AffiliateType | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [earnings, setEarnings] = useState<{ referralEarnings: number; canRedeem: boolean } | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/affiliate');
            return;
        }

        const fetchData = async () => {
            const [data, earningsData] = await Promise.all([
                api.getAffiliate(),
                api.getMyEarnings(),
            ]);
            setAffiliate(data);
            setEarnings(earningsData);
            setLoading(false);
        };
        fetchData();
    }, [isAuthenticated, navigate]);

    const handleJoinProgram = async () => {
        setGenerating(true);
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

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="min-h-[50vh] flex items-center justify-center">Loading...</div>;

    const referralLink = affiliate ? `${window.location.origin}/register?ref=${affiliate.referralCode}` : '';
    const progressPct = earnings ? Math.min((earnings.referralEarnings / REDEEM_MINIMUM) * 100, 100) : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-12 text-white shadow-2xl mb-12 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold mb-4">Affiliate Program</h1>
                        <p className="text-indigo-100 text-lg max-w-2xl">
                            Earn <strong>$1 for every new user</strong> who signs up with your referral link. Once you've earned $10 or more, apply it as a discount on your next purchase!
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>
                </div>

                {affiliate ? (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Affiliate Earnings</p>
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
                                </div>
                            </div>
                        </div>

                        {/* Earnings Redemption Card */}
                        {earnings !== null && (
                            <div className={`p-6 rounded-2xl border-2 transition-all ${earnings.canRedeem
                                    ? 'bg-emerald-50 border-emerald-300 shadow-emerald-100 shadow-lg'
                                    : 'bg-white border-gray-100 shadow-sm'
                                }`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${earnings.canRedeem ? 'bg-emerald-100' : 'bg-gray-100'
                                            }`}>
                                            <DollarSign className={`w-5 h-5 ${earnings.canRedeem ? 'text-emerald-600' : 'text-gray-400'}`} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Referral Earnings Balance</p>
                                            <p className="text-sm text-gray-500">Credited $1 per new signup via your link</p>
                                        </div>
                                    </div>
                                    <p className={`text-3xl font-bold ${earnings.canRedeem ? 'text-emerald-700' : 'text-gray-900'}`}>
                                        ${earnings.referralEarnings.toFixed(2)}
                                    </p>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>$0</span>
                                        <span className="font-semibold">$10 to unlock</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-700 ${earnings.canRedeem
                                                    ? 'bg-emerald-500'
                                                    : 'bg-indigo-500'
                                                }`}
                                            style={{ width: `${progressPct}%` }}
                                        />
                                    </div>
                                </div>

                                {earnings.canRedeem ? (
                                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Redeemable! Apply your balance as a discount at checkout.</span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        Refer <strong>{Math.ceil((REDEEM_MINIMUM - earnings.referralEarnings))}</strong> more {Math.ceil((REDEEM_MINIMUM - earnings.referralEarnings)) === 1 ? 'person' : 'people'} to unlock your balance for checkout discounts.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Share Link */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Link</h3>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    readOnly
                                    value={referralLink}
                                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-xl px-4 py-3"
                                />
                                <button
                                    onClick={() => handleCopy(referralLink)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${copied
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                >
                                    {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to start earning?</h2>
                        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                            Get <strong>$1 for every person</strong> who signs up using your referral link. Accumulate $10 and redeem it as a checkout discount.
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
