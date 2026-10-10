import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PenTool, ChevronDown, LogOut, FileText, CheckCircle, Home, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  // Close drawer when route changes
  useEffect(() => {
    setIsDrawerOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Trap focus inside drawer / close on Escape
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isDrawerOpen]);

  // Signature is intentionally NOT in navLinks — it lives only in the dropdown
  const getNavLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin', icon: Home },
        ];
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
  const homeLink = role === 'ADMIN' ? '/admin' : role === 'HOD' ? '/hod' : role === 'HEAD' ? '/head' : '/faculty';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/70 no-print transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Brand + Desktop Nav */}
          <div className="flex items-center gap-6">
            <Link to={homeLink} className="flex items-center gap-2 group">
              <span className="text-base font-bold tracking-tight text-slate-900">
                BillFlow
              </span>
            </Link>

            {/* Desktop Nav Links */}
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
                        ? 'text-black'
                        : 'text-slate-500 hover:text-slate-900'
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">

            {/* Mobile Hamburger — visible only on small screens */}
            <button
              aria-label="Open navigation menu"
              aria-expanded={isDrawerOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* User Profile Dropdown — desktop & mobile */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-2xs transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-semibold text-slate-800 block leading-tight truncate max-w-[120px]">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium tracking-wide block leading-tight">
                    {role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {isDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />

                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">

                    {/* User info header */}
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">@{user?.username || 'user'}</p>
                      <span className="inline-block mt-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {role}
                      </span>
                    </div>

                    {/* Signature — single link, always in dropdown only (not for ADMIN) */}
                    {role !== 'ADMIN' && (
                      <div className="py-0.5 border-b border-slate-100 mb-1">
                        <Link
                          to="/signature-setup"
                          onClick={() => setIsDropdownOpen(false)}
                          className={clsx(
                            'w-full text-left px-3 py-2 text-xs font-medium rounded-xl flex items-center gap-2.5 transition-colors hover:bg-slate-50',
                            user?.signature_path
                              ? 'text-slate-700'
                              : 'text-amber-700'
                          )}
                        >
                          <PenTool className={clsx('w-3.5 h-3.5', user?.signature_path ? 'text-emerald-600' : 'text-amber-500')} />
                          {user?.signature_path ? 'Signature Active' : 'Setup Signature'}
                        </Link>
                      </div>
                    )}

                    {/* Sign out */}
                    <div className="py-0.5">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
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

      {/* ─── Mobile Navigation Drawer ─────────────────────────────────────── */}

      {/* Backdrop overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm md:hidden transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <nav
        id="mobile-nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={clsx(
          'fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl flex flex-col md:hidden',
          'transition-transform duration-300 ease-out no-print',
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 shrink-0">
          <Link to={homeLink} onClick={() => setIsDrawerOpen(false)} className="text-base font-bold tracking-tight text-slate-900">
            BillFlow
          </Link>
          <button
            aria-label="Close navigation menu"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User identity */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-500 font-mono truncate">@{user?.username || 'user'}</p>
            </div>
            <span className="ml-auto shrink-0 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
              {role}
            </span>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <p className="px-2 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Navigation
          </p>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsDrawerOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Bottom actions */}
        <div className="px-3 pb-4 pt-2 border-t border-slate-100 space-y-0.5">
          {role !== 'ADMIN' && (
            <Link
              to="/signature-setup"
              onClick={() => setIsDrawerOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50',
                user?.signature_path ? 'text-slate-600' : 'text-amber-700'
              )}
            >
              <PenTool className={clsx('w-4 h-4 shrink-0', user?.signature_path ? 'text-emerald-500' : 'text-amber-500')} />
              {user?.signature_path ? 'Signature Active' : 'Setup Signature'}
            </Link>
          )}
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
            Sign Out
          </button>
        </div>
      </nav>
    </>
  );
};
