import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  const token = await userCredential.user.getIdToken();

  return token;
};