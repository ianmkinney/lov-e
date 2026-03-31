import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>lov-e</Text>
        <Text style={styles.tagline}>AI line judge in your pocket</Text>
        <View style={styles.divider} />
        <Text style={styles.sub}>
          Point your phone at the court. The AI watches for forehands, backhands, serves — and calls
          balls in or out through your speaker. Link two phones for dual-agent verification.
        </Text>
      </View>

      <Link href="/match/setup" asChild>
        <Pressable style={styles.primary}>
          <Ionicons name="tennisball" size={20} color={theme.bg} style={{ marginRight: 10 }} />
          <Text style={styles.primaryText}>New match</Text>
        </Pressable>
      </Link>

      <Link href="/(tabs)/history" asChild>
        <Pressable style={styles.secondary}>
          <Ionicons name="time-outline" size={18} color={theme.text} style={{ marginRight: 8 }} />
          <Text style={styles.secondaryText}>Match history</Text>
        </Pressable>
      </Link>

      <Link href="/(tabs)/settings" asChild>
        <Pressable style={styles.ghost}>
          <Ionicons name="settings-outline" size={16} color={theme.textMuted} style={{ marginRight: 6 }} />
          <Text style={styles.ghostText}>Settings</Text>
        </Pressable>
      </Link>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Not a replacement for Hawk-Eye. Best with a steady mount and clear court view.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: theme.bg,
    gap: 14,
    justifyContent: 'center',
  },
  hero: { marginBottom: 12 },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: theme.ball,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.accent,
    marginTop: 2,
  },
  divider: {
    height: 2,
    backgroundColor: theme.surfaceMuted,
    marginVertical: 16,
    width: 60,
    borderRadius: 1,
  },
  sub: { color: theme.textMuted, fontSize: 14, lineHeight: 22 },
  primary: {
    backgroundColor: theme.ball,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryText: { color: theme.bg, fontSize: 18, fontWeight: '800' },
  secondary: {
    borderWidth: 1.5,
    borderColor: theme.surfaceMuted,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryText: { color: theme.text, fontSize: 16, fontWeight: '600' },
  ghost: {
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ghostText: { color: theme.textMuted, fontSize: 15 },
  footer: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.surfaceMuted,
  },
  footerText: { color: theme.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
