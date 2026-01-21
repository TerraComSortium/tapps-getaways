import type { GetawayPayload,
  // Getaway
} from '../types/getaway';
import type { SubmissionResult } from '../contexts/FormDataContext';
const BASE_URL = "/api/getaways";
const ENDPOINTS = {
  CREATE: `${BASE_URL}/create`,
  LIST: `${BASE_URL}/`, //getGetaways
};

async function isBackendAvailable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function handleGetawaySubmit(payload: GetawayPayload): Promise<SubmissionResult> {
  const backendAvailable = await isBackendAvailable(ENDPOINTS.CREATE);
  if (backendAvailable) {
    const apiFormData = new FormData();

    if (payload.galleryPhotos && Array.isArray(payload.galleryPhotos)) {
      payload.galleryPhotos.forEach(file => {
        apiFormData.append("galleryPhotos", file);
      });
    }
    const payloadWithoutFiles = { ...payload };
    //@ts-expect-error to exclude galleryPhotos
    delete payloadWithoutFiles.galleryPhotos;
    //send clean JSON data
    apiFormData.append('data', JSON.stringify(payloadWithoutFiles));

    try {
      const response = await fetch(ENDPOINTS.CREATE, {
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
    const cleanPayload = { ...payload };

    // @ts-expect-error to ignore galleryPhotos
    delete cleanPayload.galleryPhotos;
    const localItem = {
      ...cleanPayload,
      _id: `local_${Date.now()}`,
      galleryPhotos: []
    };

    const existingData = JSON.parse(localStorage.getItem('getaways') || '[]');
    localStorage.setItem('getaways', JSON.stringify([...existingData, localItem]));

    return { payload, status: 'LOCAL_SAVE', statusCode: null };
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

// export async function getGetaways(): Promise<Getaway[]> {
//   try {
//     console.log("Trying to get getaways from server...");
//     const response = await fetch(API_URL);

//     if (!response.ok) {
//       throw new Error(`Backend Error: ${response.status}`);
//     }

//     const data: Getaway[] = await response.json();
//     console.log("Getaways successfully retrieved from the backend");
//     return data;

//   } catch (error) {
//     //FallbacklocalStorage
//     console.warn("Backend failed or is unavailable. Searching localStorage...");

//     const localDataString = localStorage.getItem('getaways');
//     if (localDataString) {
//       const localData: GetawayFormData[] = JSON.parse(localDataString);
//       console.log("Displaying locally saved getaways", localData);

//       const mappedData: Getaway[] = localData.map((item, index) => ({
//         ...item,
//         _id: `local-${index}`, //provisional id
//         galleryPhotos: [],
//       }));

//       return mappedData;
//     }

//     console.error("No offers were found in the backend or in localStorage");
//     throw error;
//   }
// }