import { useState, useEffect, useMemo } from "react";
import * as Location from "expo-location";
import { Location as LocationType } from "../types";
import { DEFAULT_LOCATION } from "../utils/location";

export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const driverLocation = useMemo<LocationType>(() => {
    return location
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      : DEFAULT_LOCATION;
  }, [location]);

  const mapRegion = useMemo(() => {
    if (location) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    return {
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [location]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const locationData = await Location.getCurrentPositionAsync({});
        setLocation(locationData);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    location,
    driverLocation,
    mapRegion,
    isLoading,
    refreshLocation: requestLocationPermission,
  };
};

