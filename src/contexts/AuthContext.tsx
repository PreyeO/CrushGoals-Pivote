import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { logError } from '@/lib/logger';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  preferred_currency: string;
  username: string | null;
}

interface UserStats {
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  perfect_days: number;
  tasks_completed: number;
}

interface Subscription {
  plan: string;
  status: string;
  trial_ends_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  stats: UserStats | null;
  subscription: Subscription | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAdminLoaded: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoaded, setIsAdminLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleSessionTimeout = useCallback(() => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setStats(null);
    setSubscription(null);
    setIsAdmin(false);
    navigate('/');
  }, [navigate]);

  // Session timeout hook
  useSessionTimeout(!!user, handleSessionTimeout);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (profileData) {
        setProfile(profileData as Profile);
      }

      // Fetch stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (statsData) {
        setStats(statsData as UserStats);
      }

      // Fetch subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (subData) {
        setSubscription(subData as Subscription);
      }

      // Check if admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!roleData);
      setIsAdminLoaded(true);
    } catch (error) {
      logError('Error fetching user data:', error);
      setIsAdminLoaded(true);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Skip processing if we're on the reset password page with a recovery token
        const currentPath = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const isPasswordRecovery = event === 'PASSWORD_RECOVERY' || 
          urlParams.get('type') === 'recovery' ||
          currentPath === '/reset-password';
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // CRITICAL: Reset isAdminLoaded to false BEFORE fetching data
          // This ensures ProtectedRoute waits for admin status to be determined
          setIsAdminLoaded(false);
          // Defer Supabase calls with setTimeout to prevent deadlocks
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
          
          // Don't redirect if this is a password recovery flow
          if (isPasswordRecovery) {
            navigate('/reset-password');
          }
        } else {
          setProfile(null);
          setStats(null);
          setSubscription(null);
          setIsAdmin(false);
          setIsAdminLoaded(true);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Check if we're on reset password page
      const currentPath = window.location.pathname;
      const isResetPasswordPage = currentPath === '/reset-password';
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Reset isAdminLoaded before fetching to ensure proper waiting
        setIsAdminLoaded(false);
        fetchUserData(session.user.id);
      } else {
        setIsAdminLoaded(true);
      }
      setIsLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setStats(null);
    setSubscription(null);
    setIsAdmin(false);
    setIsAdminLoaded(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      stats,
      subscription,
      isAdmin,
      isLoading,
      isAdminLoaded,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
