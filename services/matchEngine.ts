import type { Hitter, MatchEvent, MatchState, PlayerScore } from '@/types';
import {
  GAMES_TO_WIN_SET,
  MAX_SETS_BEST_OF_3,
  TIEBREAK_POINTS_TO_WIN,
  POINT_NAMES,
} from '@/constants/tennis';

function initialPlayer(): PlayerScore {
  return { points: 0, games: 0, sets: 0 };
}

function cloneState(s: MatchState): MatchState {
  return JSON.parse(JSON.stringify(s)) as MatchState;
}

function resetGame(state: MatchState) {
  state.player.points = 0;
  state.opponent.points = 0;
  state.isDeuce = false;
  state.advantage = null;
}

export function createInitialMatchState(maxSets: number = MAX_SETS_BEST_OF_3): MatchState {
  return {
    player: initialPlayer(),
    opponent: initialPlayer(),
    serving: 'player',
    isDeuce: false,
    advantage: null,
    currentSet: 1,
    maxSets,
    tiebreak: { active: false, playerPoints: 0, opponentPoints: 0 },
    lastPointWinner: null,
  };
}

function maybeStartTiebreak(state: MatchState) {
  if (state.player.games === GAMES_TO_WIN_SET && state.opponent.games === GAMES_TO_WIN_SET) {
    state.tiebreak.active = true;
    state.tiebreak.playerPoints = 0;
    state.tiebreak.opponentPoints = 0;
  }
}

function maybeCompleteSetFromGames(state: MatchState) {
  const pg = state.player.games;
  const og = state.opponent.games;
  const diff = Math.abs(pg - og);
  const maxG = Math.max(pg, og);
  if (maxG >= GAMES_TO_WIN_SET && diff >= 2) {
    const setWinner: Hitter = pg > og ? 'player' : 'opponent';
    if (setWinner === 'player') state.player.sets += 1;
    else state.opponent.sets += 1;
    state.player.games = 0;
    state.opponent.games = 0;
    resetGame(state);
    state.currentSet += 1;
  }
}

function tiebreakPoint(state: MatchState, winner: Hitter) {
  if (winner === 'player') state.tiebreak.playerPoints += 1;
  else state.tiebreak.opponentPoints += 1;

  const tp = state.tiebreak.playerPoints;
  const to = state.tiebreak.opponentPoints;
  const hi = Math.max(tp, to);
  const diff = Math.abs(tp - to);
  const leader: Hitter = tp > to ? 'player' : 'opponent';

  if (hi >= TIEBREAK_POINTS_TO_WIN && diff >= 2) {
    if (leader === 'player') state.player.games += 1;
    else state.opponent.games += 1;
    state.tiebreak.active = false;
    state.tiebreak.playerPoints = 0;
    state.tiebreak.opponentPoints = 0;
    maybeCompleteSetFromGames(state);
  }
}

/**
 * Award a point to `winner` (simplified tennis: games/sets, tiebreak at 6-6).
 */
export function awardPoint(state: MatchState, winner: Hitter): MatchState {
  const next = cloneState(state);
  next.lastPointWinner = winner;

  if (next.tiebreak.active) {
    tiebreakPoint(next, winner);
    return next;
  }

  const w = winner === 'player' ? next.player : next.opponent;
  const l = winner === 'player' ? next.opponent : next.player;

  if (next.isDeuce) {
    if (next.advantage === null) {
      next.advantage = winner;
    } else if (next.advantage === winner) {
      w.games += 1;
      resetGame(next);
      maybeStartTiebreak(next);
      maybeCompleteSetFromGames(next);
    } else {
      next.advantage = null;
    }
    return next;
  }

  w.points += 1;

  if (w.points >= 4 && l.points < 3) {
    w.games += 1;
    resetGame(next);
    maybeStartTiebreak(next);
    maybeCompleteSetFromGames(next);
    return next;
  }

  if (w.points >= 3 && l.points >= 3) {
    next.isDeuce = true;
    next.advantage = null;
  }

  return next;
}

function pointsToIndex(p: number): number {
  return Math.min(p, POINT_NAMES.length - 1);
}

export function formatScore(state: MatchState): string {
  const p = state.player;
  const o = state.opponent;
  if (state.tiebreak.active) {
    return `${state.tiebreak.playerPoints}-${state.tiebreak.opponentPoints} TB`;
  }
  if (state.isDeuce) {
    if (state.advantage === 'player') return `Sets ${p.sets}-${o.sets} · AD-40`;
    if (state.advantage === 'opponent') return `Sets ${p.sets}-${o.sets} · 40-AD`;
    return `Sets ${p.sets}-${o.sets} · DEUCE`;
  }
  const pi = pointsToIndex(p.points);
  const oi = pointsToIndex(o.points);
  return `Sets ${p.sets}-${o.sets} · Games ${p.games}-${o.games} · ${POINT_NAMES[pi]}-${POINT_NAMES[oi]}`;
}

export function matchEventFromPoint(
  matchId: string,
  winner: Hitter,
  timestampMs: number
): MatchEvent {
  return {
    id: `${matchId}-pt-${timestampMs}`,
    matchId,
    timestampMs,
    type: 'point',
    description: `Point ${winner === 'player' ? 'you' : 'opponent'}`,
  };
}
