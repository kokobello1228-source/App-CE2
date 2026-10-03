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
};
