export interface Settings {
  childName: string;
  /** Duration of the daily session, in minutes. */
  dailyMinutes: number;
  /** Speech rate (1 = normal). */
  voiceRate: number;
  /** Official countdowns in free practice. */
  timerInPractice: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  childName: 'Mia',
  dailyMinutes: 10,
  voiceRate: 0.9,
  timerInPractice: false,
};
