import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_API = 'love-openai-key';
const KEY_INTERVAL = 'love-capture-interval';

export async function loadOpenAiKey(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_API);
}

export async function saveOpenAiKey(key: string): Promise<void> {
  await AsyncStorage.setItem(KEY_API, key);
}

export async function loadCaptureInterval(): Promise<number | null> {
  const v = await AsyncStorage.getItem(KEY_INTERVAL);
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export async function saveCaptureInterval(ms: number): Promise<void> {
  await AsyncStorage.setItem(KEY_INTERVAL, String(ms));
}
