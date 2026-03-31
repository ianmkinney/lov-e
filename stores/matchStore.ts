import { create } from 'zustand';
import type {
  CornerPoint,
  FrameAnalysis,
  MatchEvent,
  MatchMode,
  MatchState,
  MatchStatus,
} from '@/types';
import { createInitialMatchState, awardPoint } from '@/services/matchEngine';
import type { Hitter } from '@/types';

const genId = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface MatchSession {
  id: string;
  mode: MatchMode;
  status: MatchStatus;
  roomCode: string | null;
  deviceId: string;
  startedAt: number | null;
  videoUri: string | null;
}

interface MatchStore {
  session: MatchSession;
  calibration: CornerPoint[];
  matchState: MatchState;
  events: MatchEvent[];
  lastAnalysis: FrameAnalysis | null;
  captureIntervalMs: number;
  openAiKey: string | null;

  setMode: (mode: MatchMode) => void;
  setStatus: (status: MatchStatus) => void;
  setRoomCode: (code: string | null) => void;
  setCalibration: (corners: CornerPoint[]) => void;
  resetMatch: () => void;
  beginMatch: () => void;
  endMatch: () => void;
  setVideoUri: (uri: string | null) => void;
  addEvent: (e: Omit<MatchEvent, 'id' | 'matchId'> & { id?: string }) => void;
  setLastAnalysis: (a: FrameAnalysis | null) => void;
  applyPointFromCall: (call: 'in' | 'out', hitter: Hitter) => void;
  setCaptureIntervalMs: (ms: number) => void;
  setOpenAiKey: (key: string | null) => void;
}

const defaultSession = (): MatchSession => ({
  id: genId(),
  mode: 'solo',
  status: 'setup',
  roomCode: null,
  deviceId: `d-${Math.random().toString(36).slice(2, 11)}`,
  startedAt: null,
  videoUri: null,
});

export const useMatchStore = create<MatchStore>((set, get) => ({
  session: defaultSession(),
  calibration: [],
  matchState: createInitialMatchState(),
  events: [],
  lastAnalysis: null,
  captureIntervalMs: 2000,
  openAiKey: null,

  setMode: (mode) =>
    set((s) => ({ session: { ...s.session, mode } })),

  setStatus: (status) =>
    set((s) => ({ session: { ...s.session, status } })),

  setRoomCode: (roomCode) =>
    set((s) => ({ session: { ...s.session, roomCode } })),

  setCalibration: (calibration) => set({ calibration }),

  resetMatch: () =>
    set({
      session: defaultSession(),
      calibration: [],
      matchState: createInitialMatchState(),
      events: [],
      lastAnalysis: null,
    }),

  beginMatch: () =>
    set((s) => ({
      session: {
        ...s.session,
        status: 'live',
        startedAt: Date.now(),
        id: s.session.id || genId(),
      },
    })),

  endMatch: () =>
    set((s) => ({
      session: { ...s.session, status: 'ended' },
    })),

  setVideoUri: (videoUri) =>
    set((s) => ({ session: { ...s.session, videoUri } })),

  addEvent: (e) => {
    const matchId = get().session.id;
    const id = e.id ?? `${matchId}-ev-${Date.now()}`;
    const full: MatchEvent = { ...e, id, matchId };
    set((s) => ({ events: [...s.events, full] }));
  },

  setLastAnalysis: (lastAnalysis) => set({ lastAnalysis }),

  applyPointFromCall: (call, hitter) => {
    // Heuristic: "in" keeps rally; only award point on clear "out" by opponent side — demo: out on opponent shot = player point
    if (call !== 'out') return;
    const winner: Hitter = hitter === 'opponent' ? 'player' : 'opponent';
    set((s) => ({
      matchState: awardPoint(s.matchState, winner),
    }));
    get().addEvent({
      timestampMs: Date.now(),
      type: 'point',
      description: `Call out — point ${winner === 'player' ? 'you' : 'opponent'}`,
    });
  },

  setCaptureIntervalMs: (captureIntervalMs) => set({ captureIntervalMs }),

  setOpenAiKey: (openAiKey) => set({ openAiKey }),
}));
