import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Lock, ArrowRight, Store } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { user, token } = await api.login(email, password);
      login(user, token);

      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
          <p className="mt-3 text-base text-gray-500">
            Don't have an account? <Link to="/register" state={{ from: location.state?.from }} className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">Sign up for free</Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center animate-fade-up">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 ml-1 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 ml-1 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-gray-900 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-indigo-200 hover:-translate-y-0.5"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
            {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>

          <div className="text-center text-xs text-gray-400 mt-6 pt-6 border-t border-gray-100">
            <p>Demo Admin: admin@smartshop.com / admin</p>
            <p className="mt-1">Demo User: user@smartshop.com / password</p>
          </div>
        </form>
      </div>
    </div>
  );
};