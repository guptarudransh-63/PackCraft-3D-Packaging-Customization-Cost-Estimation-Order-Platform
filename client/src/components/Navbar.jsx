import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Box, Layers, ShieldCheck, FileText, ShoppingBag, LogOut, Menu, X, Sparkles, User, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#faf7f2]/90 backdrop-blur-md border-b border-kraft-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-charcoal-900 text-kraft-300 flex items-center justify-center shadow-md group-hover:bg-charcoal-800 transition-colors">
            <Box className="w-5 h-5 text-kraft-400 group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-2xl tracking-tight text-charcoal-950">PackCraft</span>
              <span className="text-[10px] font-mono uppercase bg-kraft-200/80 text-kraft-900 px-1.5 py-0.5 rounded font-semibold tracking-wider">
                3D Studio
              </span>
            </div>
            <p className="text-[11px] text-charcoal-500 font-mono tracking-wider uppercase -mt-0.5">
              Engineered Custom Packaging
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/catalogue"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/catalogue')
                ? 'bg-kraft-200 text-charcoal-950 font-semibold'
                : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-kraft-100'
            }`}
          >
            Packaging Catalogue
          </Link>
          <Link
            to="/customizer"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/customizer')
                ? 'bg-kraft-200 text-charcoal-950 font-semibold'
                : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-kraft-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-kraft-600" />
            3D Customizer
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/designs"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/designs')
                    ? 'bg-kraft-200 text-charcoal-950 font-semibold'
                    : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-kraft-100'
                }`}
              >
                Saved Designs
              </Link>
              <Link
                to="/quotations"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/quotations')
                    ? 'bg-kraft-200 text-charcoal-950 font-semibold'
                    : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-kraft-100'
                }`}
              >
                Quotations
              </Link>
              <Link
                to="/orders"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/orders')
                    ? 'bg-kraft-200 text-charcoal-950 font-semibold'
                    : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-kraft-100'
                }`}
              >
                Orders
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-charcoal-900 text-kraft-300 hover:bg-charcoal-800 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Admin Console
                </Link>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-kraft-100 border border-kraft-200">
                <div className="w-7 h-7 rounded-full bg-kraft-300 text-charcoal-900 flex items-center justify-center font-bold text-xs">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-charcoal-900 leading-tight truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-[10px] text-charcoal-500 uppercase tracking-wider">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                title="Sign out"
                className="p-2 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-kraft-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-charcoal-700 hover:text-charcoal-950 px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/customizer"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-charcoal-950 text-white hover:bg-charcoal-850 shadow-sm transition-all flex items-center gap-2"
              >
                <span>Start Customizing</span>
                <Sparkles className="w-3.5 h-3.5 text-kraft-400" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-charcoal-700 hover:bg-kraft-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-kraft-200 bg-[#faf7f2] px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/catalogue"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-charcoal-900 hover:bg-kraft-100"
          >
            Packaging Catalogue
          </Link>
          <Link
            to="/customizer"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-charcoal-900 hover:bg-kraft-100"
          >
            3D Customizer
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/designs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-charcoal-900 hover:bg-kraft-100"
              >
                Saved Designs
              </Link>
              <Link
                to="/quotations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-charcoal-900 hover:bg-kraft-100"
              >
                Quotations
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-charcoal-900 hover:bg-kraft-100"
              >
                Orders
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-charcoal-900 bg-kraft-200"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-base text-red-600 hover:bg-red-50 rounded-lg"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-kraft-200 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-xl text-sm font-semibold border border-kraft-300 text-charcoal-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-xl text-sm font-semibold bg-charcoal-950 text-white"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
