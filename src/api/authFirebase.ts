import { signInWithEmailAndPassword, signInWithCustomToken, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { LoginInput } from "../views/Login";

// Canjea un Firebase Custom Token (enviado por una app externa) por una sesión
// real. Tras esto, auth.currentUser queda seteado y todo el flujo normal
// (interceptor de api, AuthContext, ProtectedRoute) funciona sin cambios.
export const loginWithCustomToken = async (token: string) => {
    const userCredential = await signInWithCustomToken(auth, token);
    return userCredential.user;
};

export const login = async (authUser: LoginInput) => {
    try {
        const {email, password} = authUser
        const userCredential = await signInWithEmailAndPassword(auth, email, password); //start session
        // const token = await userCredential.user.getIdToken();
        return userCredential.user;
    } catch (error: any) {
        console.error("FIREBASE ERROR:", error.code, error.message);
        alert('User not found')
        throw error;
    }
};

export const logout = async() => {
    await signOut(auth);
}
export const getUserRole =  async () => {
    const user = auth.currentUser;
    if (user) {
        const tokenResult =  await user.getIdTokenResult();
        console.log("token", tokenResult);
        console.log('tokenResultClaimsRole:', tokenResult.claims.role);

        return tokenResult.claims.role || 'user';
    }
    return null;
}