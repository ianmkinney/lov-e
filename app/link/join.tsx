import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { useMatchStore } from '@/stores/matchStore';
import { joinRoomRow, fetchRoom } from '@/services/supabase/matchRoom';
import { isSupabaseConfigured } from '@/services/supabase/client';

export default function JoinRoomScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const setRoomCode = useMatchStore((s) => s.setRoomCode);
  const deviceId = useMatchStore((s) => s.session.deviceId);

  const join = async () => {
    const c = code.trim().toUpperCase();
    if (c.length !== 6) {
      setError('Enter a 6-character code.');
      return;
    }
    setError(null);
    if (isSupabaseConfigured) {
      const { data, error: fetchErr } = await fetchRoom(c);
      if (fetchErr || !data) {
        setError('Room not found. Check the code or host must create first.');
        return;
      }
      const { error: joinErr } = await joinRoomRow(c, deviceId);
      if (joinErr) {
        setError(joinErr.message);
        return;
      }
    }
    setRoomCode(c);
    router.push('/match/calibrate');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.lead}>Type the host&apos;s 6-character code.</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="characters"
          maxLength={6}
          placeholder="ABC12D"
          placeholderTextColor={theme.textMuted}
          value={code}
          onChangeText={setCode}
        />
        {error ? <Text style={styles.err}>{error}</Text> : null}
        <Pressable style={styles.primary} onPress={() => void join()}>
          <Text style={styles.primaryText}>Join & calibrate</Text>
        </Pressable>
        {!isSupabaseConfigured ? (
          <Text style={styles.warn}>
            Supabase env vars not set — join still works locally with the same code on both phones for UI demo;
            realtime needs EXPO_PUBLIC_SUPABASE_* in .env
          </Text>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  lead: { color: theme.textMuted, fontSize: 15 },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.surfaceMuted,
    borderRadius: 12,
    padding: 14,
    color: theme.text,
    fontSize: 22,
    letterSpacing: 4,
    textAlign: 'center',
  },
  err: { color: theme.danger },
  primary: {
    backgroundColor: theme.surfaceMuted,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryText: { color: theme.text, fontWeight: '700', fontSize: 16 },
  warn: { color: theme.contested, fontSize: 12, lineHeight: 18, marginTop: 12 },
});
