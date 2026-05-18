import { createContext, useEffect, useState, type ReactNode } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';

interface User {
  userId: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signUpMutation = useMutation(api.auth.signUp);
  const signInMutation = useMutation(api.auth.signIn);

  useEffect(() => {
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const result = await signUpMutation({ email, password, username });
      setToken(result.token);
      setUser(result.user);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Extract user-friendly error message from Convex error
      if (message.includes('User already exists')) {
        throw new Error('This email is already registered. Try signing in instead.');
      }
      if (message.includes('Invalid')) {
        throw new Error('Invalid input. Please check your details.');
      }

      throw new Error('Sign up failed. Please try again.');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInMutation({ email, password });
      setToken(result.token);
      setUser(result.user);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Extract user-friendly error message from Convex error
      if (message.includes('Invalid email or password')) {
        throw new Error('Invalid email or password. Please try again.');
      }

      throw new Error('Sign in failed. Please try again.');
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
