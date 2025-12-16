import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

interface User {
  name: string;
  given_name: string;
  picture: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

function decodeGoogleToken(token: string): User | null {
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(base64Url.length + (4 - (base64Url.length % 4)) % 4, "=");

    const payload = JSON.parse(atob(base64));
    return payload;
  } catch (e) {
    console.error("❌ Erreur décodage token Google", e);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[AUTH] 🚀 Initialisation...');
    
    // Fonction asynchrone pour l'initialisation
    const initAuth = async () => {
      try {
        // Récupérer le token depuis l'URL (retour de Google OAuth via backend)
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");

        if (urlToken) {
          console.log('[AUTH] Token trouvé dans l\'URL');
          // Stocker le token dans localStorage
          localStorage.setItem("google_id_token", urlToken);
          setToken(urlToken);
          const decoded = decodeGoogleToken(urlToken);
          console.log('[AUTH] Token décodé:', decoded);
          setUser(decoded);
          
          // Nettoyer l'URL (enlever le token de l'URL)
          const url = new URL(window.location.href);
          url.searchParams.delete("token");
          window.history.replaceState({}, document.title, url.toString());
        } else {
          // Vérifier si un token existe déjà dans localStorage
          const storedToken = localStorage.getItem("google_id_token");
          
          if (storedToken) {
            console.log('[AUTH] Token trouvé dans localStorage');
            
            if (!isTokenExpired(storedToken)) {
              console.log('[AUTH] Token valide');
              setToken(storedToken);
              const decoded = decodeGoogleToken(storedToken);
              console.log('[AUTH] Token décodé:', decoded);
              setUser(decoded);
            } else {
              console.log('[AUTH] Token expiré');
              // Token expiré - nettoyer
              localStorage.removeItem("google_id_token");
            }
          } else {
            console.log('[AUTH] Aucun token trouvé');
          }
        }
      } catch (error) {
        console.error('[AUTH] ❌ Erreur lors de l\'initialisation:', error);
        localStorage.removeItem("google_id_token");
      } finally {
        console.log('[AUTH] ✅ Chargement terminé');
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = useCallback((newToken: string) => {
    localStorage.setItem("google_id_token", newToken);
    setToken(newToken);
    const decoded = decodeGoogleToken(newToken);
    setUser(decoded);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("google_id_token");
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  const contextValue = useMemo(() => ({
    user, 
    token, 
    login, 
    logout, 
    isAuthenticated,
    isLoading
  }), [user, token, login, logout, isAuthenticated, isLoading]);

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
