/** Shared helpers for answer parsing and normalisation. */

/** Parses a typed whole number ("  45 " -> 45). Returns null if not a number. */
export function parseWholeNumber(answer: string): number | null {
  const cleaned = answer.replace(/\s/g, '');
  if (!/^\d{1,4}$/.test(cleaned)) return null;
  return Number(cleaned);
}

export function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Lower case, unified apostrophes, single spaces. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
