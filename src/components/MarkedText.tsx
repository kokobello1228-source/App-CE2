import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { colors, fonts } from '../theme';
import { Text } from './Text';

/** Renders [underlined] and **bold** parts of a text. */
export function MarkedText({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  const parts = text.split(/(\[[^\]]+\]|\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.startsWith('[')) return <Text key={i} style={styles.underline}>{part.slice(1, -1)}</Text>;
        if (part.startsWith('**')) return <Text key={i} style={styles.bold}>{part.slice(2, -2)}</Text>;
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  underline: { textDecorationLine: 'underline', fontFamily: fonts.bold, color: colors.primaryDark },
  bold: { fontFamily: fonts.bold, color: colors.primaryDark },
});
