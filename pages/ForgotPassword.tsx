import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Mail, ArrowLeft, Shield, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await api.requestPasswordReset(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const buttonClass = "w-full py-4 bg-linear-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white font-bold rounded-[1.25rem] hover:opacity-90 hover:-translate-y-0.5 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70";

    if (success) {
        return (
            <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden font-body">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/40 rounded-full blur-[120px] -z-10 animate-pulse"></div>

                <div className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(30,41,59,0.08)] border border-slate-100/80 p-10 sm:p-14 text-center animate-fade-in">
                    <div className="inline-flex items-center justify-center p-5 bg-emerald-50 rounded-4xl mb-8">
                        <CheckCircle className="h-12 w-12 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display mb-4">Check Your Email</h2>
                    <p className="text-[15px] text-slate-500 leading-relaxed mb-8">
                        We've sent a secure verification code to <span className="font-bold text-slate-900">{email}</span>. Please use it to restore your SmartShop access.
                    </p>

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-8 text-left flex items-start gap-4">
                        <Shield className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[13px] font-bold text-slate-800 mb-1">Security Notice</p>
                            <p className="text-[12px] text-slate-500 leading-normal">This code will expire in 15 minutes for your protection.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Link
                            to="/reset-password"
                            state={{ email }}
                            className={buttonClass}
                        >
                            Enter Verification Code
                        </Link>

                        <Link
                            to="/login"
                            className="w-full py-4 px-4 border border-slate-200 text-slate-700 font-bold rounded-[1.25rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden font-body">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/40 rounded-full blur-[120px] -z-10 animate-pulse"></div>

            <div className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(30,41,59,0.08)] border border-slate-100/80 p-10 sm:p-14 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-10 group cursor-default">
                    <div className="w-11 h-11 bg-linear-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/15 group-hover:rotate-6 transition-transform duration-500">
                        <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 font-display">SmartShop</span>
                </div>

                <h1 className="text-[30px] leading-tight font-black text-slate-900 mb-2 font-display">Password Recovery</h1>
                <p className="text-slate-500 mb-10 text-[15px] leading-relaxed">
                    No worries! Enter your email and we'll send you a verification code to restore account access.
                </p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[13px] font-medium flex items-center gap-3 animate-fade-up">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] focus:border-blue-500 focus:ring-[6px] focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300 text-[15px]"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-5 flex items-start gap-4">
                        <Shield className="h-5 w-5 text-indigo-700 mt-1 shrink-0" />
                        <div className="text-[13px] text-indigo-800">
                            <p className="font-bold mb-1 leading-none">Secure Verification</p>
                            <p className="text-indigo-700 leading-normal opacity-80">We'll send a one-time 6-digit code to verify your identity.</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={buttonClass}
                        >
                            {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                        </button>

                        <Link
                            to="/login"
                            className="w-full py-4 px-4 border border-slate-200 text-slate-700 font-bold rounded-[1.25rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};
