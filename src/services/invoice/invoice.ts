import { api } from "../../api/api";

export const getInvoice = async (orderId: string): Promise<Blob> => {
  const response = await api.get(`/invoice/${orderId}`, {
    responseType: "blob",
  });
  return response.data;
};
