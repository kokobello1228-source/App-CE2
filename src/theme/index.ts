import { Platform } from 'react-native';
import type { Domain } from '../../skills.config';

/**
 * Visual identity: a French school notebook. Ink blue from the logo, Seyès
 * paper for exercises, round "gommette" stickers for rewards. No red for mistakes:
 * red only appears as the notebook margin line.
 */
export const colors = {
  background: '#F2F6FC',
  surface: '#FFFFFF',
  paper: '#FFFDF8',
  text: '#14213D',
  textMuted: '#55607A',
  border: '#D5DEEC',
  primary: '#1663D6',
  primaryDark: '#0E4AA8',
  primaryText: '#FFFFFF',
  selected: '#E3EDFF',
  success: '#12805C',
  successBg: '#E4F6EE',
  retry: '#1663D6',
  retryBg: '#EAF1FD',
  star: '#FFB81C',
  disabled: '#B9C3D3',
  seyes: '#CAD7F0',
  seyesStrong: '#A9BCE6',
  margin: '#E5484D',
  domain: { fr: '#7C4DDB', math: '#0E9F7A' } satisfies Record<Domain, string>,
  domainSoft: { fr: '#F1EBFC', math: '#E2F6F0' } satisfies Record<Domain, string>,
  band: { besoins: '#B54708', fragile: '#9A6B00', satisfaisant: '#12805C' },
};

/** Font families loaded in the root layout. */
export const fonts = {
  display: 'Fredoka_600SemiBold',
  displayBold: 'Fredoka_700Bold',
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

export const radius = { s: 10, m: 16, l: 24, pill: 999 };

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
