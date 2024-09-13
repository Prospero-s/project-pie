'use client';

import { Provider, Session, User } from '@supabase/supabase-js';
import * as React from 'react';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabaseClient';

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
  signWithProvider: (
    provider: Provider,
    options?: {
      redirectTo?: string;
      scopes?: string;
      queryParams?: Record<string, string>;
      skipBrowserRedirect?: boolean;
    },
  ) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  session: null,
  signIn: async () => ({ data: { user: null, session: null }, error: null }),
  signOut: async () => {},
  signWithProvider: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        setSession(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
      }
    });

    // Vérifier la session au chargement initial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('signIn', email, password);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('signIn', data, error);

    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      // Ajoutez cette ligne pour forcer la mise à jour de la session
      await supabase.auth.refreshSession();
    }

    return { data, error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null); // Ajouté pour mettre à jour l'état de l'utilisateur
      setSession(null); // Ajouté pour mettre à jour l'état de la session
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
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          ...options,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with provider:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, signIn, signOut, signWithProvider }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
