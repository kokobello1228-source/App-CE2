import type { Domain } from '../../skills.config';

/** High-contrast palette. No red: mistakes are shown with a calm neutral tone. */
export const colors = {
  background: '#FFF8EE',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#4A4A4A',
  border: '#D9CFC1',
  primary: '#1F4E9C',
  primaryText: '#FFFFFF',
  selected: '#DCE7FA',
  success: '#1B6E45',
  successBg: '#E3F4EA',
  retry: '#1F4E9C',
  retryBg: '#EEF2FA',
  star: '#E8A317',
  disabled: '#B8B8B8',
  domain: { fr: '#6B3FA0', math: '#0E7468' } satisfies Record<Domain, string>,
  band: { besoins: '#B54708', fragile: '#B88A00', satisfaisant: '#1B6E45' },
};

export const font = {
  small: 16,
  body: 20,
  large: 26,
  title: 32,
  huge: 48,
};

export const space = { xs: 4, s: 8, m: 16, l: 24, xl: 32 };

export const radius = { m: 14, l: 22 };

/** Minimum touch target, generous for a child. */
export const TOUCH = 64;
