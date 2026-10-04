import plume from '../content/voiceManifest.json';
import pierre from '../content/voiceManifest.pierre.json';

/**
 * Pre-recorded natural voices (Piper "UPMC" model, CC-BY-SA 4.0): every clip was generated
 * offline and checked by a speech recogniser (scripts/voice/synthesize.py).
 */
export type NaturalVoiceId = 'plume' | 'pierre';

export interface NaturalVoice {
  id: NaturalVoiceId;
  name: string;
  emoji: string;
  description: string;
  /** Folder of the clips in public/. */
  folder: string;
  clips: ReadonlySet<string>;
}

const ALL: NaturalVoice[] = [
  { id: 'plume', name: 'Plume', emoji: '🦉', description: 'Voix de femme, douce (recommandée)', folder: 'voice', clips: new Set(plume as string[]) },
  { id: 'pierre', name: 'Pierre', emoji: '🧔', description: 'Voix d’homme, calme', folder: 'voice-pierre', clips: new Set(pierre as string[]) },
];

/** Voices whose clips are present (a voice still being recorded is not offered). */
export const NATURAL_VOICES = ALL.filter((v) => v.clips.size > 0);

export function naturalVoice(id: NaturalVoiceId): NaturalVoice {
  return NATURAL_VOICES.find((v) => v.id === id) ?? NATURAL_VOICES[0];
}
