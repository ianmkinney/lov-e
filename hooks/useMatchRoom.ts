import { useEffect, useRef, useState, useCallback } from 'react';
import { subscribeMatchChannel } from '@/services/supabase/realtimeSync';
import type { RealtimeMessage } from '@/types';
import { isSupabaseConfigured } from '@/services/supabase/client';

export function useMatchRoom(
  roomCode: string | null,
  deviceId: string,
  onMessage?: (msg: RealtimeMessage) => void
) {
  const [connected, setConnected] = useState(false);
  const broadcastRef = useRef<(msg: RealtimeMessage) => void>(() => {});

  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!roomCode || !isSupabaseConfigured) {
      setConnected(false);
      return;
    }

    const { broadcast, unsubscribe } = subscribeMatchChannel(roomCode, deviceId, (msg) => {
      handlerRef.current?.(msg);
    });

    broadcastRef.current = broadcast;
    setConnected(true);

    return () => {
      unsubscribe();
      broadcastRef.current = () => {};
      setConnected(false);
    };
  }, [roomCode, deviceId]);

  const broadcast = useCallback((msg: RealtimeMessage) => {
    broadcastRef.current(msg);
  }, []);

  return { connected, broadcast };
}
