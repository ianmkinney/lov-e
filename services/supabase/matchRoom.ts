/**
 * Uses Postgres table `match_rooms` in schema `public` (not `public_match_rooms`).
 * If Supabase reports that relation missing from the "schema cache", run
 * `supabase/migrations/20260330000000_initial.sql` in the project SQL Editor.
 */
import { supabase, isSupabaseConfigured } from './client';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function createRoomRow(params: {
  roomCode: string;
  hostId: string;
  matchId: string | null;
}): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') };
  }

  const { error } = await supabase.from('match_rooms').insert({
    room_code: params.roomCode,
    host_id: params.hostId,
    guest_id: null,
    match_id: params.matchId,
  });

  return { error: error ? new Error(error.message) : null };
}

export async function joinRoomRow(roomCode: string, guestId: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase not configured') };
  }

  const { data, error } = await supabase
    .from('match_rooms')
    .update({ guest_id: guestId })
    .eq('room_code', roomCode.toUpperCase())
    .is('guest_id', null)
    .select('id');

  if (error) return { error: new Error(error.message) };
  if (!data?.length) {
    return {
      error: new Error(
        'Could not join — room may be full or the code no longer matches. Ask the host to create a new room.'
      ),
    };
  }
  return { error: null };
}

export async function fetchRoom(roomCode: string) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const { data, error } = await supabase
    .from('match_rooms')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .maybeSingle();

  if (error) return { data: null, error: new Error(error.message) };
  return { data, error: null };
}
