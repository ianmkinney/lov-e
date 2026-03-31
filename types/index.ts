export type ShotType =
  | 'forehand'
  | 'backhand'
  | 'serve'
  | 'volley'
  | 'overhead';

export type Hitter = 'player' | 'opponent';

export interface FrameAnalysis {
  shotDetected: boolean;
  shotType: ShotType | null;
  hitter: Hitter | null;
  ballVisible: boolean;
  ballLanded: boolean;
  landingCall: 'in' | 'out' | null;
  confidence: number;
  description: string;
}

export interface CornerPoint {
  x: number;
  y: number;
}

export type MatchMode = 'solo' | 'linked';

export type MatchStatus = 'setup' | 'calibrating' | 'live' | 'ended' | 'review';

export interface PlayerScore {
  points: number;
  games: number;
  sets: number;
}

export interface TiebreakState {
  active: boolean;
  playerPoints: number;
  opponentPoints: number;
}

export interface MatchState {
  player: PlayerScore;
  opponent: PlayerScore;
  serving: Hitter;
  isDeuce: boolean;
  advantage: Hitter | null;
  currentSet: number;
  maxSets: number;
  tiebreak: TiebreakState;
  /** Last point winner for display */
  lastPointWinner: Hitter | null;
}

export type MatchEventType =
  | 'shot'
  | 'landing_call'
  | 'point'
  | 'game'
  | 'set'
  | 'match_end'
  | 'system';

export interface MatchEvent {
  id: string;
  matchId: string;
  timestampMs: number;
  videoOffsetMs?: number;
  type: MatchEventType;
  shotType?: ShotType | null;
  landingCall?: 'in' | 'out' | null;
  hitter?: Hitter | null;
  confidence?: number;
  contested?: boolean;
  description?: string;
  frameUri?: string | null;
}

export interface RoomParticipant {
  id: string;
  displayName: string;
  role: 'host' | 'guest';
}

export interface MatchRoom {
  roomCode: string;
  matchId: string | null;
  hostId: string;
  guestId: string | null;
  createdAt: string;
}

export type BroadcastEventType =
  | 'ai_frame_result'
  | 'verified_call'
  | 'heartbeat'
  | 'peer_joined'
  | 'peer_left';

export interface AIBroadcastPayload {
  sourceDeviceId: string;
  timestampMs: number;
  analysis: FrameAnalysis;
  sequence: number;
}

export interface VerifiedCallPayload {
  finalCall: 'in' | 'out' | 'contested';
  confidence: number;
  localConfidence: number;
  remoteConfidence: number;
  reason: string;
  timestampMs: number;
}

export interface RealtimeMessage {
  type: BroadcastEventType;
  payload: AIBroadcastPayload | VerifiedCallPayload | { message: string };
}

export interface StoredMatchSummary {
  id: string;
  startedAt: string;
  endedAt: string | null;
  playerSets: number;
  opponentSets: number;
  mode: MatchMode;
  videoUri?: string | null;
}
