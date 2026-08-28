import { api } from "../../api/api";
import { normalizeGetawayData } from '../../utils/getawayHelpers';

export const getAllGetaways = async () => {
  const response = await api.get("/getaways");
  const dataToNormalize = response.data?.data || response.data || [];
  return Array.isArray(dataToNormalize)
    ? dataToNormalize.map(normalizeGetawayData)
    : [];
};

export const getGetawayById = async (id: string) => {
  console.log("id data", id) // todo-list este id debe ser de un RCNet
  const response = await api.get(`/getaways/${id}`);
  return response.data;
};

export const getGetawaysByOwner = async () => {
  const response = await api.get("/getaways/owner/me");
  const responseToNormalize = response.data?.data || response.data || [];
  return Array.isArray(responseToNormalize)
    ? responseToNormalize.map(normalizeGetawayData)
    : [];
};

export const getActiveGetaways = async () => {
  const response = await api.get("/getaways/active");
  const dataToNormalize = response.data?.results || response.data || [];
  return Array.isArray(dataToNormalize)
    ? dataToNormalize.map(normalizeGetawayData)
    : [];
};

export const getSubscribedGetaways = async () => { // to-do utiliza este para la vista 
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
