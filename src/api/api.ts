import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});
api.interceptors.request.use(async (config:any) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api