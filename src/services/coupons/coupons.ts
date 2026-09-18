import { api } from "../../api/api";
import type { CouponPayload } from "../../types/getaway";

export const getCoupons = async () => {
  const response = await api.get("/coupons");
  return response.data;
};

export const createCoupon = async (couponData: CouponPayload) => {
  const response = await api.post("/coupons/create", couponData);
  return response.data;
};

export const updateCoupon = async (id: string, couponData: Partial<CouponPayload>) => {
  const response = await api.put(`/coupons/${id}`, couponData);
  return response.data;
};

export const deleteCoupon = async (id: string) => {
  const response = await api.delete(`/coupons/${id}`);
  return response.data;
};

export const getCouponById = async (id: string) => {
  const response = await api.get(`/coupons/${id}`);
  const coupons = response.data.coupons ?? response.data.coupon ?? response.data;
  return Array.isArray(coupons) ? coupons[0] ?? null : coupons;
};

export const getCouponForGetaway = async (couponId: string, getawayId: string) => {
  const response = await api.get(`/coupons/${couponId}/getaway/${getawayId}`);
  return response.data.coupon ?? response.data.coupons ?? response.data;
};

export const getCouponsForGetaways = async (getawayIds: string[]) => {
  const response = await api.post('/coupons/getaways', { getawayIds });
  return response.data.coupons ?? [];
};

/**
 * Aparta un cupo del cupón mientras el jugador completa la reserva.
 * Devuelve `{ ok:false, reason }` con 409 si ya no quedan cupos.
 */
export const holdCoupon = async (id: string) => {
  const response = await api.post(`/coupons/${id}/hold`, null, {
    // el 409 "sin cupos" es una respuesta esperada, no una excepción
    validateStatus: (status) => status === 200 || status === 409,
  });
  return response.data as { ok: boolean; reason?: string; remaining: number | null };
};

/** Devuelve el cupo si el jugador sale sin pagar. */
export const releaseCoupon = async (id: string) => {
  const response = await api.delete(`/coupons/${id}/hold`);
  return response.data;
};
