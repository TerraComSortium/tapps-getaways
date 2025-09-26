import { useState } from "react";
import auth from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("Usuario autenticado: ", user);

      if (user.accessToken) {
        localStorage.setItem("token", user.accessToken);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-dvh flex items-center justify-center bg-purple">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-5 items-center w-80"
      >
        <h1 className="text-3xl text-green font-medium">Login</h1>
        <div className="flex items-center flex-col gap-3 w-full">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white rounded-xl focus:outline-none px-4 py-2  w-full transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white rounded-xl focus:outline-none px-4 py-2  w-full transition"
          />
        </div>
        <button
          type="submit"
          className="text-purple bg-yellow font-bold px-12 py-1.5 rounded-full ont-medium text-lg"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
