import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { naturalVoice, type NaturalVoice, type NaturalVoiceId } from './naturalVoices';
import { clipKey, segments, spokenForm } from './voiceClips';

/**
 * Single entry point for speech synthesis (French voice).
 * Every call stops what is currently being read.
 */
let voiceId: string | undefined;
let voiceResolved = false;
/** Voice chosen in the parent area; empty means automatic. */
let chosenVoice = '';
let useNatural = true;
let naturalId: NaturalVoiceId = 'plume';
let player: HTMLAudioElement | null = null;
/** Bumped whenever the clips are re-recorded, so devices do not replay the old voice. */
const VOICE_VERSION = 5;
/** A tiny silent MP3, played on the first touch to unlock audio in Safari. */
const SILENCE = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//NwwAAAAAAAAAAAAEluZm8AAAAPAAAABgAAAowAZmZmZmZmZmZmZmZmZmZmZoWFhYWFhYWFhYWFhYWFhYWFo6Ojo6Ojo6Ojo6Ojo6Ojo8LCwsLCwsLCwsLCwsLCwsLC4eHh4eHh4eHh4eHh4eHh4eH/////////////////////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQCowAAAAAAAAKMPp3BgAAAAAAAAAAAAAAAAAD/8zDEAAAAA0gAAAAATEFNRVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/8zLEQQAAA0gAAAAAVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MwxIMAAANIAAAAAFVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MyxL0AAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zMMS+AAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zMMS+AAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';

function base(): string {
  if (typeof location === 'undefined') return '';
  return location.pathname.startsWith('/App-CE2') ? '/App-CE2' : '';
}

function audioElement(): HTMLAudioElement | null {
  if (!isWebPlatform() || typeof Audio === 'undefined') return null;
  player ??= new Audio();
  return player;
}

function isWebPlatform(): boolean {
  return Platform.OS === 'web';
}

/** Unlocks clip playback in Safari: must be called during a user touch. */
export function unlockClips(): void {
  const audio = audioElement();
  if (!audio) return;
  audio.src = SILENCE;
  void audio.play().catch(() => undefined);
}

/** Pre-recorded natural voice on or off, and which one (Plume or Pierre). */
export function setNaturalVoice(value: boolean, id: NaturalVoiceId = naturalId): void {
  useNatural = value;
  naturalId = id;
}

/** Clip keys for a text in a natural voice, or null if one segment has no recording. */
export function clipsFor(text: string, voice: NaturalVoice = naturalVoice(naturalId)): string[] | null {
  const keys = segments(spokenForm(text)).map(clipKey);
  return keys.length > 0 && keys.every((k) => voice.clips.has(k)) ? keys : null;
}

function playClip(audio: HTMLAudioElement, folder: string, key: string): Promise<boolean> {
  return new Promise((resolve) => {
    const done = (ok: boolean) => {
      audio.onended = null;
      audio.onerror = null;
      resolve(ok);
    };
    audio.onended = () => done(true);
    audio.onerror = () => done(false);
    audio.src = `${base()}/${folder}/${key}.mp3?v=${VOICE_VERSION}`;
    audio.playbackRate = Math.max(0.7, Math.min(1.3, rate / 0.9));
    void audio.play().catch(() => done(false));
  });
}
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

let voices: Speech.Voice[] = [];

async function resolveVoice(): Promise<void> {
  if (voiceResolved) return;
  try {
    voices = await Speech.getAvailableVoicesAsync();
    // Browsers load their voices late: try again next time if the list is still empty.
    voiceResolved = voices.length > 0;
    const chosen = chosenVoice ? voices.find((v) => v.identifier === chosenVoice) : undefined;
    voiceId = chosen?.identifier ?? (await listFrenchVoices(voices))[0]?.identifier;
  } catch {
    voiceId = undefined;
  }
}

export function setSpeechRate(value: number): void {
  rate = value;
}

export function setVoice(identifier: string): void {
  if (identifier === chosenVoice) return;
  chosenVoice = identifier;
  voiceResolved = false;
}

