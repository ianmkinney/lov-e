import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { theme } from '@/constants/theme';
import { getMatchRecord } from '@/lib/historyStorage';
import type { MatchEvent } from '@/types';
import { ShotTimeline } from '@/components/ShotTimeline';
import { EventBadge } from '@/components/EventBadge';

export default function MatchReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const player = useVideoPlayer(
    videoUri ? { uri: videoUri } : { uri: '' },
    (p) => {
      p.loop = false;
    }
  );

  useEffect(() => {
    void (async () => {
      if (!id) return;
      const rec = await getMatchRecord(id);
      if (rec) {
        setEvents(rec.events);
        setVideoUri(rec.summary.videoUri ?? null);
      }
      setLoading(false);
    })();
  }, [id]);

  const seek = (ms: number) => {
    try {
      player.currentTime = ms / 1000;
    } catch {
      /* player not ready */
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Match review</Text>
      {videoUri ? (
        <VideoView
          style={styles.video}
          player={player}
          nativeControls
          contentFit="contain"
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.phText}>No local recording URI (simulator or permission).</Text>
        </View>
      )}

      <ShotTimeline events={events} onSeek={seek} />

      <Text style={styles.section}>Events</Text>
      {events.map((e) => (
        <View key={e.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.time}>{new Date(e.timestampMs).toLocaleTimeString()}</Text>
            <EventBadge shotType={e.shotType ?? null} landing={e.landingCall ?? null} />
          </View>
          {e.description ? <Text style={styles.desc}>{e.description}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32, backgroundColor: theme.bg, gap: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg },
  title: { color: theme.text, fontSize: 20, fontWeight: '800' },
  video: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', borderRadius: 12 },
  placeholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  phText: { color: theme.textMuted, textAlign: 'center' },
  section: { color: theme.textMuted, fontWeight: '700', marginTop: 8 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.surfaceMuted,
    gap: 6,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { color: theme.textMuted, fontSize: 12 },
  desc: { color: theme.text, fontSize: 13 },
});
