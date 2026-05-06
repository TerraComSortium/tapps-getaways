import axios from "axios";
import { auth } from '../lib/firebase';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});
api.interceptors.request.use(
  async (config:any) => {
    // const token = localStorage.getItem("token");
    const user = auth.currentUser;
    if(user){
      const token = await user.getIdToken();//get or refresh token
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No user found with interceptor");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);