import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { LoginInput } from "../views/Login";

export const login = async (authUser: LoginInput) => {
    try {
        const {email, password} = authUser
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem("token", token);
    return token;
    } catch (error: any) {
        console.error("FIREBASE ERROR:", error.code, error.message);
        alert('Usuario no encontrado')
         throw error;
    }
};

export const logout = async() => {
    await signOut(auth);
    localStorage.removeItem("token");
}