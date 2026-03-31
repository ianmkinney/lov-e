import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './client';
import type { RealtimeMessage } from '@/types';

export type RealtimeHandler = (msg: RealtimeMessage) => void;

export function subscribeMatchChannel(
  roomCode: string,
  _deviceId: string,
  onMessage: RealtimeHandler
): {
  channel: RealtimeChannel | null;
  broadcast: (msg: RealtimeMessage) => void;
  unsubscribe: () => void;
} {
  if (!isSupabaseConfigured || !supabase) {
    return {
      channel: null,
      broadcast: () => {},
      unsubscribe: () => {},
    };
  }

  const topic = `match:${roomCode.toUpperCase()}`;
  const channel = supabase.channel(topic, {
    config: { broadcast: { self: true } },
  });

  channel.on('broadcast', { event: 'msg' }, (payload) => {
    try {
      const parsed = payload.payload as RealtimeMessage;
      if (parsed && typeof parsed === 'object' && 'type' in parsed) {
        onMessage(parsed);
      }
    } catch {
      /* ignore */
    }
  });

  channel.subscribe();

  const broadcast = (msg: RealtimeMessage) => {
    void channel.send({
      type: 'broadcast',
      event: 'msg',
      payload: msg,
    });
  };

  return {
    channel,
    broadcast,
    unsubscribe: () => {
      if (supabase) void supabase.removeChannel(channel);
    },
  };
}
