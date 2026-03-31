import { useEffect, useRef, type ComponentRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '@/constants/theme';

type Props = {
  isRecording: boolean;
  captureIntervalMs: number;
  onFrame: (base64: string) => void;
  onRecordingFinished?: (uri: string) => void;
};

export function LovECameraView({
  isRecording,
  captureIntervalMs,
  onFrame,
  onRecordingFinished,
}: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<ComponentRef<typeof CameraView>>(null);

  useEffect(() => {
    if (!permission?.granted || !isRecording) return;

    let cancelled = false;
    const start = () => {
      const cam = ref.current;
      if (!cam) {
        requestAnimationFrame(start);
        return;
      }
      const recPromise = cam.recordAsync({ maxDuration: 3600 });
      recPromise
        .then((res) => {
          if (!cancelled && res?.uri) onRecordingFinished?.(res.uri);
        })
        .catch(() => {});
    };

    start();

    return () => {
      cancelled = true;
      try {
        ref.current?.stopRecording();
      } catch {
        /* noop */
      }
    };
  }, [isRecording, permission?.granted, onRecordingFinished]);

  useEffect(() => {
    if (!permission?.granted || !isRecording) return;

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const arm = () => {
      const cam = ref.current;
      if (!cam) {
        requestAnimationFrame(arm);
        return;
      }
      const tick = async () => {
        if (cancelled) return;
        try {
          const photo = await cam.takePictureAsync({
            base64: true,
            quality: 0.35,
            skipProcessing: true,
          });
          if (!cancelled && photo?.base64) onFrame(photo.base64);
        } catch {
          /* concurrent capture may fail on some devices */
        }
      };
      void tick();
      intervalId = setInterval(tick, Math.max(1200, captureIntervalMs));
    };

    arm();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRecording, permission?.granted, captureIntervalMs, onFrame]);

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
        <Text style={styles.hint}>Camera access is needed to record and analyze.</Text>
        <Pressable style={styles.btn} onPress={() => void requestPermission()}>
          <Text style={styles.btnText}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <CameraView ref={ref} style={styles.camera} mode="video" facing="back" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: theme.bg,
    gap: 12,
  },
  hint: { color: theme.textMuted, textAlign: 'center' },
  btn: {
    backgroundColor: theme.surfaceMuted,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: theme.text, fontWeight: '600' },
});
