import { api } from "../../api/api";

export const getCoupons = async () => {
  const response = await api.get("/coupons");
  return response.data;
};

export const createCoupon = async (couponData: Record<string, unknown>) => {
  const response = await api.post("/coupons/create", couponData);
  return response.data;
};

export const updateCoupon = async (id: string, couponData: Record<string, unknown>) => {
  const response = await api.put(`/coupons/${id}`, couponData);
  return response.data;
};

export const deleteCoupon = async (id: string) => {
  const response = await api.delete(`/coupons/${id}`);
  return response.data;
};

export const getCouponById = async (id: string) => {
  const response = await api.get(`/coupons/${id}`);
  return response.data.coupons;
};