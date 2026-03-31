import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { useMatchStore } from '@/stores/matchStore';

export default function MatchSetupScreen() {
  const setMode = useMatchStore((s) => s.setMode);
  const resetMatch = useMatchStore((s) => s.resetMatch);

  return (
    <View style={styles.container}>
      <Text style={styles.lead}>Choose how you want to play.</Text>

      <Pressable
        style={styles.card}
        onPress={() => {
          resetMatch();
          setMode('solo');
          router.push('/match/calibrate');
        }}
      >
        <Text style={styles.cardTitle}>Solo</Text>
        <Text style={styles.cardBody}>One phone on court. AI analyzes your feed only.</Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => {
          resetMatch();
          setMode('linked');
          router.push('/link/create');
        }}
      >
        <Text style={styles.cardTitle}>Link phone (host)</Text>
        <Text style={styles.cardBody}>Create a 6-character room code for the other phone.</Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => {
          resetMatch();
          setMode('linked');
          router.push('/link/join');
        }}
      >
        <Text style={styles.cardTitle}>Join room</Text>
        <Text style={styles.cardBody}>Enter the host&apos;s code, then calibrate on your side.</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.bg, gap: 14 },
  lead: { color: theme.textMuted, marginBottom: 8, fontSize: 15 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.surfaceMuted,
    gap: 6,
  },
  cardTitle: { color: theme.text, fontSize: 18, fontWeight: '700' },
  cardBody: { color: theme.textMuted, fontSize: 14, lineHeight: 20 },
});
