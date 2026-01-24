import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Mail, ArrowLeft, Store, Shield, CheckCircle } from 'lucide-react';

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

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-100/50 rounded-full blur-3xl -z-10 animate-fade-up delay-100"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-3xl -z-10 animate-fade-up delay-200"></div>

                <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl shadow-green-100 animate-scale-in">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-green-50 rounded-3xl mb-6">
                            <CheckCircle className="h-16 w-16 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Check Your Email</h2>
                        <p className="mt-4 text-base text-gray-600 leading-relaxed">
                            We've sent a 6-digit verification code to <span className="font-semibold text-gray-900">{email}</span>
                        </p>
                        <p className="mt-3 text-sm text-gray-500">
                            Please check your email and use the code to reset your password.
                        </p>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mt-6">
                        <div className="flex items-start">
                            <Shield className="h-5 w-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="text-sm text-indigo-800">
                                <p className="font-semibold mb-1">Security Notice</p>
                                <p className="text-indigo-700">The verification code will expire in 15 minutes for your security.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4">
                        <Link
                            to="/reset-password"
                            state={{ email }}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-gray-900 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-indigo-200 hover:-translate-y-0.5"
                        >
                            Enter Verification Code
                        </Link>

                        <Link
                            to="/login"
                            className="group relative w-full flex justify-center items-center py-3.5 px-4 border-2 border-gray-200 text-sm font-bold rounded-full text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
                        >
                            <ArrowLeft className="mr-2 w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/50 rounded-full blur-3xl -z-10 animate-fade-up delay-100"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-3xl -z-10 animate-fade-up delay-200"></div>

            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl shadow-indigo-100 animate-scale-in">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4 group hover:bg-indigo-100 transition-colors">
                        <Store className="h-8 w-8 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Forgot Password?</h2>
                    <p className="mt-3 text-base text-gray-500">
                        No worries! Enter your email and we'll send you a verification code to reset your password.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center animate-fade-up">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 ml-1 mb-1">Email address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                        <div className="flex items-start">
                            <Shield className="h-5 w-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="text-sm text-indigo-800">
                                <p className="font-semibold mb-1">Multi-Factor Authentication</p>
                                <p className="text-indigo-700">We'll send a secure 6-digit code to your email for verification.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-gray-900 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-indigo-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                        </button>

                        <Link
                            to="/login"
                            className="group relative w-full flex justify-center items-center py-3.5 px-4 border-2 border-gray-200 text-sm font-bold rounded-full text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
                        >
                            <ArrowLeft className="mr-2 w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};
