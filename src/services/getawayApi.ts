import type { GetawayFormData,
  // Getaway
} from '../types/getaway';
import type { SubmissionResult } from '../contexts/FormDataContext';

const API_URL = "/api/getaways";
async function isBackendAvailable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function handleGetawaySubmit(payload: GetawayFormData): Promise<SubmissionResult> {
  const backendAvailable = await isBackendAvailable(API_URL);
  if (backendAvailable) {
    const apiFormData = new FormData();

    if (payload.galleryPhotos && Array.isArray(payload.galleryPhotos)) {
      payload.galleryPhotos.forEach(file => {
        apiFormData.append("galleryPhotos", file);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { galleryPhotos: _galleryPhotos, ...payloadWithoutFiles } = payload;

    apiFormData.append('data', JSON.stringify(payloadWithoutFiles));

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: apiFormData,
      });

      if (response.ok) {
        return { payload, status: 'SUCCESS', statusCode: response.status };
      } else {
        console.error("API Error:", response.status, await response.text());
        return { payload, status: 'API_ERROR', statusCode: response.status };
      }
    } catch (error) {
      console.error("Network or submission error:", error);
      return { payload, status: 'NETWORK_ERROR', statusCode: null };
    }
  } else {
    console.warn("Unavailable Backend, payload saved on localStorage.");
    // console.log(payload);
    localStorage.setItem('getaways', JSON.stringify([
      ...JSON.parse(localStorage.getItem('getaways') || '[]'),
      payload
    ]));
    return { payload, status: 'LOCAL_SAVE', statusCode: null };
  }
}

export async function getGetaways(): Promise< Getaway[] > {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      //(error 500)
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Failed to fetch getaways:", error);
    throw error;
  }
}

export async function getGetaway(): Promise<GetawayFormData | null> {
  // console.log("fetch api");
  try {
    const savedGetaways: GetawayFormData[] = JSON.parse(localStorage.getItem('getaways') || '[]');

    if (savedGetaways.length > 0) {
      // console.log("getawayID", savedGetaways[0]);
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