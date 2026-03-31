import type { FrameAnalysis } from '@/types';
import type { VerifiedCallPayload } from '@/types';

const WINDOW_MS = 2500;

export interface PendingLocal {
  timestampMs: number;
  analysis: FrameAnalysis;
  sourceDeviceId: string;
}

export interface PendingRemote {
  timestampMs: number;
  analysis: FrameAnalysis;
  sourceDeviceId: string;
}

/**
 * When both agents report a landing call within WINDOW_MS, resolve consensus.
 */
export function verifyPair(
  local: PendingLocal,
  remote: PendingRemote
): VerifiedCallPayload | null {
  const dt = Math.abs(local.timestampMs - remote.timestampMs);
  if (dt > WINDOW_MS) return null;

  const l = local.analysis.landingCall;
  const r = remote.analysis.landingCall;
  if (l == null || r == null) return null;

  const lc = local.analysis.confidence;
  const rc = remote.analysis.confidence;

  if (l === r) {
    return {
      finalCall: l,
      confidence: Math.min(1, (lc + rc) / 2),
      localConfidence: lc,
      remoteConfidence: rc,
      reason: 'Both agents agree',
      timestampMs: Math.round((local.timestampMs + remote.timestampMs) / 2),
    };
  }

  const diff = Math.abs(lc - rc);
  if (diff < 0.15) {
    return {
      finalCall: 'contested',
      confidence: Math.max(lc, rc),
      localConfidence: lc,
      remoteConfidence: rc,
      reason: 'Agents disagreed; confidence too close',
      timestampMs: Math.round((local.timestampMs + remote.timestampMs) / 2),
    };
  }

  const chosen = lc >= rc ? l : r;
  return {
    finalCall: chosen,
    confidence: Math.max(lc, rc),
    localConfidence: lc,
    remoteConfidence: rc,
    reason: 'Higher-confidence agent call',
    timestampMs: Math.round((local.timestampMs + remote.timestampMs) / 2),
  };
}

export function pickSoloCall(analysis: FrameAnalysis): 'in' | 'out' | 'contested' | null {
  if (analysis.landingCall === 'in' || analysis.landingCall === 'out') {
    return analysis.confidence >= 0.35 ? analysis.landingCall : 'contested';
  }
  return null;
}
