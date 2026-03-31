import { ScrollView, Pressable, Text, View, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import type { MatchEvent } from '@/types';
import { EventBadge } from './EventBadge';

type Props = {
  events: MatchEvent[];
  onSeek?: (videoOffsetMs: number) => void;
};

export function ShotTimeline({ events, onSeek }: Props) {
  const shots = events.filter((e) => e.type === 'landing_call' || e.type === 'shot');

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Shots & calls</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {shots.length === 0 ? (
          <Text style={styles.empty}>No tagged events yet</Text>
        ) : (
          shots.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => e.videoOffsetMs != null && onSeek?.(e.videoOffsetMs)}
              style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}
            >
              <EventBadge shotType={e.shotType ?? null} landing={e.landingCall ?? null} compact />
              {e.videoOffsetMs != null ? (
                <Text style={styles.time}>{(e.videoOffsetMs / 1000).toFixed(1)}s</Text>
              ) : null}
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  title: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
  row: { gap: 8, paddingVertical: 4 },
  chip: {
    backgroundColor: theme.surface,
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.surfaceMuted,
    marginRight: 8,
  },
  time: { color: theme.textMuted, fontSize: 10, marginTop: 4 },
  empty: { color: theme.textMuted, fontSize: 12 },
});
