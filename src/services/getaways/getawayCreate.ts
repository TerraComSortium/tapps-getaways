import { api } from '../../api/api';
import type { SubmissionResult } from '../../contexts/FormDataContext';
import type { GetawayPayload, CouponPayload } from '../../types/getaway';
import { isAxiosError, getErrorMessage } from '../api/types';

const ENDPOINTS = {
  CREATE: '/getaways/create',
  COUPON: '/coupons/create',
} as const;

//helpers
function buildFormData(payload: GetawayPayload): FormData {
  const formData = new FormData();
  payload.galleryPhotos?.forEach((file) => {
    if (file) {
      formData.append('galleryPhoto', file);
    }
  });

  //to do exclude JSON binaries
  //const { galleryPhotos:_ , ...jsonPayload } = payload;
  const jsonPayload = { ...payload };
  delete (jsonPayload as Partial<GetawayPayload>).galleryPhotos;
  formData.append('data', JSON.stringify(jsonPayload));
  return formData;
}

function extractGetawayId(responseData: unknown): string | undefined {
  if (typeof responseData !== 'object' || responseData === null) return undefined;
  const d = responseData as Record<string, unknown>;
  const offer = d?.offer as Record<string, unknown> | undefined;
  return (offer?.id ?? d?._id ?? d?.id) as string | undefined;
}

//petitions
export async function handleGetawaySubmit(
  payload: GetawayPayload
): Promise<SubmissionResult & { getawayId?: string }> {
  try {
    const formData = buildFormData(payload);
    const response = await api.post(ENDPOINTS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const getawayId = extractGetawayId(response.data);
    console.info('Getaway created:', getawayId);

    return {
      payload,
      status: 'SUCCESS',
      statusCode: response.status,
      getawayId,
    };
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error('Submit error:', message);
    if (isAxiosError(error)) {
      const status = error.response?.status ?? null;
      console.error('API Error:', status, error.response?.data);
      return { payload, status: 'API_ERROR', statusCode: status };
    }
    console.warn('Network or unexpected error:', error);
    return { payload, status: 'NETWORK_ERROR', statusCode: null };
  }
}

export async function handleCouponSubmit(
  payload: CouponPayload
): Promise<void> {
  try {
    await api.post(ENDPOINTS.COUPON, payload);
  } catch (error: unknown) {
    console.error('Coupon submit failed:', error);
    throw error;
  }
}