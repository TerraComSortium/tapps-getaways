import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthState {
  role: string | null;
  isLoading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthState>({ role: null, isLoading: true, user: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({ role: null, isLoading: true, user: null });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        setState({ role: token.claims.role as string || 'user', isLoading: false, user });
      } else {
        setState({ role: null, isLoading: false, user: null });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
