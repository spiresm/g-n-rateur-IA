import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

interface User {
  name?: string;
  full_name?: string;
  picture?: string;
  avatar_url?: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  signOut: () => void;
  signInWithGoogle: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilise l'URL Render en production (image_bf7cb6)
const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) 
  ? import.meta.env.VITE_BACKEND_URL 
  : 'https://g-n-rateur-backend-1.onrender.com';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

function decodeJWTPayload(token: string): User | null {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    // Supabase stocke les infos dans user_metadata (image_bf12dc)
    const metadata = payload.user_metadata || {};
    return {
      email: payload.email || metadata.email,
      name: metadata.full_name || metadata.name || payload.email,
      picture: metadata.avatar_url || metadata.picture,
    };
  } catch (e) {
    console.error("❌ [AUTH] Erreur décodage:", e);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.log('[AUTH] 🚀 Initialisation...');
      try {
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        let urlToken = null;

        // 1. Extraction du token Supabase (après le #) - Crucial pour image_be8c77
        if (hash && hash.includes("access_token")) {
          const params = new URLSearchParams(hash.substring(1));
          urlToken = params.get("access_token");
          console.log('[AUTH] ✅ Token détecté dans le fragment URL');
        } 
        // 2. Extraction du token Backend classique (après le ?)
        else if (searchParams.get("token")) {
          urlToken = searchParams.get("token");
          console.log('[AUTH] ✅ Token détecté dans les paramètres URL');
        }

        if (urlToken) {
          localStorage.setItem("google_id_token", urlToken);
          setToken(urlToken);
          setUser(decodeJWTPayload(urlToken));

          // Nettoyage de l'URL pour enlever le token visible
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } else {
          const storedToken = localStorage.getItem("google_id_token");
          if (storedToken && !isTokenExpired(storedToken)) {
            setToken(storedToken);
            setUser(decodeJWTPayload(storedToken));
          } else {
            localStorage.removeItem("google_id_token");
          }
        }
      } catch (error) {
        console.error('[AUTH] ❌ Erreur init:', error);
      } finally {
        setIsLoading(false);
        console.log('[AUTH] 🏁 Chargement terminé');
      }
    };

    initAuth();
  }, []);

  const login = useCallback((newToken: string) => {
    localStorage.setItem("google_id_token", newToken);
    setToken(newToken);
    setUser(decodeJWTPayload(newToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("google_id_token");
    setToken(null);
    setUser(null);
    window.location.href = '/';
  }, []);

  const signInWithGoogle = useCallback(async () => {
    console.log('[AUTH] Redirection vers Render...');
    // Redirige vers la route auth de votre backend Render (image_bf7cb6)
    window.location.href = `${BACKEND_URL}/auth/google`;
  }, []);

  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  const contextValue = useMemo(() => ({
    user,
    token,
    login,
    logout,
    signOut: logout,
    signInWithGoogle,
    isAuthenticated,
    isLoading
  }), [user, token, login, logout, signInWithGoogle, isAuthenticated, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
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
