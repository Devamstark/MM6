import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trophy, Gift, TrendingUp } from 'lucide-react';

export const BonusPoints = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) navigate('/login');
    }, [isAuthenticated, navigate]);

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-12 text-white shadow-2xl mb-12 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">My Bonus Points</h1>
                            <p className="text-orange-50 opacity-90">Earn points with every purchase and redeem for exclusive rewards.</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center min-w-[200px]">
                            <p className="text-sm font-bold uppercase tracking-wider opacity-80">Current Balance</p>
                            <p className="text-5xl font-bold mt-2">{user.bonusPoints || 0}</p>
                            <p className="text-xs mt-1">points</p>
                        </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-yellow-300 opacity-20 rounded-full blur-3xl"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center text-orange-600 mb-6">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">How to Earn</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold mt-0.5">1</div>
                                <p className="text-gray-600">Earn <span className="font-bold text-orange-500">1 point</span> for every $1 spent.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold mt-0.5">2</div>
                                <p className="text-gray-600">Write a review to earn <span className="font-bold text-orange-500">50 points</span>.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold mt-0.5">3</div>
                                <p className="text-gray-600">Refer a friend and get <span className="font-bold text-orange-500">500 points</span>.</p>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                            <Gift className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Rewards</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-900">$5 Off Coupon</p>
                                    <p className="text-xs text-gray-500">500 points</p>
                                </div>
                                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-400 cursor-not-allowed">Redeem</button>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-900">$10 Off Coupon</p>
                                    <p className="text-xs text-gray-500">1000 points</p>
                                </div>
                                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-400 cursor-not-allowed">Redeem</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
