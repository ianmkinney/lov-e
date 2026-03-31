import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutChangeEvent,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import type { RealtimeMessage, VerifiedCallPayload } from '@/types';
import { theme } from '@/constants/theme';
import { useMatchStore } from '@/stores/matchStore';
import { LovECameraView } from '@/components/CameraView';
import { CourtOverlay } from '@/components/CourtOverlay';
import { ScoreBoard } from '@/components/ScoreBoard';
import { EventBadge } from '@/components/EventBadge';
import { LinkStatus } from '@/components/LinkStatus';
import { useFrameAnalysis } from '@/hooks/useFrameAnalysis';
import { useMatchRoom } from '@/hooks/useMatchRoom';
import { useAnnouncer } from '@/hooks/useAnnouncer';
import { appendHistory } from '@/lib/historyStorage';

export default function LiveMatchScreen() {
  const session = useMatchStore((s) => s.session);
  const matchState = useMatchStore((s) => s.matchState);
  const lastAnalysis = useMatchStore((s) => s.lastAnalysis);
  const captureIntervalMs = useMatchStore((s) => s.captureIntervalMs);
  const calibration = useMatchStore((s) => s.calibration);
  const events = useMatchStore((s) => s.events);
  const beginMatch = useMatchStore((s) => s.beginMatch);
  const endMatch = useMatchStore((s) => s.endMatch);
  const setVideoUri = useMatchStore((s) => s.setVideoUri);
  const resetMatch = useMatchStore((s) => s.resetMatch);

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [busy, setBusy] = useState(false);
  const ingestRemoteRef = useRef<(m: RealtimeMessage) => void>(() => {});

  const { announceCall } = useAnnouncer();

  const mode = session.mode === 'linked' ? 'linked' : 'solo';

  const applyPoint = useMatchStore((s) => s.applyPointFromCall);

  const onVerified = useCallback(
    (v: VerifiedCallPayload) => {
      if (v.finalCall === 'contested') {
        announceCall('contested');
      } else {
        announceCall(v.finalCall);
        const hitter = lastAnalysis?.hitter ?? 'opponent';
        applyPoint(v.finalCall, hitter);
      }
    },
    [announceCall, applyPoint, lastAnalysis?.hitter]
  );

  const onRoomMessage = useCallback(
    (msg: RealtimeMessage) => {
      ingestRemoteRef.current(msg);
      if (msg.type === 'verified_call' && mode === 'linked') {
        const p = msg.payload as VerifiedCallPayload;
        if (p.finalCall === 'contested') announceCall('contested');
        else announceCall(p.finalCall);
      }
    },
    [announceCall, mode]
  );

  const { connected, broadcast } = useMatchRoom(session.roomCode, session.deviceId, onRoomMessage);

  const { processLocalFrame, ingestRemote } = useFrameAnalysis(
    mode,
    session.roomCode,
    session.deviceId,
    broadcast,
    onVerified
  );

  useEffect(() => {
    ingestRemoteRef.current = ingestRemote;
  }, [ingestRemote]);

  useEffect(() => {
    beginMatch();
  }, [beginMatch]);

  const onFrame = useCallback(
    async (b64: string) => {
      setBusy(true);
      try {
        await processLocalFrame(b64);
      } finally {
        setBusy(false);
      }
    },
    [processLocalFrame]
  );

  const onRecordingFinished = useCallback(
    (uri: string) => {
      setVideoUri(uri);
    },
    [setVideoUri]
  );

  const finish = useCallback(async () => {
    endMatch();
    const id = session.id;
    const endedAt = new Date().toISOString();
    await appendHistory({
      summary: {
        id,
        startedAt: session.startedAt ? new Date(session.startedAt).toISOString() : endedAt,
        endedAt,
        playerSets: matchState.player.sets,
        opponentSets: matchState.opponent.sets,
        mode: session.mode,
        videoUri: session.videoUri,
      },
      events,
    });
    router.replace(`/match/${id}`);
    resetMatch();
  }, [endMatch, events, matchState.opponent.sets, matchState.player.sets, resetMatch, session]);

  const cameraBlock = useMemo(
    () => (
      <View style={styles.cameraBlock} onLayout={(e: LayoutChangeEvent) => setLayout(e.nativeEvent.layout)}>
        <LovECameraView
          isRecording
          captureIntervalMs={captureIntervalMs}
          onFrame={onFrame}
          onRecordingFinished={onRecordingFinished}
        />
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {layout.width > 0 ? (
            <CourtOverlay corners={calibration} width={layout.width} height={layout.height} />
          ) : null}
        </View>
      </View>
    ),
    [calibration, captureIntervalMs, layout.height, layout.width, onFrame, onRecordingFinished]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <ScoreBoard state={matchState} compact />
        {mode === 'linked' ? <LinkStatus connected={connected} roomCode={session.roomCode} /> : null}
      </View>

      {cameraBlock}

      <View style={styles.panel}>
        {busy ? <ActivityIndicator color={theme.accent} /> : null}
        <EventBadge
          shotType={lastAnalysis?.shotType ?? null}
          landing={lastAnalysis?.landingCall ?? null}
        />
        <Text style={styles.ai} numberOfLines={3}>
          {lastAnalysis?.description ?? 'Point the camera at the court.'}
        </Text>
        <Pressable style={styles.endBtn} onPress={() => void finish()}>
          <Text style={styles.endText}>End match</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  topBar: { paddingHorizontal: 12, paddingTop: 4, gap: 8 },
  cameraBlock: { flex: 1, position: 'relative' },
  panel: {
    padding: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.surfaceMuted,
    backgroundColor: theme.surface,
  },
  ai: { color: theme.textMuted, fontSize: 13 },
  endBtn: {
    backgroundColor: theme.danger,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  endText: { color: theme.text, fontWeight: '700' },
});
