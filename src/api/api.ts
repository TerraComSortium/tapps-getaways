import axios from "axios";
import {auth} from '../lib/firebase';

export const api = axios.create({
  baseURL: "http://localhost:8001/api",
});
api.interceptors.request.use(
  async (config:any) => {
    // const token = localStorage.getItem("token");

    const user = auth.currentUser;
    if(user){
      const token = await user.getIdToken();//get or refresh token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);