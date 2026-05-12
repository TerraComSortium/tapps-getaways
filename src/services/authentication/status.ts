import { api } from "../../api/api";

export const getStatus = async () => {
  const response = await api.get("/me");
  return response.data;
};
