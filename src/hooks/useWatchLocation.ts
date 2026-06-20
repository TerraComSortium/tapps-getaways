import { useEffect } from 'react';
import { useUserStore } from '../store/useUserStore';

export const useWatchLocation = () => {
  const setLocation = useUserStore((state) => state.setUserLocation);
  const setGeoError = useUserStore((state) => state.setGeoError);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by this browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGeoError(null);
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        // Log del código real para diagnóstico: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
        console.warn('[geo] error', err.code, err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location access denied. Enter your city manually.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoError("Location unavailable (check your device's location service). Enter your city manually.");
        } else if (err.code === err.TIMEOUT) {
          setGeoError("Location request timed out. Enter your city manually.");
        } else {
          setGeoError("Could not obtain location. Enter your city manually.");
        }
      },
      {
        // Precisión baja = usa ubicación por red (más rápida y fiable en desktop sin GPS).
        enableHighAccuracy: false,
        maximumAge: 60000,
        timeout: 15000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setLocation, setGeoError]);
};