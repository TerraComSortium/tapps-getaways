import { api } from "../../api/api";

export interface ProcessPaymentPayload {
  orderId: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
  saveCard?: boolean;
}

export const processPayment = async (payload: ProcessPaymentPayload) => {
  const response = await api.post("/payment", payload);
  return response.data;
};

// Finaliza la orden tras completar el 3D Secure (stripe.confirmCardPayment).
// El backend re-consulta el PaymentIntent y solo marca 'paid' si está 'succeeded'.
export const confirmPayment = async (orderId: string) => {
  const response = await api.post("/payment/confirm", { orderId });
  return response.data;
};
