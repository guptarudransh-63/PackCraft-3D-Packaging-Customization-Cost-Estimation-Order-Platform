import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Lock, Mail, User, Building, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, error, loading } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    phone: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(formData);
    if (res.success) {
      navigate('/customizer');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-kraft-200 shadow-craft p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-900 text-kraft-300 flex items-center justify-center mx-auto shadow-md">
            <Box className="w-6 h-6 text-kraft-400" />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-charcoal-950">Create PackCraft Account</h2>
          <p className="text-xs text-charcoal-500">Access custom 3D packaging, quotation tracking and saved designs</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-charcoal-700 block mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kraft-300 font-medium focus:outline-none focus:ring-1 focus:ring-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-charcoal-700 block mb-1">Company / Brand Name</label>
            <div className="relative">
              <Building className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Luminary Goods"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kraft-300 font-medium focus:outline-none focus:ring-1 focus:ring-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-charcoal-700 block mb-1">Work Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kraft-300 font-medium focus:outline-none focus:ring-1 focus:ring-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-charcoal-700 block mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kraft-300 font-medium focus:outline-none focus:ring-1 focus:ring-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-charcoal-700 block mb-1">Password (min 6 characters) *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kraft-300 font-medium focus:outline-none focus:ring-1 focus:ring-charcoal-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-charcoal-950 text-white font-bold text-xs hover:bg-charcoal-850 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 pt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Register Business Account'}</span>
            <ArrowRight className="w-4 h-4 text-kraft-300" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-charcoal-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-charcoal-900 hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
