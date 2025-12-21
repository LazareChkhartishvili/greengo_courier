import { useCallback, useEffect, useRef } from 'react';
import { Location } from '../types';
import { apiService } from '../utils/api';

interface UseCourierLocationProps {
  courierId: string | null;
  driverLocation: Location;
  isOnline: boolean;
}

// Haversine formula to calculate distance in km
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useCourierLocation = ({
  courierId,
  driverLocation,
  isOnline,
}: UseCourierLocationProps) => {
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLocationRef = useRef<Location | null>(null);

  const updateLocation = useCallback(async () => {
    if (!courierId) return;

    // Only update if location changed significantly (more than 10 meters)
    const lastLocation = lastLocationRef.current;
    if (lastLocation) {
      const distance = calculateDistance(
        lastLocation.latitude,
        lastLocation.longitude,
        driverLocation.latitude,
        driverLocation.longitude
      );
      // Skip update if distance is less than 10 meters
      if (distance < 0.01) return;
    }

    try {
      await apiService.updateCourierLocation(
        courierId,
        driverLocation.latitude,
        driverLocation.longitude
      );
      lastLocationRef.current = { ...driverLocation };
    } catch (error) {
      console.error('Error updating courier location:', error);
    }
  }, [courierId, driverLocation.latitude, driverLocation.longitude]);

  useEffect(() => {
    if (!isOnline || !courierId) {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      return;
    }

    // Update location immediately
    updateLocation();

    // Update location every 10 seconds when online
    updateIntervalRef.current = setInterval(() => {
      updateLocation();
    }, 10000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [isOnline, courierId, updateLocation]);
};
