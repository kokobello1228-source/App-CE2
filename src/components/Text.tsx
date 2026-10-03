import { Platform, Text as RNText, StyleSheet, type TextProps } from 'react-native';
import { fonts } from '../theme';

/**
 * Text with the app fonts. A bold weight switches to the bold font file
 * (custom fonts do not synthesise weights reliably on phones).
 */
/** French typography: a non-breaking space before ? ! : ; » and after « (no lonely "?" on a line). */
export function frenchSpacing(text: string): string {
  return text.replace(/ ([?!:;»])/g, '\u00A0$1').replace(/« /g, '«\u00A0');
}

export function Text({ style, children, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const weight = flat.fontWeight;
  const bold = weight === 'bold' || (weight !== undefined && Number(weight) >= 600);
  const family = flat.fontFamily ?? (bold ? fonts.bold : fonts.body);
  return (
    <RNText {...props} style={[style, { fontFamily: family }, Platform.OS !== 'web' && { fontWeight: 'normal' }]}>
      {typeof children === 'string' ? frenchSpacing(children) : children}
    </RNText>
  );
}
