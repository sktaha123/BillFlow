import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Lock, User, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setError('');
    setIsLoading(true);

    const result = await login(username.trim(), password);
    setIsLoading(false);

    if (result.success) {
      if (result.role === 'HOD')  return navigate('/hod');
      if (result.role === 'HEAD') return navigate('/head');
      return navigate('/faculty');
    } else {
      setError(result.error || 'Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      
      {/* Ambient background glow */}
      <div className="ambient-glow" />

      <div className="w-full max-w-md relative z-10">

        {/* Hero Title - Clean without top badge div */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Sign in to BillFlow
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Department of Computer Science — Paper setting &amp; remuneration portal
          </p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-xl shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] p-7 sm:p-8 space-y-6">

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-rose-50/80 border border-rose-200/80 text-rose-700 text-xs rounded-xl animate-in fade-in duration-150">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4.5">

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 tracking-tight">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200/90 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 tracking-tight">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200/90 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 mt-2"
            >
              {isLoading ? (
                <span className="animate-pulse">Signing in…</span>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8 font-normal">
          B.K. Birla College of Arts, Science &amp; Commerce (Autonomous), Kalyan
        </p>
      </div>
    </div>
  );
};
