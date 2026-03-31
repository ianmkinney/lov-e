import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import type { MatchState } from '@/types';
import { formatScore } from '@/services/matchEngine';

type Props = {
  state: MatchState;
  compact?: boolean;
};

export function ScoreBoard({ state, compact }: Props) {
  return (
    <View style={[styles.card, compact && styles.compact]}>
      <View style={styles.row}>
        <Text style={styles.label}>You</Text>
        <Text style={styles.num}>{state.player.sets}</Text>
        <Text style={styles.sep}>—</Text>
        <Text style={styles.num}>{state.opponent.sets}</Text>
        <Text style={styles.label}>Opp</Text>
      </View>
      <Text style={styles.detail} numberOfLines={2}>
        {formatScore(state)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.surfaceMuted,
  },
  compact: { padding: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: { color: theme.textMuted, fontSize: 12, width: 36 },
  num: { color: theme.text, fontSize: 22, fontWeight: '700' },
  sep: { color: theme.textMuted },
  detail: { color: theme.accent, marginTop: 6, textAlign: 'center', fontSize: 12 },
});
