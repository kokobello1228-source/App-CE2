export interface Settings {
  childName: string;
  /** Duration of the daily session, in minutes. */
  dailyMinutes: number;
  /** Pre-recorded natural voice (Plume) when available; otherwise the device voice below. */
  naturalVoice: boolean;
  /** Chosen device voice identifier ('' = best French voice found automatically). */
  voiceId: string;
  /** Speech rate (1 = normal). */
  voiceRate: number;
  /** Chime and confetti sounds. */
  sounds: boolean;
  /** Official countdowns in free practice. */
  timerInPractice: boolean;
  /** Last voice default applied to this device (see VOICE_DEFAULTS_VERSION). */
  voiceDefaultsVersion: number;
}

export const DEFAULT_SETTINGS: Settings = {
  /** Asked at first launch; empty until then. */
  childName: '',
  dailyMinutes: 10,
  naturalVoice: true,
  voiceId: '',
  voiceRate: 0.9,
  sounds: true,
  timerInPractice: false,
  voiceDefaultsVersion: 0,
};

/**
 * Bumped when a new default voice must reach every device once, even those where a
 * device voice had been chosen before. The parent can switch voices again afterwards.
 * 1: Plume (pre-recorded natural voice) becomes the standard voice.
 */
export const VOICE_DEFAULTS_VERSION = 1;

/** Settings to save so that this device gets the current default voice, or null if up to date. */
export function voiceDefaultsPatch(settings: Settings): Partial<Settings> | null {
  if (settings.voiceDefaultsVersion >= VOICE_DEFAULTS_VERSION) return null;
  return { naturalVoice: true, voiceDefaultsVersion: VOICE_DEFAULTS_VERSION };
}
