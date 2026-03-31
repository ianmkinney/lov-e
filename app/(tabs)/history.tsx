import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { theme } from '@/constants/theme';
import { loadHistory } from '@/lib/historyStorage';
import type { StoredMatchSummary } from '@/types';

export default function HistoryScreen() {
  const [items, setItems] = useState<StoredMatchSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const rows = await loadHistory();
    setItems(rows.map((r) => r.summary));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No completed matches yet. Finish a match to see it here.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowTitle}>
              {item.mode === 'linked' ? 'Linked' : 'Solo'} · {new Date(item.startedAt).toLocaleString()}
            </Text>
            <Text style={styles.rowSub}>
              Sets {item.playerSets}–{item.opponentSets}
            </Text>
            <Text style={styles.link} onPress={() => router.push(`/match/${item.id}`)}>
              Open review →
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 16 },
  empty: { color: theme.textMuted, marginTop: 24, textAlign: 'center' },
  row: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.surfaceMuted,
  },
  rowTitle: { color: theme.text, fontWeight: '700', fontSize: 15 },
  rowSub: { color: theme.textMuted, marginTop: 4 },
  link: { color: theme.accent, marginTop: 10, fontWeight: '600' },
});
