import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://g-n-rateur-backend-1.onrender.com';

interface User {
  email: string;
  name?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  signInWithGoogle: () => void;
  signOut: () => void;
}

interface GoogleJWTPayload {
  email: string;
  name?: string;
  picture?: string;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour vérifier si le token est expiré
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<GoogleJWTPayload>(token);
      const now = Date.now() / 1000;
      return decoded.exp < now;
    } catch (error) {
      console.error('Erreur décodage token:', error);
      return true;
    }
  };

  // Vérifier le token au démarrage et dans l'URL
  useEffect(() => {
    console.log('[AUTH] Initialisation...');

    // 1. Vérifier si on revient du callback Google (?token=xxx)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      console.log('[AUTH] Token trouvé dans l\'URL');
      localStorage.setItem('google_id_token', tokenFromUrl);
      setToken(tokenFromUrl);
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Décoder le token pour extraire l'utilisateur
      try {
        const decoded = jwtDecode<GoogleJWTPayload>(tokenFromUrl);
        setUser({
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
        });
        console.log('[AUTH] Utilisateur connecté:', decoded.email);
      } catch (error) {
        console.error('[AUTH] Erreur décodage token:', error);
        localStorage.removeItem('google_id_token');
      }
      
      setIsLoading(false);
      return;
    }

    // 2. Vérifier si un token existe dans localStorage
    const storedToken = localStorage.getItem('google_id_token');
    
    if (storedToken) {
      // Vérifier si le token est expiré
      if (isTokenExpired(storedToken)) {
        console.log('[AUTH] Token expiré, déconnexion');
        localStorage.removeItem('google_id_token');
        setIsLoading(false);
        return;
      }

      console.log('[AUTH] Token valide trouvé dans localStorage');
      setToken(storedToken);
      
      try {
        const decoded = jwtDecode<GoogleJWTPayload>(storedToken);
        setUser({
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
        });
        console.log('[AUTH] Utilisateur restauré:', decoded.email);
      } catch (error) {
        console.error('[AUTH] Erreur décodage token:', error);
        localStorage.removeItem('google_id_token');
      }
    } else {
      console.log('[AUTH] Aucun token trouvé');
    }

    setIsLoading(false);
  }, []);

  const signInWithGoogle = () => {
    console.log('[AUTH] Redirection vers Google OAuth...');
    // Nettoyer avant de rediriger
    localStorage.clear();
    // Rediriger vers le backend qui gère OAuth
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const signOut = () => {
    console.log('[AUTH] Déconnexion');
    localStorage.removeItem('google_id_token');
    setUser(null);
    setToken(null);
    // Recharger la page pour afficher la page de login
    window.location.reload();
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, token, signInWithGoogle, signOut }}>
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
