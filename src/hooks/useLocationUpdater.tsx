// src/hooks/useLocationUpdater.ts
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { updateLocation } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';

export default function useLocationUpdater() {
  const [locationStatus, setLocationStatus] = useState<'active' | 'error'>('error');
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      console.warn("User not ready yet, skipping location updater");
      return;
    }

    let interval: NodeJS.Timeout;

    const startUpdating = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationStatus('error');
          return;
        }

        setLocationStatus('active');

        interval = setInterval(async () => {
          try {
            const loc = await Location.getCurrentPositionAsync({});
            await updateLocation({
              user_id: user.id,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
            console.log("📡 Location updated:", loc.coords);
          } catch (err) {
            console.error("Error updating location:", err);
            setLocationStatus('error');
          }
        }, 10000); // every 10 sec
      } catch (err) {
        console.error("Error requesting location permissions:", err);
        setLocationStatus('error');
      }
    };

    startUpdating();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user?.id]); // ⬅️ react to user id ready

  return { locationStatus };
}
