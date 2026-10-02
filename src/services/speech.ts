import * as Speech from 'expo-speech';

/**
 * Single entry point for speech synthesis (French voice).
 * Every call stops what is currently being read.
 */
let voiceId: string | undefined;
let voiceResolved = false;
let rate = 0.9;
let generation = 0;

async function resolveVoice(): Promise<void> {
  if (voiceResolved) return;
  voiceResolved = true;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const french = voices.filter((v) => v.language.replace('_', '-').toLowerCase().startsWith('fr-fr'));
    const best = french.find((v) => v.quality === Speech.VoiceQuality.Enhanced) ?? french[0];
    voiceId = best?.identifier;
  } catch {
    voiceId = undefined;
  }
}

export function setSpeechRate(value: number): void {
  rate = value;
}

/** Reads a text aloud. Resolves when finished, stopped or failed. */
export async function speak(text: string): Promise<void> {
  const current = ++generation;
  await Speech.stop();
  await resolveVoice();
  if (current !== generation) return;
  await new Promise<void>((resolve) => {
    Speech.speak(text, {
      language: 'fr-FR',
      voice: voiceId,
      rate,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
}

export function stopSpeaking(): void {
  generation++;
  void Speech.stop();
}
