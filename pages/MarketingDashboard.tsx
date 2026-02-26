import React from 'react';
import { MarketingTab } from '../components/dashboard/MarketingTab';
import { Mail, Sparkles } from 'lucide-react';

export const MarketingDashboard: React.FC = () => {
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

                {/* Main Content */}
                <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
                    <MarketingTab />
                </div>
            </div>
        </div>
    );
};
