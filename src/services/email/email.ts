import { api } from "../../api/api";

export const verifyEmail = async (email: string) => {
  const response = await api.get("/verify-email", { params: { email } });
  return response.data;
};
