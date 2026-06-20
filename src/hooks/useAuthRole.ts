import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const useAuthRole = () => {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(()=>{
    const unsubscribe = onAuthStateChanged(auth, async(user) => {
      if(user){
        try{
          const tokenResult = await user.getIdTokenResult();
          setRole((tokenResult.claims.role as string) || 'user');
        } catch(error){
          console.error("Error getting claims:", error);
          setRole('user');
        }
      } else{
        setRole('null');
      }
      setIsLoading(false);
    });
    //reset listener
    return () => unsubscribe();
  }, []);
  return {role, isLoading};
};