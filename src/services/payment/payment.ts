import { api } from "../../api/api";

export interface ProcessPaymentPayload {
  orderId: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
}

export const processPayment = async (payload: ProcessPaymentPayload) => {
  const response = await api.post("/payment", payload);
  return response.data;
};
