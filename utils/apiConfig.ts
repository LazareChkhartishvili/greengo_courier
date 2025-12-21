// API Configuration for GreenGo Courier App
import { Platform } from 'react-native';

export const API_CONFIG = {
  // Development - NestJS Backend
  DEV: {
    // Android Emulator-ისთვის:
    ANDROID: 'http://10.0.2.2:3001/api',
    // iOS Simulator-ისთვის:
    IOS_SIMULATOR: 'http://localhost:3001/api',
    // Physical Device-ისთვის (თქვენი კომპიუტერის IP):
    // შეცვალეთ ეს IP თქვენი კომპიუტერის IP-ით
    IOS_DEVICE: 'http://172.20.10.4:3001/api',
  },

  // Production
  PROD: {
    BASE_URL: 'https://api.greengo.ge/api',
  },
};

// Get current API URL based on environment and platform
export const getApiUrl = () => {
  if (__DEV__) {
    // Auto-detect platform
    if (Platform.OS === 'android') {
      return API_CONFIG.DEV.ANDROID;
    } else if (Platform.OS === 'ios') {
      // For iOS: Use device IP for physical devices
      return API_CONFIG.DEV.IOS_DEVICE;
    }
    // Fallback to Android (most common)
    return API_CONFIG.DEV.ANDROID;
  }
  return API_CONFIG.PROD.BASE_URL;
};

// Get platform info for debugging
export const getApiInfo = () => {
  return {
    platform: Platform.OS,
    url: getApiUrl(),
    isDev: __DEV__,
  };
};

