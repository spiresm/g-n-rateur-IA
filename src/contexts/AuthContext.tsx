import { createContext, useContext } from "react";

export interface AuthContextType {
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const signInWithGoogle = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (!backendUrl) {
      throw new Error("VITE_BACKEND_URL manquant");
    }

    // 👉 Redirection vers le backend (OAuth Google)
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <AuthContext.Provider value={{ signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
