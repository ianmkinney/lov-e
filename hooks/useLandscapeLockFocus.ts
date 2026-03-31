import { useCallback } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFocusEffect } from 'expo-router';

async function lockLandscape() {
  try {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  } catch {
    /* web / unsupported */
  }
}

async function restorePortrait() {
  try {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  } catch {
    try {
      await ScreenOrientation.unlockAsync();
    } catch {
      /* noop */
    }
  }
}

/**
 * Locks landscape while this screen is focused (must run inside a screen under the navigator).
 * Restores portrait when the screen blurs (e.g. back to setup).
 */
export function useLandscapeLockFocus() {
  useFocusEffect(
    useCallback(() => {
      void lockLandscape();
      return () => {
        void restorePortrait();
      };
    }, [])
  );
}
