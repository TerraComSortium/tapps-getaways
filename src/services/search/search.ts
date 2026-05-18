import { api } from "../../api/api";

interface SearchParams {
  lat: number;
  lng: number;
  sport?: string;
  startDate?: string;
  endDate?: string;
}

interface NearbyParams {
  lat: string;
  lng: string;
  min?: string;
  max?: string;
}

interface FilterParams {
  sport?: string;
  startDate?: string;
  endDate?: string;
}

export const searchGetaways = async (params: SearchParams) => {
  const response = await api.get("/search", { params });
  const data = response.data;
  return Array.isArray(data?.results) ? data.results : [];
};

export const searchNearby = async (params: NearbyParams) => {
  const response = await api.get("/search/nearby", { params });
  return response.data;
};

export const searchFilter = async (params: FilterParams) => {
  const response = await api.get("/search/filter", { params });
  return response.data;
};

export const searchAutocomplete = async (q: string) => {
  const response = await api.get("/search/autocomplete", { params: { q } });
  return response.data;
};
