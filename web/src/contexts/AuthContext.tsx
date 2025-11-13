import { createContext, useEffect, useState, useContext, type ReactNode } from 'react';
import { type Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthContextType {
  session: Session | null;
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);

  // listen to auth changes
  useEffect(() => {
    const getSession = async() => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session)
    }

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })

    return () => {
      listener.subscription.unsubscribe();
    }
  }, [])

  const signInWithGoogle = async() => {
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

export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('UserAuth must be used within an AuthContext!');

return context
}
