import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

interface User {
  name?: string;
  picture?: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  signOut: () => void;
  signInWithGoogle: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL = 'https://g-n-rateur-backend-1.onrender.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // FONCTION POUR VÉRIFIER LA SESSION
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/user`, {
        method: 'GET',
        credentials: 'include', // INDISPENSABLE pour envoyer le cookie
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[AUTH] Erreur session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signInWithGoogle = useCallback(async () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  }, []);

  const signOut = useCallback(async () => {
    await fetch(`${BACKEND_URL}/logout`, { credentials: 'include' });
    setUser(null);
    window.location.href = '/';
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const contextValue = useMemo(() => ({
    user,
    signOut,
    signInWithGoogle,
    isAuthenticated,
    isLoading
  }), [user, signInWithGoogle, signOut, isAuthenticated, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
