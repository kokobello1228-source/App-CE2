/**
 * French number words (0–1000), traditional spelling with hyphens as taught in CE2.
 * Used by speech synthesis (more reliable than letting the engine read digits)
 * and by explanations.
 */
const UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const TENS: Record<number, string> = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante' };

function belowHundred(n: number): string {
  if (n <= 16) return UNITS[n];
  if (n < 20) return `dix-${UNITS[n - 10]}`;
  const tens = Math.floor(n / 10);
  const unit = n % 10;
  if (tens === 7) return unit === 1 ? 'soixante et onze' : `soixante-${belowHundred(10 + unit)}`;
  if (tens === 8) return unit === 0 ? 'quatre-vingts' : `quatre-vingt-${UNITS[unit]}`;
  if (tens === 9) return `quatre-vingt-${belowHundred(10 + unit)}`;
  if (unit === 0) return TENS[tens];
  if (unit === 1) return `${TENS[tens]} et un`;
  return `${TENS[tens]}-${UNITS[unit]}`;
}

export function frenchNumber(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 1000) throw new Error(`Unsupported number ${n}`);
  if (n === 1000) return 'mille';
  if (n < 100) return belowHundred(n);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const head = hundreds === 1 ? 'cent' : `${UNITS[hundreds]} cent`;
  if (rest === 0) return hundreds === 1 ? 'cent' : `${head}s`;
  // "quatre-vingts" loses its s when followed by another number.
  return `${head} ${belowHundred(rest)}`;
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}
