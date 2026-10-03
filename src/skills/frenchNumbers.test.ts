import { frenchNumber } from './frenchNumbers';

describe('frenchNumber', () => {
  it.each([
    [0, 'zéro'], [1, 'un'], [16, 'seize'], [17, 'dix-sept'], [21, 'vingt et un'], [22, 'vingt-deux'],
    [70, 'soixante-dix'], [71, 'soixante et onze'], [77, 'soixante-dix-sept'], [80, 'quatre-vingts'],
    [81, 'quatre-vingt-un'], [90, 'quatre-vingt-dix'], [91, 'quatre-vingt-onze'], [99, 'quatre-vingt-dix-neuf'],
    [100, 'cent'], [101, 'cent un'], [200, 'deux cents'], [280, 'deux cent quatre-vingts'],
    [305, 'trois cent cinq'], [571, 'cinq cent soixante et onze'], [999, 'neuf cent quatre-vingt-dix-neuf'],
    [1000, 'mille'],
  ])('%i -> %s', (n, words) => {
    expect(frenchNumber(n)).toBe(words);
  });
});
