import { useEffect } from 'react';
import { useUserStore } from '../store/useUserStore';

export const useWatchLocation = () => {
  const setLocation = useUserStore((state) => state.setUserLocation);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported on this browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error("GPS Error:", err.message),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );

    //Cleanup
    return () => navigator.geolocation.clearWatch(watchId);
  }, [setLocation]);
};