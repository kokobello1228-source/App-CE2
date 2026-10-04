/**
 * Pre-recorded natural voice ("Plume", neural voice generated offline).
 * A spoken text is first rewritten into what must actually be said (spokenForm),
 * then cut into sentences (segments); each segment has a clip named after a hash
 * of its normalised text. Used by the speech service at runtime and by
 * scripts/voice/collect.ts to know which clips to generate.
 */

/** A sentence shorter than this is never recorded alone: neural voices garble isolated words. */
export const MIN_SEGMENT_WORDS = 3;

const ACCENTED: Record<string, string> = {
  é: 'euh accent aigu',
  è: 'euh accent grave',
  ê: 'euh accent circonflexe',
  ë: 'euh tréma',
  à: 'a accent grave',
  â: 'a accent circonflexe',
  î: 'i accent circonflexe',
  ï: 'i tréma',
  ô: 'o accent circonflexe',
  ù: 'u accent grave',
  û: 'u accent circonflexe',
  ü: 'u tréma',
  ç: 'c cédille',
  œ: 'o euh collés',
};

/** Letter e said "euh": a bare "e" at the end of a spelling is often heard as "o". */
const LETTER_NAMES: Record<string, string> = { e: 'euh' };

/** Letters said one by one, as a teacher spells: "pomme" -> "p, o, deux m, euh". */
export function spellAloud(letters: string[]): string {
  const out: string[] = [];
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i].toLowerCase();
    const name = ACCENTED[letter] ?? LETTER_NAMES[letter] ?? letter;
    if (letters[i + 1]?.toLowerCase() === letter) {
      out.push(`deux ${name}`);
      i++;
    } else {
      out.push(name);
    }
  }
  return out.join(', ');
}

/**
 * What must be said for a displayed text: spelled words ("c-a-b-a-n-e") become
 * letter names and calculations are read in words ("6 − 3 = 3" -> "6 moins 3 égale 3").
 * Applied before every reading, so the device voice benefits too.
 */
export function spokenForm(text: string): string {
  return text
    .replace(/(?<![\p{L}-])\p{L}(?:-\p{L})+(?!-?\p{L})/gu, (spelled) => spellAloud(spelled.split('-')))
    .replace(/\s\+\s/g, ' plus ')
    .replace(/\s[−-]\s/g, ' moins ')
    .replace(/\s×\s/g, ' fois ')
    .replace(/\s=\s/g, ' égale ')
    .replace(/(\d)\s?€/g, (_, d: string) => `${d} euros`);
}

const wordCount = (text: string) => text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/**
 * Cuts a spoken text into sentences. A very short sentence ("Bravo !", a single
 * word) is kept with its neighbour so that it is never synthesized alone.
 */
export function segments(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?…])\s+/)
    .map((p) => p.trim())
    .filter((p) => p && /[\p{L}\p{N}]/u.test(p));
  const out: string[] = [];
  let pending = '';
  for (const part of parts) {
    const joined = pending ? `${pending} ${part}` : part;
    if (wordCount(joined) < MIN_SEGMENT_WORDS) pending = joined;
    else {
      out.push(joined);
      pending = '';
    }
  }
  if (pending) {
    if (out.length > 0) out[out.length - 1] = `${out[out.length - 1]} ${pending}`;
    else out.push(pending);
  }
  return out;
}

/** Normalised form of a segment (case, apostrophes, quotes and edge punctuation ignored). */
export function normalizeSegment(segment: string): string {
  return segment
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’`´]/g, "'")
    .replace(/[«»"]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.,!?…:;]+|[\s.,!?…:;]+$/g, '')
    .trim();
}

/** FNV-1a 32-bit hash, written in base 36: the clip file name. */
export function clipKey(segment: string): string {
  const text = normalizeSegment(segment);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}
