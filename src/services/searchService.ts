import type { Getaway } from '../types/getaway';
const BASE_URL = "/api/";

export const SearchService = {
  //Omni-Search
  search: async (params: {
    lat: number;
    lng: number;
    q?: string;
    sport?: string;
    startDate?: string;
    endDate?: string;
  }, signal?: AbortSignal): Promise<Getaway[]> => {

    const queryParams = new URLSearchParams();
    queryParams.append('lat', params.lat.toString());
    queryParams.append('lng', params.lng.toString());

    if (params.q) queryParams.append('q', params.q);
    if (params.sport) queryParams.append('sport', params.sport);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const res = await fetch(`${BASE_URL}search?${queryParams.toString()}`, { signal });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Error fetching search results');
    }

    const data = await res.json();
    return data.results;
  }
};