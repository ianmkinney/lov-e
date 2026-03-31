import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import type { ShotType } from '@/types';

type Props = {
  shotType?: ShotType | null;
  landing?: 'in' | 'out' | null;
  compact?: boolean;
};

export function EventBadge({ shotType, landing, compact }: Props) {
  const shotColor =
    shotType === 'forehand' || shotType === 'serve'
      ? theme.forehand
      : shotType
        ? theme.backhand
        : theme.textMuted;

  return (
    <View style={[styles.row, compact && styles.compact]}>
      {shotType ? (
        <View style={[styles.pill, { borderColor: shotColor }]}>
          <Text style={[styles.pillText, { color: shotColor }]}>{shotType}</Text>
        </View>
      ) : null}
      {landing ? (
        <View
          style={[
            styles.pill,
            { borderColor: landing === 'in' ? theme.inCall : theme.outCall },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              { color: landing === 'in' ? theme.inCall : theme.outCall },
            ]}
          >
            {landing.toUpperCase()}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  compact: { gap: 4 },
  pill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.bg,
  },
  pillText: { fontSize: 12, fontWeight: '600' },
});
