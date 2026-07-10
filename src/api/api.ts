import axios from "axios";
import { auth } from '../lib/firebase';
import i18n from '../i18n';

export const api = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
});
api.interceptors.request.use(
  async (config:any) => {
    // Idioma activo → el backend responde sus errores en el mismo idioma.
    config.headers['Accept-Language'] = i18n.language || 'en';
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