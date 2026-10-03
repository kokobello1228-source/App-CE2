import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Small rewards for the senses: a soft chime (web, generated with Web Audio,
 * no file to download) and haptic taps on phones. Never a sound for a mistake.
 */
let enabled = true;
let context: AudioContext | null = null;

export function setSoundsEnabled(value: boolean): void {
  enabled = value;
}

function audio(): AudioContext | null {
  if (Platform.OS !== 'web' || !enabled) return null;
  try {
    const Ctor = (globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context ??= new Ctor();
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return null;
  }
}

function note(ctx: AudioContext, frequency: number, start: number, duration: number, volume = 0.18): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, ctx.currentTime + start);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
}

/** Bright rising arpeggio for a right answer. */
export function playSuccess(): void {
  const ctx = audio();
  if (ctx) [784, 988, 1319].forEach((f, i) => note(ctx, f, i * 0.09, 0.35));
  if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

/** Little fanfare when the session is over. */
export function playFanfare(): void {
  const ctx = audio();
  if (ctx) [523, 659, 784, 1047, 784, 1047].forEach((f, i) => note(ctx, f, i * 0.12, 0.4, 0.15));
  if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

/** Soft "pop" for a star appearing. */
export function playPop(): void {
  const ctx = audio();
  if (ctx) note(ctx, 1175, 0, 0.18, 0.12);
}

/** Light tap under the finger (phones only). */
export function tap(): void {
  if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

/** Unlocks Web Audio on the first touch (Safari requirement). */
export function unlockAudio(): void {
  audio();
}
