import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MatchEvent, StoredMatchSummary } from '@/types';

const HISTORY_KEY = 'love-v1-history';

type StoredRecord = {
  summary: StoredMatchSummary;
  events: MatchEvent[];
};

export async function loadHistory(): Promise<StoredRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendHistory(record: StoredRecord): Promise<void> {
  const prev = await loadHistory();
  const next = [record, ...prev].slice(0, 50);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export async function getMatchRecord(id: string): Promise<StoredRecord | null> {
  const all = await loadHistory();
  return all.find((r) => r.summary.id === id) ?? null;
}
