import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * In-memory fallback when AsyncStorage native module isn't linked yet (or fails).
 * Prevents Supabase auth init from crashing the app on startup.
 */
const memory = new Map<string, string>();

export const safeAuthStorage = {
  getItem: async (key: string) => {
    try {
      const v = await AsyncStorage.getItem(key);
      if (v != null) return v;
    } catch {
      /* native module null / not ready */
    }
    return memory.get(key) ?? null;
  },
  setItem: async (key: string, value: string) => {
    memory.set(key, value);
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      /* persist in memory only */
    }
  },
  removeItem: async (key: string) => {
    memory.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
};
