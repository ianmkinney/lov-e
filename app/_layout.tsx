import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { theme } from '@/constants/theme';

export default function RootLayout() {
  useEffect(() => {
    if (__DEV__) {
      LogBox.ignoreLogs([
        'ExpoRouterToolbarModule',
        'RouterToolbarHostView',
        'RouterToolbarItemView',
      ]);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          contentStyle: { backgroundColor: theme.bg },
          /** Fabric-safe: ensure native stack gets booleans, not stringy route params */
          animationMatchesGesture: false,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          freezeOnBlur: false,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, title: 'Home' }}
        />
        <Stack.Screen name="match/setup" options={{ title: 'Match setup' }} />
        <Stack.Screen
          name="match/calibrate"
          options={{ title: 'Court calibration', orientation: 'landscape' }}
        />
        <Stack.Screen
          name="match/live"
          options={{ title: 'Live match', headerBackVisible: false, orientation: 'landscape' }}
        />
        <Stack.Screen name="match/[id]" options={{ title: 'Match review' }} />
        <Stack.Screen name="link/create" options={{ title: 'Create room' }} />
        <Stack.Screen name="link/join" options={{ title: 'Join room' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
