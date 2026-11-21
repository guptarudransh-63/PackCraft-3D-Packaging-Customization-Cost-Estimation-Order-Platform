import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Lock, Mail, ShieldCheck, UserCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      navigate('/customizer');
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    const res = await login(demoEmail, demoPass);
    if (res.success) {
      if (demoEmail.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/customizer');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-kraft-200 shadow-craft p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-900 text-kraft-300 flex items-center justify-center mx-auto shadow-md">
            <Box className="w-6 h-6 text-kraft-400" />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-charcoal-950">Welcome to PackCraft</h2>
          <p className="text-xs text-charcoal-500">Sign in to your packaging design and ordering account</p>
        </div>

        {/* Quick Demo Login Credentials Bar */}
        <div className="bg-kraft-50 p-3.5 rounded-2xl border border-kraft-200 space-y-2">
          <span className="text-[10px] font-mono uppercase font-bold text-kraft-800 block text-center">
            One-Click Evaluator Demo Sign-In
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('elena@luminarybotanicals.com', 'customer123')}
              className="py-2 px-3 rounded-xl bg-white border border-kraft-300 hover:border-charcoal-800 text-[11px] font-bold text-charcoal-900 transition-colors flex items-center justify-center gap-1.5 shadow-subtle"
            >
              <UserCheck className="w-3.5 h-3.5 text-kraft-600" />
              <span>Demo Customer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@packcraft.com', 'admin123')}
              className="py-2 px-3 rounded-xl bg-charcoal-900 hover:bg-charcoal-850 text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 shadow-subtle"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-kraft-400" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-charcoal-700 block mb-1">Business Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kraft-300 font-medium focus:outline-none focus:ring-1 focus:ring-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-charcoal-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kraft-300 font-medium focus:outline-none focus:ring-1 focus:ring-charcoal-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-charcoal-950 text-white font-bold text-xs hover:bg-charcoal-850 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-kraft-300" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-charcoal-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-charcoal-900 hover:underline">
            Register your business
          </Link>
        </div>
      </div>
    </div>
  );
}
