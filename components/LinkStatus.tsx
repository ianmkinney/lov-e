import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

type Props = {
  connected: boolean;
  roomCode?: string | null;
};

export function LinkStatus({ connected, roomCode }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: connected ? theme.inCall : theme.danger }]} />
      <Text style={styles.text}>
        {connected ? 'Realtime' : 'Offline'}
        {roomCode ? ` · ${roomCode}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { color: theme.textMuted, fontSize: 12 },
});
