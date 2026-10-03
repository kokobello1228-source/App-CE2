import { StyleSheet, View } from 'react-native';
import { ANIMALS, OBJECTS, type Scene } from '../skills/f4/logic';
import { colors } from '../theme';
import { Text } from './Text';

const emojiOf = (id: string) => (ANIMALS as readonly { id: string; emoji: string }[]).concat(OBJECTS).find((x) => x.id === id)?.emoji ?? '?';

/** Draws a picture of F4 with emoji placed on a small stage. */
export function F4Scene({ scene }: { scene: Scene }) {
  if (scene.type === 'line') {
    return (
      <View style={styles.stage}>
        <View style={styles.lineRow}>
          <Text style={styles.big}>{emojiOf(scene.back)}</Text>
          <Text style={styles.big}>{emojiOf(scene.front)}</Text>
        </View>
        <Text style={styles.arrow}>⟶</Text>
      </View>
    );
  }
  const animal = (
    <View style={styles.animalBox}>
      {scene.hat && <Text style={styles.hat}>🎩</Text>}
      <Text style={styles.animal}>{emojiOf(scene.animal)}</Text>
    </View>
  );
  const object = <Text style={styles.object}>{emojiOf(scene.object)}</Text>;
  if (scene.relation === 'à côté de') {
    return (
      <View style={styles.stage}>
        <View style={styles.sideRow}>
          {object}
          {animal}
        </View>
      </View>
    );
  }
  if (scene.relation === 'sur') {
    return (
      <View style={styles.stage}>
        <View style={styles.column}>
          {animal}
          <View style={{ marginTop: -14 }}>{object}</View>
        </View>
      </View>
    );
  }
  // "sous": the animal is drawn behind the object, between its legs or under the canopy.
  return (
    <View style={styles.stage}>
      <View style={styles.under}>
        <View style={styles.behind}>
          {scene.hat && <Text style={styles.hatSmall}>🎩</Text>}
          <Text style={styles.animalSmall}>{emojiOf(scene.animal)}</Text>
        </View>
        <Text style={[styles.object, styles.front]}>{emojiOf(scene.object)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { width: '100%', height: 130, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6, backgroundColor: colors.paper, borderRadius: 12 },
  column: { alignItems: 'center' },
  sideRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  lineRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  animalBox: { alignItems: 'center' },
  hat: { fontSize: 22, lineHeight: 24, marginBottom: -8 },
  animal: { fontSize: 38, lineHeight: 44 },
  object: { fontSize: 60, lineHeight: 66 },
  big: { fontSize: 44, lineHeight: 50 },
  under: { width: 90, height: 96, alignItems: 'center', justifyContent: 'flex-end' },
  behind: { position: 'absolute', bottom: 4, alignItems: 'center', zIndex: 2 },
  front: { zIndex: 1, fontSize: 76, lineHeight: 84 },
  hatSmall: { fontSize: 16, lineHeight: 18, marginBottom: -6 },
  animalSmall: { fontSize: 32, lineHeight: 36 },
  arrow: { fontSize: 22, color: colors.textMuted, lineHeight: 24 },
});
