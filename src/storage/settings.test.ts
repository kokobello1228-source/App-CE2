import { DEFAULT_SETTINGS, VOICE_DEFAULTS_VERSION, voiceDefaultsPatch } from './settings';

describe('voiceDefaultsPatch', () => {
  it('gives Plume to a new device', () => {
    expect(voiceDefaultsPatch(DEFAULT_SETTINGS)).toEqual({ naturalVoice: true, voiceDefaultsVersion: VOICE_DEFAULTS_VERSION });
  });

  it('switches back to Plume a device that had chosen a device voice before', () => {
    const before = { ...DEFAULT_SETTINGS, naturalVoice: false, voiceId: 'com.apple.voice.Thomas' };
    expect(voiceDefaultsPatch(before)?.naturalVoice).toBe(true);
  });

  it('keeps a voice chosen after the default was applied', () => {
    const after = { ...DEFAULT_SETTINGS, naturalVoice: false, voiceDefaultsVersion: VOICE_DEFAULTS_VERSION };
    expect(voiceDefaultsPatch(after)).toBeNull();
  });
});
