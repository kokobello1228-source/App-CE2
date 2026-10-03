import type { Rng } from '../../engine/rng';
import { ADJECTIVES, adjectiveForm, determiner, NOUNS, nounForm, type Adjective, type Gender } from '../frLexicon';
import { createQcmSkill, type QcmItem } from '../qcm';
import type { Level } from '../types';

/**
 * F12 – Agreement in the noun group: determiner + noun + missing adjective;
 * choose the correctly agreed adjective among its 4 forms.
 * Levels from the score guide: 1 audible agreement, singular, adjective after the noun;
 * 2 plural; 3 adjective before the noun or inaudible feminine.
 */
function adjectivesFor(level: Level): Adjective[] {
  if (level === 1) return ADJECTIVES.filter((a) => a.position === 'after' && a.audible);
  if (level === 2) return ADJECTIVES.filter((a) => a.position === 'after');
  return ADJECTIVES;
}

const GENDER_WORDS: Record<Gender, string> = { m: 'masculin', f: 'féminin' };

export function generateF12(level: Level, rng: Rng): QcmItem {
  const noun = rng.pick(NOUNS);
  const adjective = rng.pick(adjectivesFor(level));
  const plural = level === 1 ? rng.chance(0.15) : rng.chance(0.65);
  const det = determiner(noun.gender, plural, rng.pick);
  const nounText = nounForm(noun, plural);
  const answer = adjectiveForm(adjective, noun.gender, plural);
  const group = adjective.position === 'before' ? `${det} …… ${nounText}` : `${det} ${nounText} ……`;
  const rule = noun.gender === 'f'
    ? plural ? 'on ajoute un e et un s' : 'on ajoute un e'
    : plural ? 'on ajoute un s' : 'on ne change rien';
  return {
    key: `F12:${det}:${noun.word}:${adjective.forms[0]}:${plural ? 'p' : 's'}`,
    level,
    id: `${noun.word}-${adjective.forms[0]}`,
    stem: `**${group}**`,
    question: 'Quel adjectif est bien accordé ?',
    choices: rng.shuffle([...adjective.forms]),
    answer,
    tag: `${noun.gender}${plural ? 'p' : 's'}`,
    say: `${group.replace('……', '')}. Quel adjectif est bien accordé ?`,
    explanation: `« ${nounText} » est ${GENDER_WORDS[noun.gender]} ${plural ? 'pluriel' : 'singulier'} (${det} ${nounText}) : ${rule}, ça donne « ${answer} ».`,
  };
}

export const f12Logic = createQcmSkill({
  id: 'F12',
  instruction: 'Complète le groupe de mots : choisis l’adjectif qui s’accorde avec le nom.',
  avgItemSeconds: 16,
  generate: generateF12,
  classify(item, answer) {
    const index = (form: string) => {
      for (const a of ADJECTIVES) {
        const i = a.forms.indexOf(form);
        if (i >= 0 && a.forms.includes(item.answer)) return i;
      }
      return -1;
    };
    const expected = index(item.answer);
    const chosen = index(answer);
    if (expected < 0 || chosen < 0) return 'other';
    const sameGender = expected % 2 === chosen % 2;
    const sameNumber = expected >= 2 === chosen >= 2;
    if (sameNumber && !sameGender) return 'gender';
    if (sameGender && !sameNumber) return 'number';
    return 'both';
  },
  errorTags: {
    gender: {
      label: 'Oublie le genre (féminin / masculin) dans l’accord',
      tip: 'Remplacez le déterminant par « un » ou « une » pour savoir si le nom est masculin ou féminin.',
    },
    number: {
      label: 'Oublie le pluriel de l’adjectif (le s ne s’entend pas)',
      tip: 'Faites une flèche du déterminant « les » vers l’adjectif : tout le groupe passe au pluriel.',
    },
    both: {
      label: 'Accord du groupe nominal pas encore compris',
      tip: 'Jouez à transformer : « un ballon vert » → « des ballons verts » → « une robe verte » → « des robes vertes ».',
    },
    other: { label: 'Accord à consolider', tip: 'Relisez le groupe à voix haute avec chaque adjectif proposé.' },
  },
});
