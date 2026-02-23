import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Store, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuthUser } = useAuth();

  // Toggle state for the sliding panel effect
  const [isPanelActive, setIsPanelActive] = useState(location.pathname === '/register');
  const [showPassword, setShowPassword] = useState(false);

  // Form data
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '', isSeller: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const refCode = searchParams.get('ref') || '';

  // Synchronize state with URL instant response
  useEffect(() => {
    setIsPanelActive(location.pathname === '/register');
  }, [location.pathname]);

  const handleSwitch = (toRegister: boolean) => {
    setIsPanelActive(toRegister);
    navigate(toRegister ? '/register' : '/login');
    setErrors({});
    setSuccessMessage('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    try {
      const { user, token } = await api.login(loginData.email, loginData.password);
      setAuthUser(user, token);
      setSuccessMessage('Welcome back to SmartShop!');
      setTimeout(() => {
        const from = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/');
        navigate(from, { replace: true });
      }, 800);
    } catch (err: any) {
      setErrors({ submit: err.message || 'Invalid credentials' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const role = registerData.isSeller ? 'seller' : 'user';
      const { user, token } = await api.register(registerData.name, registerData.email, registerData.password, role, refCode || undefined);
      setAuthUser(user, token);
      setSuccessMessage('Account created successfully!');
      setTimeout(() => navigate(role === 'seller' ? '/seller' : '/'), 1200);
    } catch (err: any) {
      setErrors({ submit: err.message || 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // Darker, high-contrast buttons
  const gradientBtn = "py-4 px-12 bg-linear-to-r from-[#4338ca] via-[#6d28d9] to-[#be185d] text-white font-extrabold rounded-full hover:shadow-[0_12px_24px_rgba(67,56,202,0.4)] hover:-translate-y-1 transition-all duration-300 active:scale-[0.97] disabled:opacity-70 uppercase tracking-widest text-xs shadow-xl shadow-indigo-900/20";
  const transparentBtn = "py-4 px-12 bg-transparent border-2 border-white text-white font-extrabold rounded-full hover:bg-white hover:text-indigo-900 transition-all duration-300 active:scale-[0.97] uppercase tracking-widest text-xs";

  return (
    <div className="min-h-[85vh] bg-slate-100/50 flex items-center justify-center p-6 font-body">
      {/* Darker background accents */}
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[120px] -z-10"></div>

      <div className={`auth-wrapper ${isPanelActive ? 'panel-active' : ''}`}>

        {/* SIGN UP FORM AREA */}
        <div className="auth-form-box register-form-box">
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <h1 className="text-4xl font-black text-slate-950 mb-6 font-display tracking-tight">Create Account</h1>

            <div className="w-full space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-700 transition-colors" />
                <input
                  type="text"
                  required
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="auth-input font-medium text-slate-900"
                  placeholder="Full Name"
                />
              </div>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-700 transition-colors" />
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="auth-input font-medium text-slate-900"
                  placeholder="Email Address"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-700 transition-colors" />
                <input
                  type="password"
                  required
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="auth-input font-medium text-slate-900"
                  placeholder="Password"
                />
              </div>

              <div
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${registerData.isSeller ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                onClick={() => setRegisterData({ ...registerData, isSeller: !registerData.isSeller })}
              >
                <Store className={`w-5 h-5 ${registerData.isSeller ? 'text-indigo-700' : 'text-slate-500'}`} />
                <span className="text-sm font-black text-slate-800 tracking-tight">Become a Seller</span>
                <input type="checkbox" checked={registerData.isSeller} readOnly className="ml-auto w-4 h-4 text-indigo-700 rounded-md border-slate-300" />
              </div>
            </div>

            {errors.submit && (
              <div className="mt-5 p-4 bg-red-100 text-red-700 text-sm font-black rounded-2xl flex items-center gap-3 animate-head-shake border border-red-200">
                <AlertCircle className="w-5 h-5" /> {errors.submit}
              </div>
            )}
            {successMessage && !isPanelActive && (
              <div className="mt-5 p-4 bg-emerald-100 text-emerald-800 text-sm font-black rounded-2xl flex items-center gap-3 border border-emerald-200">
                <CheckCircle className="w-5 h-5" /> {successMessage}
              </div>
            )}

            <button type="submit" disabled={isLoading} className={`${gradientBtn} mt-10`}>
              {isLoading ? 'Processing...' : 'Sign Up'}
            </button>

            <div className="mobile-only mt-8 text-sm">
              <p className="text-slate-600 font-medium">Already have an account? <button type="button" onClick={() => handleSwitch(false)} className="font-black text-indigo-700 hover:text-purple-700">Sign In</button></p>
            </div>
          </form>
        </div>

        {/* SIGN IN FORM AREA */}
        <div className="auth-form-box login-form-box">
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <h1 className="text-4xl font-black text-slate-950 mb-6 font-display tracking-tight">Sign In</h1>

            <div className="w-full space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-700 transition-colors" />
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="auth-input font-medium text-slate-900"
                  placeholder="Email Address"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-700 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="auth-input font-medium text-slate-900"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <Link to="/forgot-password" text-indigo-700 className="text-xs font-black text-slate-500 hover:text-indigo-700 transition-colors">Forgot password?</Link>
              </div>
            </div>

            {errors.submit && (
              <div className="mt-5 p-4 bg-red-100 text-red-700 text-sm font-black rounded-2xl flex items-center gap-3 animate-head-shake border border-red-200">
                <AlertCircle className="w-5 h-5" /> {errors.submit}
              </div>
            )}
            {successMessage && isPanelActive === false && (
              <div className="mt-5 p-4 bg-emerald-100 text-emerald-800 text-sm font-black rounded-2xl flex items-center gap-3 border border-emerald-200">
                <CheckCircle className="w-5 h-5" /> {successMessage}
              </div>
            )}

            <button type="submit" disabled={isLoading} className={`${gradientBtn} mt-12`}>
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="mobile-only mt-8 text-sm text-slate-600 font-medium">
              <p>Don't have an account? <button type="button" onClick={() => handleSwitch(true)} className="font-black text-indigo-700 hover:text-purple-700">Sign Up</button></p>
            </div>
          </form>
        </div>

        {/* SLIDING PANEL (DARK THEME) */}
        <div className="slide-panel-wrapper">
          <div className="slide-panel">
            {/* LEFT PANEL */}
            <div className="panel-content panel-content-left bg-linear-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca]">
              <div className="mb-10 text-center">
                <span className="text-3xl font-black text-white tracking-tightest">Smart<span className="text-indigo-400">Shop</span></span>
                <div className="h-1 w-12 bg-indigo-500 mx-auto mt-2 rounded-full"></div>
              </div>
              <h1 className="text-4xl font-black mb-6 text-white tracking-tight">Welcome Back!</h1>
              <p className="px-10 text-indigo-100/90 leading-relaxed text-[15px] font-bold mb-12">
                Sign in to rediscover a smarter way to shop, where every detail is designed around your preferences.
              </p>
              <button className={transparentBtn} onClick={() => handleSwitch(false)}>
                Sign In
              </button>
            </div>

            {/* RIGHT PANEL */}
            <div className="panel-content panel-content-right bg-linear-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca]">
              <div className="mb-10 text-center">
                <span className="text-3xl font-black text-white tracking-tightest">Smart<span className="text-indigo-400">Shop</span></span>
                <div className="h-1 w-12 bg-indigo-500 mx-auto mt-2 rounded-full"></div>
              </div>
              <h1 className="text-4xl font-black mb-6 text-white tracking-tight">Hey There!</h1>
              <p className="px-10 text-indigo-100/90 leading-relaxed text-[15px] font-bold mb-12">
                Join SmartShop today and step into a world where every product is thoughtfully curated to match your lifestyle.
              </p>
              <button className={transparentBtn} onClick={() => handleSwitch(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
                .auth-wrapper {
                    background-color: #fff;
                    border-radius: 2.5rem;
                    box-shadow: 0 40px 100px -20px rgba(15, 23, 42, 0.25);
                    position: relative;
                    overflow: hidden;
                    width: 1000px;
                    max-width: 100%;
                    min-height: 650px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .auth-form-box {
                    position: absolute;
                    top: 0;
                    height: 100%;
                    transition: all 0.7s cubic-bezier(0.7, 0, 0.3, 1);
                    width: 50%;
                }

                .login-form-box {
                    left: 0;
                    z-index: 2;
                }

                .auth-wrapper.panel-active .login-form-box {
                    transform: translateX(100%);
                    opacity: 0;
                }

                .register-form-box {
                    left: 0;
                    width: 50%;
                    opacity: 0;
                    z-index: 1;
                }

                .auth-wrapper.panel-active .register-form-box {
                    transform: translateX(100%);
                    opacity: 1;
                    z-index: 5;
                    animation: show-form 0.7s;
                }

                @keyframes show-form {
                    0%, 49.99% { opacity: 0; z-index: 1; }
                    50%, 100% { opacity: 1; z-index: 5; }
                }

                .slide-panel-wrapper {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    width: 50%;
                    height: 100%;
                    overflow: hidden;
                    transition: transform 0.7s cubic-bezier(0.7, 0, 0.3, 1);
                    z-index: 100;
                    box-shadow: 0 0 50px rgba(0,0,0,0.1);
                }

                .auth-wrapper.panel-active .slide-panel-wrapper {
                    transform: translateX(-100%);
                }

                .slide-panel {
                    color: #FFFFFF;
                    position: relative;
                    left: -100%;
                    height: 100%;
                    width: 200%;
                    transform: translateX(0);
                    transition: transform 0.7s cubic-bezier(0.7, 0, 0.3, 1);
                }

                .auth-wrapper.panel-active .slide-panel {
                    transform: translateX(50%);
                }

                .panel-content {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    padding: 0 50px;
                    text-align: center;
                    top: 0;
                    height: 100%;
                    width: 50%;
                    transform: translateX(0);
                    transition: transform 0.7s cubic-bezier(0.7, 0, 0.3, 1);
                }

                .panel-content-left {
                    transform: translateX(-20%);
                }

                .auth-wrapper.panel-active .panel-content-left {
                    transform: translateX(0);
                }

                .panel-content-right {
                    right: 0;
                    transform: translateX(0);
                }

                .auth-wrapper.panel-active .panel-content-right {
                    transform: translateX(20%);
                }

                .auth-form {
                    background-color: #FFFFFF;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    padding: 0 80px;
                    height: 100%;
                    text-align: center;
                }

                .auth-input {
                    background-color: #f1f5f9;
                    border: 2px solid transparent;
                    border-radius: 1.25rem;
                    padding: 1.1rem 1.5rem;
                    padding-left: 3.5rem;
                    width: 100%;
                    font-size: 0.95rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .auth-input:focus {
                    outline: none;
                    border-color: #4338ca;
                    background-color: #fff;
                    box-shadow: 0 0 0 6px rgba(67, 56, 202, 0.08);
                }
                
                .auth-input::placeholder {
                    color: #94a3b8;
                    font-weight: 600;
                }

                .mobile-only {
                    display: none;
                }

                @keyframes head-shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }
                .animate-head-shake { animation: head-shake 0.4s ease-in-out; }

                @media (max-width: 950px) {
                    .auth-wrapper {
                        width: 100%;
                        min-height: auto;
                        border-radius: 2rem;
                    }
                    .slide-panel-wrapper { display: none; }
                    .auth-form-box {
                        position: relative !important;
                        width: 100% !important;
                        transform: none !important;
                        opacity: 1 !important;
                        height: auto !important;
                    }
                    .register-form-box, .login-form-box {
                        display: none;
                    }
                    .auth-wrapper.panel-active .register-form-box {
                        display: block;
                        transform: none !important;
                    }
                    .auth-wrapper:not(.panel-active) .login-form-box {
                        display: block;
                        transform: none !important;
                    }
                    .auth-form {
                        padding: 80px 40px;
                    }
                    .mobile-only {
                        display: block;
                    }
                }
            `}</style>
    </div>
  );
};
