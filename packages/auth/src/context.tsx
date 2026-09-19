import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CustomerAccount, Profile, StaffAccount } from '@candi/types';
import { supabase, isLiveSupabase, MOCK_ACCOUNTS, MockUserSession } from './client';
import { resolveCustomerRoute } from './statusRouter';

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; phone: string } | null;
  profile: Profile | null;
  customerAccount: CustomerAccount | null;
  staffAccount: StaffAccount | null;
  isOfflineMode: boolean;
  signInWithOtp: (phone: string) => Promise<{ success: boolean; error?: string; mockOtp?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string; nextRoute?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateCustomerAccount: (data: Partial<CustomerAccount>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_STORAGE_KEY = 'candi_auth_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; phone: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [customerAccount, setCustomerAccount] = useState<CustomerAccount | null>(null);
  const [staffAccount, setStaffAccount] = useState<StaffAccount | null>(null);

  // Restore saved session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed: MockUserSession = JSON.parse(saved);
        setUser(parsed.user);
        setProfile(parsed.profile);
        setCustomerAccount(parsed.customerAccount || null);
        setStaffAccount(parsed.staffAccount || null);
      }
    } catch {
      // Ignore parse error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithOtp = async (phone: string): Promise<{ success: boolean; error?: string; mockOtp?: string }> => {
    if (isLiveSupabase && supabase) {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    // Offline / Mock fallback
    // In mock mode, generate standard demo OTP 123456
    return {
      success: true,
      mockOtp: '123456',
    };
  };

  const verifyOtp = async (
    phone: string,
    token: string
  ): Promise<{ success: boolean; error?: string; nextRoute?: string }> => {
    if (isLiveSupabase && supabase) {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
      if (error || !data.user) return { success: false, error: error?.message || 'Verification failed' };

      // Load profile & accounts
      const userPayload = { id: data.user.id, phone: data.user.phone || phone };
      setUser(userPayload);
      return { success: true, nextRoute: '/home' };
    }

    // Offline / Mock verification
    if (token !== '123456' && token !== '000000') {
      return { success: false, error: 'Invalid verification code. Use demo code: 123456' };
    }

    // Check if phone matches known preloaded demo account
    const existing = MOCK_ACCOUNTS[phone];
    let sessionData: MockUserSession;

    if (existing) {
      sessionData = existing;
    } else {
      // Brand new user registration flow
      const newId = `usr-${Date.now()}`;
      sessionData = {
        user: { id: newId, phone },
        profile: {
          id: newId,
          fullName: '',
          phone,
          preferredLanguage: 'en',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    setUser(sessionData.user);
    setProfile(sessionData.profile);
    setCustomerAccount(sessionData.customerAccount || null);
    setStaffAccount(sessionData.staffAccount || null);

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));

    const nextRoute = sessionData.customerAccount
      ? resolveCustomerRoute(sessionData.customerAccount.status)
      : '/register';

    return {
      success: true,
      nextRoute,
    };
  };

  const signOut = async () => {
    if (isLiveSupabase && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setCustomerAccount(null);
    setStaffAccount(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (profile) {
      const updated = { ...profile, ...data, updatedAt: new Date().toISOString() };
      setProfile(updated);
      if (user) {
        const session: MockUserSession = {
          user,
          profile: updated,
          customerAccount: customerAccount || undefined,
          staffAccount: staffAccount || undefined,
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      }
    }
  };

  const updateCustomerAccount = async (data: Partial<CustomerAccount>) => {
    if (customerAccount) {
      const updated = { ...customerAccount, ...data, updatedAt: new Date().toISOString() };
      setCustomerAccount(updated);
      if (user && profile) {
        const session: MockUserSession = {
          user,
          profile,
          customerAccount: updated,
          staffAccount: staffAccount || undefined,
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        isLoading,
        user,
        profile,
        customerAccount,
        staffAccount,
        isOfflineMode: !isLiveSupabase,
        signInWithOtp,
        verifyOtp,
        signOut,
        updateProfile,
        updateCustomerAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
