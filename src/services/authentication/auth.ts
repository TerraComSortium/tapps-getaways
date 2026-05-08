import { api } from "../../api/api";

export const signIn = async (userName: string, password: string) => {
  const response = await api.post("/getaway/auth", { userName, password });
  return response.data;
};
