import OpenAI from 'openai';
import type { CornerPoint, FrameAnalysis } from '@/types';
import { buildFrameAnalysisPrompt } from './prompts';

const emptyAnalysis = (): FrameAnalysis => ({
  shotDetected: false,
  shotType: null,
  hitter: null,
  ballVisible: false,
  ballLanded: false,
  landingCall: null,
  confidence: 0,
  description: 'No analysis',
});

function parseJson(content: string): FrameAnalysis {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  const parsed = JSON.parse(trimmed) as FrameAnalysis;
  return {
    shotDetected: Boolean(parsed.shotDetected),
    shotType: parsed.shotType ?? null,
    hitter: parsed.hitter ?? null,
    ballVisible: Boolean(parsed.ballVisible),
    ballLanded: Boolean(parsed.ballLanded),
    landingCall: parsed.landingCall ?? null,
    confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0,
    description: typeof parsed.description === 'string' ? parsed.description : '',
  };
}

export async function analyzeFrameBase64(
  apiKey: string,
  base64Jpeg: string,
  corners: CornerPoint[]
): Promise<FrameAnalysis> {
  if (!apiKey) return { ...emptyAnalysis(), description: 'Missing API key' };

  const client = new OpenAI({ apiKey });
  const prompt = buildFrameAnalysisPrompt(corners);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Jpeg}`,
              detail: 'low',
            },
          },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? '';
  if (!text) return { ...emptyAnalysis(), description: 'Empty model response' };

  try {
    return parseJson(text);
  } catch {
    return { ...emptyAnalysis(), description: 'Failed to parse JSON', confidence: 0 };
  }
}
