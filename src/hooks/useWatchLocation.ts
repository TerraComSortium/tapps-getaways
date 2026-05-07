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
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location access denied. Enter your city manually.");
        } else {
          setGeoError("Could not obtain location. Enter your city manually.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setLocation, setGeoError]);
};