import { api } from '../api/api';
import axios from 'axios';
import type {
  GetawayPayload,
  Getaway,
  CouponPayload
} from '../types/getaway';
import type { SubmissionResult } from '../contexts/FormDataContext';
const BASE_URL = "/api/getaways";
const ENDPOINTS = {
  LIST: `${BASE_URL}/`, //getGetaways
  CREATE: `${BASE_URL}/create`,
  CREATE_COUPONS: `${BASE_URL}/coupons`,
  OWNER_ME: `${BASE_URL}/owner/me`,
};

export async function handleGetawaySubmit(payload: GetawayPayload): Promise<SubmissionResult & { getawayId?: string }> {
  const apiFormData = new FormData();
  if(payload.galleryPhotos && Array.isArray(payload.galleryPhotos)){
    payload.galleryPhotos.forEach(file => apiFormData.append("galleryPhotos", file));
  }

  const payloadWithoutFiles = { ...payload };
  //@ts-expect-error to exclude photos and discounts
  delete payloadWithoutFiles.galleryPhotos;
  delete payloadWithoutFiles.discounts;

  apiFormData.append('data', JSON.stringify(payloadWithoutFiles));

  try {
    const response = await api.post(ENDPOINTS.CREATE, apiFormData);
    const responseData = response.data;
    const newId = responseData.offer?._id || responseData.offer?.id || responseData._id || responseData.id;

    return{ payload, status:'SUCCESS', statusCode:response.status, getawayId:newId };
  } catch (error: unknown){
    if(axios.isAxiosError(error)){
      if (!error.response) {
        console.warn("Backend unavailable, save at LocalStorage");
        // saveToLocalStorage(payload);
        return { payload, status: 'LOCAL_SAVE', statusCode: null };
      }
      //error(400-500)
      return { payload, status: 'API_ERROR', statusCode: error.response.status };
    }
    return { payload, status: 'NETWORK_ERROR', statusCode: null };
  }
}

export async function handleCouponSubmit(couponPayload: CouponPayload) {
  const response = await fetch(ENDPOINTS.CREATE_COUPONS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(couponPayload),
  });

  if (!response.ok) {
    throw new Error(`Error at coupon creation: ${response.statusText}`);
  }

  return response.json();
}

export async function getGetaway(): Promise<GetawayPayload | null>{
  try {
    const savedGetaways: GetawayPayload[] = JSON.parse(localStorage.getItem('getaways') || '[]');

    if (savedGetaways.length > 0) {
      //console.log("getawayID", savedGetaways[0]);
      return savedGetaways[0];
    } else {
      console.log("No getaways available");
      return null;
    }
  } catch (error) {
    console.error("Error to fetch api", error);
    return null;
  }
}

export async function getGetaways(): Promise<Getaway[]> {
  try {
    console.log("Trying to get getaways from server...");
    const response = await fetch(ENDPOINTS.LIST);

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.status}`);
    }
    const data: Getaway[] = await response.json();
    console.log("Getaways successfully retrieved from the backend");
    return data;

  } catch (error) {
    //Fallback to localStorage
    // console.warn("The backend failed or is unavailable.");
    console.warn("The backend failed or is unavailable. Searching localStorage...");

    const localDataString = localStorage.getItem('getaways');
    if (localDataString) {
      const localData = JSON.parse(localDataString) as Getaway[];
      console.log("Displaying locally saved getaways.", localData);
      return localData;
    }

    console.error("No offers were found in the backend or in localStorage.");
    throw error;
  }
}

export const getOwnerGetaways = async (): Promise<Getaway[]> => {
  try{
    const response = await api.get<Getaway[]>(ENDPOINTS.OWNER_ME);
    return response.data;
  } catch (error: any){
    console.error("Error al obtener los getaways del owner:", error);
    throw error;
  }
};