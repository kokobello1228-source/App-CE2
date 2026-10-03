/**
 * Pre-recorded natural voice ("Plume", neural voice generated offline).
 * A spoken text is cut into segments (sentences, list items, "plus"); each segment
 * has a clip named after a hash of its normalised text. Used by the speech service
 * at runtime and by scripts/voice/collect.ts to know which clips to generate.
 */

/** Cuts a text where a natural pause happens. " + " becomes the word "plus". */
export function segments(text: string): string[] {
  const out: string[] = [];
  for (const part of text.replace(/\s\+\s/g, ' | plus | ').split(/(?<=[.!?…:;])\s+|\s\|\s/)) {
    const clean = part.trim();
    if (clean && /[\p{L}\p{N}]/u.test(clean)) out.push(clean);
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
