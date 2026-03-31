import * as Speech from 'expo-speech';

export type AnnouncerOptions = {
  rate?: number;
  pitch?: number;
  language?: string;
};

const defaultOpts: AnnouncerOptions = {
  rate: 1.0,
  pitch: 1.0,
  language: 'en-US',
};

export function speakInOut(
  call: 'in' | 'out' | 'contested',
  options: AnnouncerOptions = {}
): void {
  const o = { ...defaultOpts, ...options };
  let text: string;
  if (call === 'in') text = 'In!';
  else if (call === 'out') text = 'Out!';
  else text = 'Out! Challenged.';

  Speech.stop();
  Speech.speak(text, {
    rate: o.rate,
    pitch: o.pitch,
    language: o.language,
  });
}

export function speakShot(
  shot: string,
  options: AnnouncerOptions = {}
): void {
  const o = { ...defaultOpts, ...options };
  Speech.stop();
  Speech.speak(shot, {
    rate: o.rate,
    pitch: o.pitch,
    language: o.language,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
