import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserPlus, Store, ArrowRight, Loader2 } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const role = isSeller ? 'seller' : 'user';
      const { user, token } = await api.register(name, email, password, role);
      login(user, token);

      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(isSeller ? '/seller' : '/');
      }
    } catch (err) {
      alert('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-3xl -z-10 animate-fade-up delay-100"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl -z-10 animate-fade-up delay-200"></div>

      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl shadow-indigo-100 animate-scale-in">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
            <UserPlus className="h-7 w-7 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h2>
          <p className="mt-3 text-base text-gray-500">
            Start your journey with SmartShop today.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200"
              placeholder="John Doe"
            />
          </div>

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
              placeholder="Create a strong password"
            />
          </div>

          <div
            className={`flex items-center p-4 rounded-2xl border cursor-pointer transition-all ${isSeller ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            onClick={() => setIsSeller(!isSeller)}
          >
            <input
              id="seller-checkbox"
              type="checkbox"
              checked={isSeller}
              onChange={(e) => setIsSeller(e.target.checked)}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="seller-checkbox" className="ml-3 block text-sm font-medium text-gray-900 flex items-center gap-2 cursor-pointer select-none">
              <Store className="w-4 h-4 text-gray-500" />
              I want to sell on SmartShop
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 mt-6"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Account'}
            {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>

          <div className="text-center mt-6">
            <Link to="/login" state={{ from: location.state?.from }} className="font-semibold text-indigo-600 hover:text-indigo-500">Already have an account? Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};