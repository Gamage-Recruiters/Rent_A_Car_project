import AsyncStorage from '@react-native-async-storage/async-storage';

// Centralized token retrieval with graceful fallback across likely keys
const TOKEN_KEYS = ['accessToken', 'customerToken', 'token'];

export const getAuthToken = async (): Promise<string | null> => {
  for (const key of TOKEN_KEYS) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        if (__DEV__) {
          console.log(`[authToken] Using token from ${key}; length=${value.length}`);
        }
        return value;
      }
      if (__DEV__) {
        console.log(`[authToken] No token found under key: ${key}`);
      }
    } catch (err) {
      console.warn(`[authToken] Error reading key ${key}:`, err);
    }
  }
  console.warn('[authToken] No auth token found in AsyncStorage');
  return null;
};
