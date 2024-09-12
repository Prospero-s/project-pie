'use client';

import { Provider, Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useLoading } from '@/hooks/LoadingContext';
import { supabase } from '@/supabase/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    data:
      | { user: User; session: Session; weakPassword?: any }
      | { user: null; session: null; weakPassword?: null | undefined };
    error: any;
  }>;
  signOut: () => Promise<void>;
  signWithProvider: (provider: Provider) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signIn: async () => ({ data: { user: null, session: null }, error: null }),
  signOut: async () => {},
  signWithProvider: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { setLoading } = useLoading();
  const router = useRouter();

  useEffect(() => {
    const setServerSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        router.push('/dashboard');
      }
    };

    setServerSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          router.push('/auth/signin');
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, setLoading]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signWithProvider = async (
    provider: Provider,
    options?: {
      redirectTo?: string;
      scopes?: string;
      queryParams?: Record<string, string>;
      skipBrowserRedirect?: boolean;
    },
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with provider:', error);
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, signIn, signOut, signWithProvider }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
