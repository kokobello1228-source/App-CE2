import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

/**
 * Single entry point for speech synthesis (French voice).
 * Every call stops what is currently being read.
 */
let voiceId: string | undefined;
let voiceResolved = false;
let rate = 0.9;
let generation = 0;

const isWeb = Platform.OS === 'web';

/**
 * Safari (iPhone) only allows speech after a first touch on the page: an empty
 * utterance spoken during that touch unlocks it for the rest of the visit.
 */
if (isWeb && typeof document !== 'undefined') {
  const unlock = () => {
    try {
      const synth = (globalThis as { speechSynthesis?: { speak(u: unknown): void } }).speechSynthesis;
      const Utterance = (globalThis as { SpeechSynthesisUtterance?: new (text: string) => unknown }).SpeechSynthesisUtterance;
      if (synth && Utterance) synth.speak(new Utterance(''));
    } catch {
      // Speech not available: the app still works without sound.
    }
    document.removeEventListener('touchend', unlock);
    document.removeEventListener('click', unlock);
  };
  document.addEventListener('touchend', unlock);
  document.addEventListener('click', unlock);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function resolveVoice(): Promise<void> {
  if (voiceResolved) return;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // Browsers load their voices late: try again next time if the list is still empty.
    voiceResolved = voices.length > 0;
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
  // Safari drops an utterance spoken right after a cancel.
  if (isWeb) await wait(60);
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
