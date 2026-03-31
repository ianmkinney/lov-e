import { useCallback } from 'react';
import { speakInOut, speakShot, stopSpeaking, type AnnouncerOptions } from '@/services/announcer';

export function useAnnouncer(defaults?: AnnouncerOptions) {
  const announceCall = useCallback(
    (call: 'in' | 'out' | 'contested', opts?: AnnouncerOptions) => {
      speakInOut(call, { ...defaults, ...opts });
    },
    [defaults]
  );

  const announceShot = useCallback(
    (text: string, opts?: AnnouncerOptions) => {
      speakShot(text, { ...defaults, ...opts });
    },
    [defaults]
  );

  const stop = useCallback(() => {
    stopSpeaking();
  }, []);

  return { announceCall, announceShot, stop };
}
