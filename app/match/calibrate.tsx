import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import type { CornerPoint } from '@/types';
import { theme } from '@/constants/theme';
import { useMatchStore } from '@/stores/matchStore';
import { CourtOverlay } from '@/components/CourtOverlay';

const LABELS = ['Top-left', 'Top-right', 'Bottom-right', 'Bottom-left'];

export default function CalibrateScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [corners, setCorners] = useState<CornerPoint[]>([]);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const setCalibration = useMatchStore((s) => s.setCalibration);
  const setStatus = useMatchStore((s) => s.setStatus);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });
  };

  const onTap = (x: number, y: number) => {
    if (corners.length >= 4) return;
    const nx = x / layout.width;
    const ny = y / layout.height;
    setCorners((c) => [...c, { x: nx, y: ny }]);
  };

  const undo = () => setCorners((c) => c.slice(0, -1));

  const continueMatch = () => {
    if (corners.length !== 4) return;
    setCalibration(corners);
    setStatus('calibrating');
    router.push('/match/live');
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>Checking camera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>Camera required to calibrate the court in view.</Text>
        <Pressable style={styles.btn} onPress={() => void requestPermission()}>
          <Text style={styles.btnText}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.instructions}>
        Tap the four corners of the court in order: {LABELS[corners.length] ?? 'done'}.
      </Text>
      <View style={styles.cameraWrap} onLayout={onLayout}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={(ev) => {
            const { locationX, locationY } = ev.nativeEvent;
            onTap(locationX, locationY);
          }}
        >
          <CameraView style={styles.camera} facing="back" />
          {layout.width > 0 ? (
            <CourtOverlay
              corners={corners}
              width={layout.width}
              height={layout.height}
              calibrationMode
            />
          ) : null}
        </Pressable>
      </View>
      <View style={styles.footer}>
        <Text style={styles.count}>{corners.length}/4 corners</Text>
        <View style={styles.row}>
          <Pressable style={styles.secondary} onPress={undo} disabled={corners.length === 0}>
            <Text style={styles.secondaryText}>Undo</Text>
          </Pressable>
          <Pressable
            style={[styles.primary, corners.length !== 4 && { opacity: 0.5 }]}
            onPress={continueMatch}
            disabled={corners.length !== 4}
          >
            <Text style={styles.primaryText}>Start match</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.bg },
  instructions: { color: theme.text, padding: 16, fontSize: 15 },
  cameraWrap: { flex: 1, position: 'relative' },
  camera: { flex: 1 },
  footer: { padding: 16, gap: 10 },
  count: { color: theme.textMuted },
  row: { flexDirection: 'row', gap: 12 },
  primary: {
    flex: 1,
    backgroundColor: theme.surfaceMuted,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: { color: theme.text, fontWeight: '700' },
  secondary: {
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.surfaceMuted,
  },
  secondaryText: { color: theme.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  hint: { color: theme.textMuted, textAlign: 'center' },
  btn: {
    backgroundColor: theme.surfaceMuted,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: theme.text, fontWeight: '600' },
});
