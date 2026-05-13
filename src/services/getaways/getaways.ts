import { api } from "../../api/api";
import { normalizeGetawayData } from '../../utils/getawayHelpers';

export const getAllGetaways = async () => {
  const response = await api.get("/getaways");
  // return response.data;
  const dataToNormalize = response.data?.data || response.data || [];
  // return Array.isArray(response.data) ? response.data.map(normalizeGetawayData) : [];
  return Array.isArray(dataToNormalize)
    ? dataToNormalize.map(normalizeGetawayData)
    : [];
};

export const getGetawayById = async (id: string) => {
  const response = await api.get(`/getaways/${id}`);
  return response.data;
};

export const getGetawaysByOwner = async () => {
  const response = await api.get("/getaways/owner/me");
  return response.data;
};
// export const getGetawaysByOwner = async () => {
//   const response = await api.get("/getaways/owner/me");
//   // return Array.isArray(response.data) ? response.data.map(normalizeGetawayData) : [];
// };

export const getSubscribedGetaways = async () => {
  const response = await api.get("/getaways/subscribed/");
  return response.data;
};

export const getGetawaySubscribers = async (id: string) => {
  const response = await api.get(`/getaways/${id}/subscribers`);
  return response.data;
};

export const subscribeToGetaway = async (id: string, couponId?: string) => {
  const response = await api.post(`/getaways/${id}/subscribe`, { couponId });
  return response.data;
};

export const updateGetaway = async (id: string, data: Record<string, unknown>) => {
  const response = await api.put(`/getaways/${id}`, data);
  return response.data;
};

export const deleteGetaway = async (id: string) => {
  const response = await api.delete(`/getaways/${id}`);
  return response.data;
};
