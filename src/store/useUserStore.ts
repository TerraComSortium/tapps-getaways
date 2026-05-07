import { create } from 'zustand';

interface UserState {
  userLocation: { lat: number; lng: number } | null;
  userAddress: string;
  geoError: string | null;
  setUserLocation: (coords: { lat: number; lng: number }) => void;
  setUserAddress: (address: string) => void;
  setGeoError: (error: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userLocation: null,
  userAddress: "",
  geoError: null,
  setUserLocation: (coords) => set({ userLocation: coords }),
  setUserAddress: (address) => set({ userAddress: address }),
  setGeoError: (error) => set({ geoError: error }),
}));