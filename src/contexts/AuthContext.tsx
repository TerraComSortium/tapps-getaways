import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { consumeSsoToken } from "../utils/sso";
import { loginWithCustomToken } from "../api/authFirebase";

interface AuthState {
  role: string | null;
  isLoading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthState>({ role: null, isLoading: true, user: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({ role: null, isLoading: true, user: null });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      // SSO: si una app externa nos pasó un custom token en la URL, lo canjeamos
      // por una sesión Firebase ANTES de escuchar el estado de auth. Así isLoading
      // sigue en true durante el canje (ProtectedRoute muestra el spinner, no Login).
      // Si no hay token, o el canje falla, seguimos al flujo normal → ProtectedRoute
      // mandará a Login.
      const ssoToken = consumeSsoToken();
      if (ssoToken) {
        try {
          await loginWithCustomToken(ssoToken);
        } catch (err) {
          console.error('[SSO] No se pudo iniciar sesión con el token externo:', err);
        }
      }

      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await user.getIdTokenResult();
          setState({ role: token.claims.role as string || 'user', isLoading: false, user });
        } else {
          setState({ role: null, isLoading: false, user: null });
        }
      });
    };

    init();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
