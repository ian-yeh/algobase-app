import { createContext, useEffect, useState, type ReactNode } from 'react';
import { type Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { authenticatedFetch } from '@/lib/api';

interface AuthContextType {
  session: Session | null;
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null);

/*
The auth context. This is the security guard of the app. Checks whether or not the user is logged in. Returns the user id, which will be used for db queries. 
*/
export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);

  const syncUserWithBackend = async (currentSession: Session | null) => {
    if (currentSession?.user) {
      try {
        await authenticatedFetch('/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0],
            email: currentSession.user.email,
            imageUrl: currentSession.user.user_metadata?.avatar_url,
          }),
        });
      } catch (error) {
        console.error('Error syncing user with backend:', error);
      }
    }
  };

  // listen to auth changes
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session) syncUserWithBackend(data.session);
    }

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) syncUserWithBackend(session);
    })

    return () => {
      listener.subscription.unsubscribe();
    }
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`
      }
    })

    if (error) console.error('Error signing in with Google', error.message)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out:', error.message)
  }

  const value: AuthContextType = {
    session,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
} 
