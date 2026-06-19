import { api } from "../../api/api";

export interface OrderReservation {
  user?: { id?: string; name?: string; email?: string };
  lodgingOption?: { option?: string; price?: number };
  optionalAddOns?: { addonName?: string; price?: number }[];
  paymentDetails?: { Subtotal?: string; Taxes?: string; Total?: string };
  getawayId?: string;
}

export interface Order {
  orderId: string;
  status: string;
  createdAt?: string;
  paidAt?: string;
  reservation: OrderReservation;
  // info del getaway si el backend la une (opcional)
  getawayTitle?: string;
  getawayDates?: string;
}

// Órdenes del usuario autenticado (GET /my-orders).
// TODO(backend): falta el endpoint que consulte getaways_orders por reservation.user.id.
export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get("/my-orders");
  return response.data?.orders || response.data || [];
};