export interface FrenchVoice {
  identifier: string;
  name: string;
  /** "fr-FR", "fr-CA"… */
  language: string;
  enhanced: boolean;
}

/** Novelty voices shipped by Apple that are not suitable for school reading. */
const NOVELTY = /^(eddy|flo|grandma|grandpa|grand-mère|grand-père|reed|rocky|sandy|shelley|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|albert|fred|junior|kathy|ralph)\b/i;

/** Female voices first: closest to Plume (the default iPhone voice, Thomas, is a man's). */
const FEMALE = /\b(audrey|aurélie|aurelie|marie|amélie|amelie|google français|céline|celine|julie|hortense|denise|vivienne|eloise|élodie|chantal|virginie|sylvie|léa|lea)\b/i;
const MALE = /\b(thomas|daniel|nicolas|jacques|henri|paul|claude|antoine|jean|mathieu|remy|rémy|guillaume|olivier)\b/i;

/** French voices available on this device, best first (female, enhanced, France before other French). */
export async function listFrenchVoices(known?: Speech.Voice[]): Promise<FrenchVoice[]> {
  let voices: Speech.Voice[] = known ?? [];
  // Browsers load their voices late: try a few times.
  for (let attempt = 0; !known && attempt < 6 && voices.length === 0; attempt++) {
    try {
      voices = await Speech.getAvailableVoicesAsync();
    } catch {
      voices = [];
    }
    if (voices.length === 0) await wait(300);
  }
  const unique = new Map<string, FrenchVoice>();
  for (const v of voices) {
    const language = v.language.replace('_', '-');
    if (!language.toLowerCase().startsWith('fr')) continue;
    unique.set(v.identifier, {
      identifier: v.identifier,
      name: v.name,
      language,
      enhanced: v.quality === Speech.VoiceQuality.Enhanced || /premium|enhanced|améliorée|siri/i.test(`${v.name} ${v.identifier}`),
    });
  }
  const score = (v: FrenchVoice) =>
    (FEMALE.test(v.name) ? 0 : MALE.test(v.name) ? 4 : 2) +
    (v.language.toLowerCase() === 'fr-fr' ? 0 : 1) +
    (v.enhanced ? 0 : 1) +
    (NOVELTY.test(v.name) ? 20 : 0);
  return [...unique.values()].sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name));
}

/** A voice to use for one reading only (voice preview), instead of the selected one. */
export interface VoiceOverride {
  natural: boolean;
  /** Which natural voice ("plume" when omitted). */
  naturalId?: NaturalVoiceId;
  /** Device voice identifier ('' = automatic). */
  voiceId: string;
}

/** Reads a text aloud. Resolves when finished, stopped or failed. */
export async function speak(text: string, override?: VoiceOverride): Promise<void> {
  const current = ++generation;
  player?.pause();
  const natural = override ? override.natural : useNatural;
  const voice = naturalVoice(override ? (override.naturalId ?? 'plume') : naturalId);
  const keys = natural ? clipsFor(text, voice) : null;
  const audio = keys ? audioElement() : null;
  if (keys && audio) {
    await Speech.stop();
    for (const key of keys) {
      if (current !== generation) return;
      const ok = await playClip(audio, voice.folder, key);
      if (!ok) break; // offline or blocked: fall back to the device voice below
      if (current !== generation) return;
      if (key === keys[keys.length - 1]) return;
      await wait(110);
    }
    if (current !== generation) return;
  }
  await Speech.stop();
  // Safari drops an utterance spoken right after a cancel.
  if (isWeb) await wait(60);
  await resolveVoice();
  if (current !== generation) return;
  const overrideVoice = override?.voiceId ? voices.find((v) => v.identifier === override.voiceId)?.identifier : undefined;
  await new Promise<void>((resolve) => {
    Speech.speak(spokenForm(text), {
      language: 'fr-FR',
      voice: overrideVoice ?? voiceId,
      rate,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
}

export function stopSpeaking(): void {
  generation++;
  player?.pause();
  void Speech.stop();
}
