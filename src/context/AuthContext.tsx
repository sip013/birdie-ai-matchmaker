import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Checking session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error);
          toast.error('Error initializing authentication');
          throw error;
        }

        console.log('AuthProvider: Session data:', session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('AuthProvider: Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN') {
        console.log('AuthProvider: User signed in:', session?.user);
        toast.success('Successfully signed in!');
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthProvider: User signed out');
        toast.success('Successfully signed out!');
      }

      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Attempting to sign in with email:', email);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('AuthProvider: Sign in error:', error);
        toast.error(error.message);
        return { error };
      }
      
      console.log('AuthProvider: Sign in successful:', data);
      return { error: null };
    } catch (error) {
      console.error('AuthProvider: Unexpected error during sign in:', error);
      toast.error('An unexpected error occurred');
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthProvider: Attempting to sign out');
      setLoading(true);

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthProvider: Sign out error:', error);
        toast.error(error.message);
        throw error;
      }

      console.log('AuthProvider: Sign out successful');
    } catch (error) {
      console.error('AuthProvider: Unexpected error during sign out:', error);
      toast.error('An unexpected error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  if (loading) {
    console.log('AuthProvider: Loading state...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('AuthProvider: Rendering with user:', user);
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
