import { StyleSheet, View } from 'react-native';
import { SpeakButton } from '../../components/SpeakButton';
import { Text } from '../../components/Text';
import { colors, font, fonts, radius, space } from '../../theme';
import { TextQuestion } from '../f1/View';
import type { TextQuestionItem } from '../textQuestions';
import type { SkillViewProps } from '../views';

/** F3: the text is only heard (read twice at the first question), never shown. */
export function F3View(props: SkillViewProps<TextQuestionItem>) {
  const { item } = props;
  return (
    <>
      {item.index === 0 && (
        <View style={styles.listen}>
          <Text style={styles.ear}>👂</Text>
          <Text style={styles.listenTitle}>{item.title}</Text>
          <Text style={styles.listenText}>Écoute bien : le texte est lu deux fois, puis la première question.</Text>
        </View>
      )}
      <View style={styles.replay}>
        <SpeakButton text={`${item.text}`} label="Réécouter le texte" />
      </View>
      <TextQuestion {...props} />
    </>
  );
}

const styles = StyleSheet.create({
  listen: { backgroundColor: colors.domainSoft.fr, borderRadius: radius.l, padding: space.l, alignItems: 'center', gap: space.xs },
  ear: { fontSize: 44 },
  listenTitle: { fontSize: font.large, fontFamily: fonts.display, color: colors.domain.fr },
  listenText: { fontSize: font.body - 1, color: colors.text, textAlign: 'center', lineHeight: 27 },
  replay: { flexDirection: 'row' },
});
