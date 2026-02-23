import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Lock, ArrowLeft, Shield, CheckCircle, Eye, EyeOff, AlertCircle, ShoppingBag } from 'lucide-react';

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

    const buttonClass = "w-full py-4 bg-linear-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white font-bold rounded-[1.25rem] hover:opacity-90 hover:-translate-y-0.5 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70";

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

                {success ? (
                    <div className="text-center animate-fade-in py-10">
                        <div className="inline-flex items-center justify-center p-5 bg-emerald-50 rounded-4xl mb-8">
                            <CheckCircle className="h-12 w-12 text-emerald-600" />
                        </div>
                        <h2 className="text-[28px] font-black text-slate-900 tracking-tight font-display mb-4">Reset Successful!</h2>
                        <p className="text-[15px] text-slate-500 leading-relaxed mb-8 px-4">
                            Your SmartShop password has been successfully updated. Redirecting to login...
                        </p>
                        <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    </div>
                ) : step === 'code' ? (
                    <div className="animate-fade-in">
                        <h1 className="text-[30px] leading-tight font-black text-slate-900 mb-2 font-display">Verify Code</h1>
                        <p className="text-slate-500 mb-10 text-[15px] leading-relaxed">
                            We've sent a 6-digit code to <span className="font-bold text-slate-800">{email}</span>.
                        </p>

                        <form className="space-y-8" onSubmit={handleVerifyCode}>
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[13px] font-medium flex items-center gap-3">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-6 text-center">Enter 6-digit code</label>
                                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                                    {verificationCode.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { inputRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold bg-white border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-[6px] focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-start gap-4">
                                <Shield className="h-5 w-5 text-slate-400 mt-1 shrink-0" />
                                <div className="text-[12px] text-slate-500 leading-normal">
                                    Code expires soon. Check your spam folder if you don't see it in your inbox.
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading || verificationCode.join('').length !== 6}
                                    className={buttonClass}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify Code'}
                                </button>

                                <Link
                                    to="/forgot-password"
                                    className="w-full py-4 px-4 border border-slate-200 text-slate-700 font-bold rounded-[1.25rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Resend Code
                                </Link>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <h1 className="text-[30px] leading-tight font-black text-slate-900 mb-2 font-display">Set New Password</h1>
                        <p className="text-slate-500 mb-8 text-[15px] leading-relaxed">
                            Create a secure password to keep your SmartShop account safe.
                        </p>

                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[13px] font-medium flex items-center gap-3">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                                </div>
                            )}

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-2 ml-1">New Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] focus:border-blue-500 focus:ring-[6px] focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300 text-[15px]"
                                            placeholder="Min 8 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-2 ml-1">Confirm Password</label>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] focus:border-blue-500 focus:ring-[6px] focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300 text-[15px]"
                                        placeholder="Repeat new password"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5">
                                <p className="text-[13px] font-bold text-slate-800 mb-2">Password tips:</p>
                                <ul className="text-[12px] text-slate-500 space-y-1 ml-4 list-disc opacity-80">
                                    <li>At least 8 characters long</li>
                                    <li>Use numbers & symbols for strength</li>
                                </ul>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`${buttonClass} mt-2`}
                            >
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
