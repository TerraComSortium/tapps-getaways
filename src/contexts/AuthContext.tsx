import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

const AuthContext = createContext({ role: null, isLoading: true });

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({ role: null, isLoading: true });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => { 
      if (user) { 
        const token = await user.getIdTokenResult(); 
        setState({ role: token.claims.role || 'user', isLoading: false }); 
      } else { 
        setState({ role: null, isLoading: false });
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