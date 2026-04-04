import { create } from 'zustand';

interface UserState {
  userLocation: { lat: number; lng: number } | null;
  userAddress: string;
  setUserLocation: (coords: { lat: number; lng: number }) => void;
  setUserAddress: (address: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userLocation: null,
  userAddress: "",
  setUserLocation: (coords) => set({ userLocation: coords }),
  setUserAddress: (address) => set({ userAddress: address }),
}));