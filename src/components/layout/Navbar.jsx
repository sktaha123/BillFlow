import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PenTool, ChevronDown, LogOut, FileText, CheckCircle, Home } from 'lucide-react';
import { clsx } from 'clsx';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Signature is intentionally NOT in navLinks — it lives only in the dropdown
  const getNavLinks = () => {
    switch (role) {
      case 'FACULTY':
        return [
          { name: 'Dashboard', path: '/faculty', icon: Home },
          { name: 'My Bills', path: '/faculty/my-bills', icon: FileText },
        ];
      case 'HOD':
        return [
          { name: 'Dashboard', path: '/hod', icon: Home },
          { name: 'Pending Verification', path: '/hod/pending', icon: CheckCircle },
          { name: 'All Bills', path: '/bills', icon: FileText },
        ];
      case 'HEAD':
        return [
          { name: 'Dashboard', path: '/head', icon: Home },
          { name: 'Pending Sanctions', path: '/head/pending', icon: CheckCircle },
          { name: 'All Department Bills', path: '/bills', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();
  const homeLink = role === 'HOD' ? '/hod' : role === 'HEAD' ? '/head' : '/faculty';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/70 no-print transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to={homeLink} className="flex items-center gap-2 group">
            <span className="text-base font-bold tracking-tight text-slate-900">
              BillFlow
            </span>
          </Link>

          {/* Desktop Nav Links — no signature link here */}
          <nav className="hidden md:flex items-center gap-1.5 ml-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-slate-200 text-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200/80 hover:border-slate-300 bg-white/90 shadow-2xs transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold text-slate-800 block leading-tight truncate max-w-[120px]">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide block leading-tight">
                  {role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDropdownOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />

                <div className="absolute right-0 mt-2 w-60 bg-white backdrop-blur-md border border-slate-200/80 rounded-xl shadow-lg py-2 z-20 animate-in fade-in zoom-in-95 duration-100">

                  {/* User info header */}
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">@{user?.username || 'user'}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-semibold tracking-wider bg-slate-100 text-slate-700 rounded-full">
                      {role} • {user?.department || 'Computer Science'}
                    </span>
                  </div>

                  {/* Mobile-only nav links */}
                  <div className="md:hidden pt-1.5 pb-0.5 px-1 border-b border-slate-100">
                    <p className="px-3 py-1 text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                      Navigation
                    </p>
                    {navLinks.map((link) => {
                      const isActive = location.pathname === link.path;
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setIsDropdownOpen(false)}
                          className={clsx(
                            'w-full text-left px-3.5 py-2 text-xs font-medium rounded-xl flex items-center gap-2.5 transition-colors',
                            isActive
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          )}
                        >
                          <Icon className={clsx('w-3.5 h-3.5', isActive ? 'text-white' : 'text-slate-400')} />
                          {link.name}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Signature — single link, always in dropdown only */}
                  <div className="pt-1 px-1 border-b border-slate-100">
                    <Link
                      to="/signature-setup"
                      onClick={() => setIsDropdownOpen(false)}
                      className={clsx(
                        'w-full text-left px-3.5 py-2 text-xs font-medium rounded-xl flex items-center gap-2.5 transition-colors',
                        user?.signature_path
                          ? 'text-emerald-700 hover:bg-emerald-50'
                          : 'text-amber-700 hover:bg-amber-50'
                      )}
                    >
                      <PenTool className={clsx('w-3.5 h-3.5', user?.signature_path ? 'text-emerald-500' : 'text-amber-500')} />
                      {user?.signature_path ? 'Signature Active' : 'Setup Signature'}
                    </Link>
                  </div>

                  {/* Sign out */}
                  <div className="pt-1 px-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
