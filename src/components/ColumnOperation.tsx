import { Pressable, StyleSheet, Text, View } from 'react-native';
import { digitCount, resultOf, type ColumnOpItem } from '../skills/columnOps';
import { colors, font, radius, space } from '../theme';

interface Props {
  item: ColumnOpItem;
  /** Typed result (filled from the right). */
  answer: string;
  /** Carries noted by the child, by column index from the units (addition only). */
  carries?: string[];
  onToggleCarry?(column: number): void;
}

const CELL = 44;

/** Operation laid out in columns, like in the booklet, with the answer row below the line. */
export function ColumnOperation({ item, answer, carries = [], onToggleCarry }: Props) {
  const width = Math.max(...item.terms.map(digitCount), digitCount(resultOf(item)), answer.length);
  const columns = Array.from({ length: width }, (_, i) => width - 1 - i); // left to right, as positions
  const sign = item.op === '+' ? '+' : '−';
  const digitsOf = (n: number) => String(n).padStart(width, ' ').split('');
  const answerDigits = answer.padStart(width, ' ').split('');
  return (
    <View style={styles.card} accessible accessibilityLabel={`${item.terms.join(item.op === '+' ? ' plus ' : ' moins ')}. Ta réponse : ${answer || 'vide'}`}>
      {item.op === '+' && onToggleCarry && (
        <View style={styles.row}>
          <View style={styles.signCell} />
          {columns.map((position) => (
            <Pressable
              key={position}
              accessibilityRole="button"
              accessibilityLabel={`Retenue colonne ${position + 1}`}
              onPress={() => onToggleCarry(position)}
              style={[styles.carryCell, position === 0 && styles.hidden]}
              disabled={position === 0}
            >
              <Text style={styles.carryText}>{carries[position] ?? ''}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {item.terms.map((term, row) => (
        <View key={row} style={styles.row}>
          <Text style={[styles.signCell, styles.digit]}>{row === 0 ? '' : sign}</Text>
          {digitsOf(term).map((d, i) => (
            <Text key={i} style={[styles.cell, styles.digit]}>
              {d.trim()}
            </Text>
          ))}
        </View>
      ))}
      <View style={styles.line} />
      <View style={styles.row}>
        <View style={styles.signCell} />
        {answerDigits.map((d, i) => (
          <View key={i} style={[styles.cell, styles.answerCell]}>
            <Text style={[styles.digit, styles.answerDigit]}>{d.trim()}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    paddingVertical: space.m,
    paddingHorizontal: space.l,
  },
  row: { flexDirection: 'row', justifyContent: 'flex-end' },
  signCell: { width: CELL, textAlign: 'center' },
  cell: { width: CELL, height: CELL, alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  digit: { fontSize: font.title + 4, color: colors.text, fontWeight: '600', lineHeight: CELL },
  carryCell: {
    width: CELL - 8,
    height: 30,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hidden: { opacity: 0 },
  carryText: { fontSize: font.body, color: colors.primary, fontWeight: '700' },
  line: { height: 3, backgroundColor: colors.text, marginVertical: space.xs, marginLeft: CELL },
  answerCell: { borderBottomWidth: 2, borderColor: colors.border, marginHorizontal: 1, width: CELL - 2 },
  answerDigit: { color: colors.primary, fontWeight: '800' },
});
