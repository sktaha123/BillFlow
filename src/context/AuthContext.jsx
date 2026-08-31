import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, dataService } from '@/lib/supabase';

export const AuthContext = createContext(undefined);

const AUTH_USER_KEY = 'bk_auth_current_user_id';

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore session on mount ──
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const savedId = localStorage.getItem(AUTH_USER_KEY);
        if (savedId) {
          const profile = await dataService.getProfileById(savedId);
          if (profile && mounted) {
            setUser(profile);
          }
        }
      } catch (err) {
        console.error('Session restore failed', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // ── Login: direct username & password authentication via Supabase profiles ──
  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();

      if (isSupabaseConfigured && supabase) {
        // 1. Direct query against Supabase profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', cleanUsername)
          .eq('password', cleanPassword)
          .maybeSingle();

        if (error) {
          console.error('[BillFlow Supabase Error]:', error);
          setIsLoading(false);
          return { success: false, error: 'Database connection error: ' + error.message };
        }

        if (profile) {
          setUser(profile);
          localStorage.setItem(AUTH_USER_KEY, profile.id);
          setIsLoading(false);
          return { success: true, role: profile.role };
        }

        setIsLoading(false);
        return { success: false, error: 'Invalid username or password.' };
      } else {
        // ── Local fallback mode ──
        const profiles = await dataService.getProfiles();
        const matched  = profiles.find(
          p => p.username?.toLowerCase() === cleanUsername.toLowerCase()
        );

        if (matched) {
          setUser(matched);
          localStorage.setItem(AUTH_USER_KEY, matched.id);
          setIsLoading(false);
          return { success: true, role: matched.role };
        }

        setIsLoading(false);
        return { success: false, error: 'Invalid username or password.' };
      }
    } catch (err) {
      console.error('Login error', err);
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  };

  // ── Logout ──
  const logout = async () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  // ── Update signature ──
  const updateSignature = async (signatureDataUrl) => {
    if (!user) throw new Error('Not logged in');
    const updated = await dataService.updateProfileSignature(user.id, signatureDataUrl);
    setUser(updated);
  };

  // ── Refresh profile from Supabase ──
  const refreshUserProfile = async () => {
    if (!user) return;
    const refreshed = await dataService.getProfileById(user.id);
    if (refreshed) setUser(refreshed);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      isLoading,
      login,
      logout,
      updateSignature,
      refreshUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
