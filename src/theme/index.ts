import { Platform } from 'react-native';
import type { Domain } from '../../skills.config';

/**
 * Visual identity for an 8-year-old: a bright sky world guided by Plume the owl.
 * One ink blue from the logo, a sunny yellow for rewards, one colour per universe.
 * No red for mistakes: coral is only decorative.
 */
export const colors = {
  background: '#E8F4FF',
  surface: '#FFFFFF',
  paper: '#FFFDF7',
  text: '#1D2A4D',
  textMuted: '#5A6788',
  border: '#D6E2F3',
  primary: '#2F7BEA',
  primaryDark: '#1F5FC2',
  primaryText: '#FFFFFF',
  selected: '#E2EEFF',
  success: '#14A06F',
  successDark: '#0E7D56',
  successBg: '#E3F8EF',
  retry: '#2F7BEA',
  retryBg: '#EAF2FF',
  star: '#FFC531',
  starDark: '#E5A400',
  coral: '#FF7A59',
  disabled: '#BCC8DB',
  disabledDark: '#9FAEC6',
  seyes: '#CAD7F0',
  seyesStrong: '#A9BCE6',
  margin: '#FF7A7A',
  domain: { fr: '#8C61FF', math: '#16B89A' } satisfies Record<Domain, string>,
  domainDark: { fr: '#6B42DB', math: '#0E8E76' } satisfies Record<Domain, string>,
  domainSoft: { fr: '#F1EBFF', math: '#DFF7F1' } satisfies Record<Domain, string>,
  band: { besoins: '#B54708', fragile: '#9A6B00', satisfaisant: '#12805C' },
};

/** Darker shade used for the "3D" bottom edge of chunky buttons. */
export function shade(color: string): string {
  const map: Record<string, string> = {
    [colors.primary]: colors.primaryDark,
    [colors.success]: colors.successDark,
    [colors.star]: colors.starDark,
    [colors.domain.fr]: colors.domainDark.fr,
    [colors.domain.math]: colors.domainDark.math,
    [colors.disabled]: colors.disabledDark,
    [colors.surface]: colors.border,
  };
  return map[color] ?? colors.primaryDark;
}

/** Font families loaded in the root layout: Baloo 2 (round, playful) and Lexend (easy reading). */
export const fonts = {
  display: 'Baloo2_700Bold',
  displayBold: 'Baloo2_800ExtraBold',
  displayMedium: 'Baloo2_600SemiBold',
  body: 'Lexend_400Regular',
  bold: 'Lexend_600SemiBold',
};

export const font = {
  small: 16,
  body: 20,
  large: 25,
  title: 32,
  huge: 48,
};

export const space = { xs: 4, s: 8, m: 16, l: 24, xl: 32 };

export const radius = { s: 10, m: 18, l: 26, pill: 999 };

/** Minimum touch target, generous for a child. */
export const TOUCH = 64;

/** Soft elevation for cards and buttons. */
export function shadow(level: 1 | 2 = 1) {
  return Platform.select({
    web: { boxShadow: level === 1 ? '0 2px 8px rgba(20,33,61,0.08)' : '0 8px 24px rgba(20,33,61,0.14)' },
    default: {
      shadowColor: '#14213D',
      shadowOpacity: level === 1 ? 0.08 : 0.14,
      shadowRadius: level === 1 ? 8 : 18,
      shadowOffset: { width: 0, height: level === 1 ? 2 : 6 },
      elevation: level === 1 ? 2 : 6,
    },
  }) as object;
}
