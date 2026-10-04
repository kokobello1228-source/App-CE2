import { clipKey, normalizeSegment, segments, spellAloud, spokenForm } from './voiceClips';

describe('voice clip segmentation', () => {
  it('cuts at sentence ends only', () => {
    expect(segments('Tu as bien réussi. Choix : un ; deux ; trois ?')).toEqual(['Tu as bien réussi.', 'Choix : un ; deux ; trois ?']);
  });
  it('never leaves a very short sentence alone', () => {
    expect(segments('Bravo ! Tu as réussi 3 questions.')).toEqual(['Bravo ! Tu as réussi 3 questions.']);
    expect(segments('Le mot à écrire est chat. Le chat dort. Chat.')).toEqual(['Le mot à écrire est chat.', 'Le chat dort. Chat.']);
    expect(segments('Super !')).toEqual(['Super !']);
  });
  it('keeps commas inside a segment and drops lone punctuation', () => {
    expect(segments('Aujourd’hui, Léo joue bien. »')).toEqual(['Aujourd’hui, Léo joue bien.']);
  });
  it('gives the same key whatever the case, quotes or final punctuation', () => {
    expect(normalizeSegment('« Bravo ! »')).toBe('bravo');
    expect(clipKey('Très fatigué ?')).toBe(clipKey('très fatigué'));
    expect(clipKey('l’école')).toBe(clipKey("l'école"));
    expect(clipKey('chat')).not.toBe(clipKey('chats'));
  });
});

describe('spoken form', () => {
  it('spells with letter names, doubled letters and accents', () => {
    expect(spellAloud([...'pomme'])).toBe('p, o, deux m, euh');
    expect(spokenForm('On écrit « cabane » : c-a-b-a-n-e.')).toBe('On écrit « cabane » : c, a, b, a, n, euh.');
    expect(spokenForm('é-l-è-v-e')).toBe('euh accent aigu, l, euh accent grave, v, euh');
    expect(spokenForm('g-a-r-ç-o-n')).toBe('g, a, r, c cédille, o, n');
  });
  it('leaves hyphenated words alone and reads "+" as "plus"', () => {
    expect(spokenForm('Peut-être, a-t-il vingt-deux ans ?')).toBe('Peut-être, a-t-il vingt-deux ans ?');
    expect(spokenForm('3 dizaines + 4 unités')).toBe('3 dizaines plus 4 unités');
  });
  it('reads calculations in words', () => {
    expect(spokenForm('6 − 3 = 3, et 2 × 4 = 8.')).toBe('6 moins 3 égale 3, et 2 fois 4 égale 8.');
    expect(spokenForm('Il paie 12 €.')).toBe('Il paie 12 euros.');
  });
});
