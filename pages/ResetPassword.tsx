import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Lock, ArrowLeft, Store, Shield, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const ResetPassword = () => {
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'code' | 'password'>('code');

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value[0];
        }

        if (!/^\d*$/.test(value)) return;

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newCode = [...verificationCode];
        for (let i = 0; i < pastedData.length && i < 6; i++) {
            newCode[i] = pastedData[i];
        }
        setVerificationCode(newCode);

        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = verificationCode.join('');

        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            await api.verifyResetCode(email, code);
            setStep('password');
        } catch (err: any) {
            setError(err.message || 'Invalid verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const code = verificationCode.join('');
            await api.resetPassword(email, code, newPassword);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-100/50 rounded-full blur-3xl -z-10 animate-fade-up delay-100"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-3xl -z-10 animate-fade-up delay-200"></div>

                <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl shadow-green-100 animate-scale-in">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-green-50 rounded-3xl mb-6 animate-bounce-slow">
                            <CheckCircle className="h-16 w-16 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Password Reset Successful!</h2>
                        <p className="mt-4 text-base text-gray-600 leading-relaxed">
                            Your password has been successfully reset. You can now log in with your new password.
                        </p>
                        <p className="mt-3 text-sm text-gray-500">
                            Redirecting to login page...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'code') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/50 rounded-full blur-3xl -z-10 animate-fade-up delay-100"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-3xl -z-10 animate-fade-up delay-200"></div>

                <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl shadow-indigo-100 animate-scale-in">
                    <div className="text-center">
                        <Link to="/" className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4 group hover:bg-indigo-100 transition-colors">
                            <Shield className="h-8 w-8 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Enter Verification Code</h2>
                        <p className="mt-3 text-base text-gray-500">
                            We sent a 6-digit code to <span className="font-semibold text-gray-900">{email}</span>
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center animate-fade-up">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 text-center mb-4">Verification Code</label>
                            <div className="flex justify-center gap-2" onPaste={handlePaste}>
                                {verificationCode.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                            <div className="flex items-start">
                                <Shield className="h-5 w-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div className="text-sm text-indigo-800">
                                    <p className="font-semibold mb-1">Security Tip</p>
                                    <p className="text-indigo-700">This code expires in 15 minutes. Don't share it with anyone.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={isLoading || verificationCode.join('').length !== 6}
                                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-gray-900 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-indigo-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Verifying...' : 'Verify Code'}
                            </button>

                            <Link
                                to="/forgot-password"
                                className="group relative w-full flex justify-center items-center py-3.5 px-4 border-2 border-gray-200 text-sm font-bold rounded-full text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
                            >
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Resend Code
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/50 rounded-full blur-3xl -z-10 animate-fade-up delay-100"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-3xl -z-10 animate-fade-up delay-200"></div>

            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl shadow-indigo-100 animate-scale-in">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4 group hover:bg-indigo-100 transition-colors">
                        <Lock className="h-8 w-8 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Set New Password</h2>
                    <p className="mt-3 text-base text-gray-500">
                        Create a strong password for your account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center animate-fade-up">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 ml-1 mb-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full px-5 py-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                                    placeholder="Enter new password"
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 ml-1 mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full px-5 py-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                                    placeholder="Confirm new password"
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                        <p className="text-sm text-indigo-800 font-semibold mb-2">Password Requirements:</p>
                        <ul className="text-sm text-indigo-700 space-y-1 ml-4 list-disc">
                            <li>At least 8 characters long</li>
                            <li>Mix of uppercase and lowercase letters recommended</li>
                            <li>Include numbers and special characters for extra security</li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-gray-900 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-indigo-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};
