import { api } from "../../api/api";

export interface SavedCard {
  id: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
}

// Tarjetas guardadas del usuario autenticado (GET /payment-methods).
export const listSavedCards = async (): Promise<SavedCard[]> => {
  const response = await api.get("/payment-methods");
  return response.data?.cards || [];
};
