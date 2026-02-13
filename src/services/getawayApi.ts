import type {
  GetawayPayload,
  Getaway,
  CouponPayload
} from '../types/getaway';
import type { SubmissionResult } from '../contexts/FormDataContext';
const BASE_URL = "/api/getaways";
const ENDPOINTS = {
  CREATE: `${BASE_URL}/create`,
  LIST: `${BASE_URL}/`, //getGetaways
  CREATE_COUPONS: `${BASE_URL}/coupons`,
};

export async function handleGetawaySubmit(payload: GetawayPayload): Promise<SubmissionResult & { getawayId?: string }> {
  const apiFormData = new FormData();

  if (payload.galleryPhotos && Array.isArray(payload.galleryPhotos)) {
    payload.galleryPhotos.forEach(file => {
      apiFormData.append("galleryPhotos", file);
    });
  }

  const payloadWithoutFiles = { ...payload };

  // @ts-expect-error to exclude galleryPhotos and discounts
  delete payloadWithoutFiles.galleryPhotos;
  delete payloadWithoutFiles.discounts;

  //send clean JSON data
  apiFormData.append('data', JSON.stringify(payloadWithoutFiles));

  try {
    const response = await fetch(ENDPOINTS.CREATE, {
      method: 'POST',
      body: apiFormData,
    });

    if (response.ok) {
      // parsing to obtain id
      const responseData = await response.json();
      const newId = responseData.offer?.id || responseData._id || responseData.id;

      return { payload, status: 'SUCCESS', statusCode: response.status, getawayId: newId };
    } else {
      console.error("API Error:", response.status, await response.text());
      return { payload, status: 'API_ERROR', statusCode: response.status };
    }
  } catch (error) {
    console.warn("Backend unreachable. Network or submission error:", error);
    return { payload, status: 'NETWORK_ERROR', statusCode: null };
  }
}

export async function getGetaway(): Promise<GetawayPayload | null> {
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
    console.warn("The backend failed or is unavailable.");

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