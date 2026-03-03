import React from 'react';
import { Shield } from 'lucide-react';
import { SecurityHub } from '../components/SecurityHub';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const SecurityDashboard = () => {
    const { user, isAuthenticated } = useAuth();

    // Guard: only admin or is_security_staff
    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            {/* Page Header Banner */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 flex items-center justify-center shrink-0">
                            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-[0.3em] mb-0.5">
                                Restricted Access
                            </p>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                Security Dashboard
                            </h1>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                                SOC2-compliant audit trail · Separate from business operations
                            </p>
                        </div>
                        <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Live Monitoring</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SecurityHub />
            </div>
        </div>
    );
};
