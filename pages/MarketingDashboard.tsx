import React from 'react';
import { MarketingTab } from '../components/dashboard/MarketingTab';
import { Mail } from 'lucide-react';

export const MarketingDashboard: React.FC = () => {
    return (
        <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20 transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
                <div className="mb-12 animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-indigo-600 font-semibold text-xs uppercase tracking-[0.3em] mb-3 block">Management Portal</span>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>Marketing Dashboard</h1>
                        <p className="text-gray-600 font-normal mt-2 text-base dark:text-gray-400">Create, schedule and send promotional email campaigns.</p>
                    </div>
                </div>

                <div className="animate-fade-up delay-100">
                    <MarketingTab />
                </div>
            </div>
        </div>
    );
};
