import { create } from 'zustand';

interface UserState {
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (coords: { lat: number; lng: number }) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userLocation: null,
  setUserLocation: (coords) => set({ userLocation: coords }),
}));