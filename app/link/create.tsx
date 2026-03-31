import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { useMatchStore } from '@/stores/matchStore';
import { generateRoomCode, createRoomRow } from '@/services/supabase/matchRoom';
import { isSupabaseConfigured } from '@/services/supabase/client';

export default function CreateRoomScreen() {
  const [code, setCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useMatchStore((s) => s.session);
  const setRoomCode = useMatchStore((s) => s.setRoomCode);

  const create = async () => {
    setSaving(true);
    setError(null);
    try {
      const c = generateRoomCode();
      if (isSupabaseConfigured) {
        const { error: rowErr } = await createRoomRow({
          roomCode: c,
          hostId: session.deviceId,
          matchId: null,
        });
        if (rowErr) {
          setError(rowErr.message);
          return;
        }
      }
      setCode(c);
      setRoomCode(c);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.lead}>Share this code with the other phone. Both devices calibrate separately.</Text>

      {error ? <Text style={styles.err}>{error}</Text> : null}
      {!code ? (
        <Pressable style={styles.primary} onPress={() => void create()} disabled={saving}>
          {saving ? <ActivityIndicator color={theme.text} /> : <Text style={styles.primaryText}>Generate code</Text>}
        </Pressable>
      ) : (
        <>
          <Text style={styles.code}>{code}</Text>
          <Pressable
            style={styles.primary}
            onPress={() => {
              router.push('/match/calibrate');
            }}
          >
            <Text style={styles.primaryText}>Continue to calibration</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.bg, gap: 16 },
  lead: { color: theme.textMuted, fontSize: 15, lineHeight: 22 },
  primary: {
    backgroundColor: theme.surfaceMuted,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryText: { color: theme.text, fontWeight: '700', fontSize: 16 },
  err: { color: theme.danger, fontSize: 14, lineHeight: 20 },
  code: {
    fontSize: 40,
    letterSpacing: 6,
    fontWeight: '800',
    color: theme.accent,
    textAlign: 'center',
  },
});
