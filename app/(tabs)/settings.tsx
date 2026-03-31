import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useMatchStore } from '@/stores/matchStore';
import { loadOpenAiKey, loadCaptureInterval, saveOpenAiKey, saveCaptureInterval } from '@/lib/settingsStorage';

export default function SettingsScreen() {
  const setKey = useMatchStore((s) => s.setOpenAiKey);
  const setIntervalMs = useMatchStore((s) => s.setCaptureIntervalMs);
  const captureIntervalMs = useMatchStore((s) => s.captureIntervalMs);

  const [apiKey, setApiKey] = useState('');
  const [intervalStr, setIntervalStr] = useState(String(captureIntervalMs));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const k = await loadOpenAiKey();
      const i = await loadCaptureInterval();
      if (k) {
        setApiKey(k);
        setKey(k);
      }
      if (i) {
        setIntervalStr(String(i));
        setIntervalMs(i);
      }
    })();
  }, [setKey, setIntervalMs]);

  const persist = async () => {
    await saveOpenAiKey(apiKey.trim());
    setKey(apiKey.trim() || null);
    const n = parseInt(intervalStr, 10);
    if (Number.isFinite(n) && n >= 1200) {
      await saveCaptureInterval(n);
      setIntervalMs(n);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>OpenAI API key</Text>
        <Text style={styles.hint}>
          Used for GPT-4o Vision frame analysis. Stored on this device only. You can also set
          EXPO_PUBLIC_OPENAI_API_KEY for dev builds.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="sk-..."
          placeholderTextColor={theme.textMuted}
          secureTextEntry
          autoCapitalize="none"
          value={apiKey}
          onChangeText={setApiKey}
        />

        <Text style={styles.title}>Capture interval (ms)</Text>
        <Text style={styles.hint}>Higher = lower API cost. Minimum 1200 ms.</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={intervalStr}
          onChangeText={setIntervalStr}
        />

        <Text style={styles.title}>Voice</Text>
        <Text style={styles.hint}>
          In/out calls use the system TTS voice (expo-speech). OS settings control voice selection.
        </Text>

        <Text style={styles.title}>Profile</Text>
        <Text style={styles.hint}>Display name and cloud profile sync can be wired to Supabase auth later.</Text>

        <Pressable style={styles.btn} onPress={() => void persist()}>
          <Text style={styles.btnText}>{saved ? 'Saved' : 'Save'}</Text>
        </Pressable>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Expectations</Text>
          <Text style={styles.disclaimerBody}>
            Single-camera snapshots are not line judges. Use lov-e for fun and practice feedback — not officiated
            competition.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, backgroundColor: theme.bg, gap: 8 },
  title: { color: theme.text, fontSize: 16, fontWeight: '700', marginTop: 12 },
  hint: { color: theme.textMuted, fontSize: 13, lineHeight: 18 },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.surfaceMuted,
    borderRadius: 10,
    padding: 12,
    color: theme.text,
    marginTop: 6,
  },
  btn: {
    backgroundColor: theme.surfaceMuted,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  btnText: { color: theme.text, fontWeight: '700', fontSize: 16 },
  disclaimer: {
    marginTop: 28,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.contested,
    backgroundColor: theme.surface,
  },
  disclaimerTitle: { color: theme.contested, fontWeight: '700', marginBottom: 6 },
  disclaimerBody: { color: theme.textMuted, lineHeight: 20, fontSize: 13 },
});
