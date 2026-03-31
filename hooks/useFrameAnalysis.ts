import { useCallback, useRef } from 'react';
import { analyzeFrameBase64 } from '@/services/ai/frameAnalyzer';
import { pickSoloCall, verifyPair } from '@/services/ai/callVerifier';
import type { AIBroadcastPayload, RealtimeMessage, VerifiedCallPayload } from '@/types';
import { useMatchStore } from '@/stores/matchStore';

export function useFrameAnalysis(
  mode: 'solo' | 'linked',
  roomCode: string | null,
  deviceId: string,
  broadcast: (msg: RealtimeMessage) => void,
  onVerifiedCall: (v: VerifiedCallPayload) => void
) {
  const openAiKey = useMatchStore((s) => s.openAiKey);
  const calibration = useMatchStore((s) => s.calibration);
  const setLastAnalysis = useMatchStore((s) => s.setLastAnalysis);
  const addEvent = useMatchStore((s) => s.addEvent);

  const remoteBufferRef = useRef<AIBroadcastPayload[]>([]);
  const seqRef = useRef(0);
  const onVerifiedRef = useRef(onVerifiedCall);
  const broadcastRef = useRef(broadcast);
  onVerifiedRef.current = onVerifiedCall;
  broadcastRef.current = broadcast;

  const ingestRemote = useCallback((msg: RealtimeMessage) => {
    if (msg.type !== 'ai_frame_result') return;
    const payload = msg.payload as AIBroadcastPayload;
    remoteBufferRef.current.push(payload);
    const cutoff = Date.now() - 8000;
    remoteBufferRef.current = remoteBufferRef.current.filter((p) => p.timestampMs >= cutoff);
  }, []);

  const processLocalFrame = useCallback(
    async (base64: string) => {
      const key = openAiKey ?? process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';
      const analysis = await analyzeFrameBase64(key, base64, calibration);
      setLastAnalysis(analysis);
      seqRef.current += 1;

      if (analysis.shotDetected && analysis.shotType) {
        addEvent({
          timestampMs: Date.now(),
          type: 'shot',
          shotType: analysis.shotType,
          hitter: analysis.hitter,
          confidence: analysis.confidence,
          description: analysis.description,
        });
      }

      if (mode === 'linked' && roomCode) {
        const payload: AIBroadcastPayload = {
          sourceDeviceId: deviceId,
          timestampMs: Date.now(),
          analysis,
          sequence: seqRef.current,
        };
        broadcastRef.current({ type: 'ai_frame_result', payload });

        if (analysis.landingCall === 'in' || analysis.landingCall === 'out') {
          const near = remoteBufferRef.current.filter(
            (r) =>
              r.sourceDeviceId !== deviceId &&
              r.analysis.landingCall != null &&
              Math.abs(r.timestampMs - payload.timestampMs) < 4000
          );
          const partner = near[near.length - 1];
          if (partner) {
            const v = verifyPair(
              {
                timestampMs: payload.timestampMs,
                analysis,
                sourceDeviceId: deviceId,
              },
              {
                timestampMs: partner.timestampMs,
                analysis: partner.analysis,
                sourceDeviceId: partner.sourceDeviceId,
              }
            );
            if (v) {
              onVerifiedRef.current(v);
              broadcastRef.current({ type: 'verified_call', payload: v });
              addEvent({
                timestampMs: v.timestampMs,
                type: 'landing_call',
                landingCall: v.finalCall === 'contested' ? 'out' : v.finalCall,
                confidence: v.confidence,
                contested: v.finalCall === 'contested',
                description: v.reason,
              });
            }
          }
        }
      } else {
        const solo = pickSoloCall(analysis);
        if (solo && solo !== 'contested') {
          onVerifiedRef.current({
            finalCall: solo,
            confidence: analysis.confidence,
            localConfidence: analysis.confidence,
            remoteConfidence: 0,
            reason: 'Solo mode',
            timestampMs: Date.now(),
          });
          addEvent({
            timestampMs: Date.now(),
            type: 'landing_call',
            landingCall: solo,
            confidence: analysis.confidence,
            description: analysis.description,
          });
        } else if (solo === 'contested') {
          onVerifiedRef.current({
            finalCall: 'contested',
            confidence: analysis.confidence,
            localConfidence: analysis.confidence,
            remoteConfidence: 0,
            reason: 'Low confidence',
            timestampMs: Date.now(),
          });
        }
      }
    },
    [addEvent, calibration, deviceId, mode, openAiKey, roomCode, setLastAnalysis]
  );

  return { processLocalFrame, ingestRemote };
}
