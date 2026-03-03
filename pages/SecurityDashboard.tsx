import React from 'react';
import { Shield, Activity } from 'lucide-react';
import { SecurityHub } from '../components/SecurityHub';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const SecurityDashboard = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div
            className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20 transition-colors duration-300"
            style={{ fontFamily: 'Inter, sans-serif' }}
        >
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">

                {/* Header — matches AdminDashboard exactly */}
                <div className="mb-12 animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-red-600 font-semibold text-xs uppercase tracking-[0.3em] mb-3 block">
                            Security Portal
                        </span>
                        <h1
                            className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight"
                            style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
                        >
                            Security Hub
                        </h1>
                        <p className="text-gray-600 font-normal mt-2 text-base dark:text-gray-400">
                            SOC2-compliant, append-only audit trail. Read-only.
                        </p>
                    </div>

                    {/* Status badge — mirrors the "System Healthy" widget */}
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-600 shadow-inner">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">
                                Access Level
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                Admin Only
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security Hub content */}
                <SecurityHub />
            </div>
        </div>
    );
};
