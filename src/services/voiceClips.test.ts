import { clipKey, normalizeSegment, segments } from './voiceClips';

describe('voice clip segmentation', () => {
  it('cuts at sentence ends, colons, semicolons and "+"', () => {
    expect(segments('Bravo ! Tu as réussi. Choix : un ; deux ; trois ?')).toEqual(['Bravo !', 'Tu as réussi.', 'Choix :', 'un ;', 'deux ;', 'trois ?']);
    expect(segments('3 dizaines + 4 unités. Quel est ce nombre ?')).toEqual(['3 dizaines', 'plus', '4 unités.', 'Quel est ce nombre ?']);
  });
  it('keeps commas inside a segment and drops lone punctuation', () => {
    expect(segments('Aujourd’hui, Léo joue. »')).toEqual(['Aujourd’hui, Léo joue.']);
  });
  it('gives the same key whatever the case, quotes or final punctuation', () => {
    expect(normalizeSegment('« Bravo ! »')).toBe('bravo');
    expect(clipKey('Très fatigué ?')).toBe(clipKey('très fatigué'));
    expect(clipKey('l’école')).toBe(clipKey("l'école"));
    expect(clipKey('chat')).not.toBe(clipKey('chats'));
  });
});
