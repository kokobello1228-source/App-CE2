export interface Settings {
  childName: string;
  /** Duration of the daily session, in minutes. */
  dailyMinutes: number;
  /** Chosen voice identifier ('' = best French voice found automatically). */
  voiceId: string;
  /** Speech rate (1 = normal). */
  voiceRate: number;
  /** Official countdowns in free practice. */
  timerInPractice: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  /** Asked at first launch; empty until then. */
  childName: '',
  dailyMinutes: 10,
  voiceId: '',
  voiceRate: 0.9,
  timerInPractice: false,
};
