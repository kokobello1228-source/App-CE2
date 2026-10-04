import { listFrenchVoices } from './speech';

jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn(() => Promise.resolve()), getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])), VoiceQuality: { Enhanced: 'Enhanced', Default: 'Default' } }));

const voice = (name: string, language = 'fr-FR', quality = 'Default') => ({ identifier: name, name, language, quality });

describe('device voice choice', () => {
  it('prefers a female French voice to Thomas', async () => {
    const list = await listFrenchVoices([voice('Thomas'), voice('Daniel', 'fr-FR', 'Enhanced'), voice('Amélie', 'fr-CA'), voice('Audrey'), voice('Samantha', 'en-US')] as never);
    expect(list[0].name).toBe('Audrey');
    expect(list.map((v) => v.name)).not.toContain('Samantha');
    expect(list.findIndex((v) => v.name === 'Thomas')).toBeGreaterThan(list.findIndex((v) => v.name === 'Amélie'));
  });
});
