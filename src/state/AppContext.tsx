import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { setSoundsEnabled } from '../services/feedback';
import { setNaturalVoice, setSpeechRate, setVoice } from '../services/speech';
import { Repository } from '../storage/repository';
import { DEFAULT_SETTINGS, voiceDefaultsPatch, type Settings } from '../storage/settings';

interface AppState {
  repo: Repository;
  settings: Settings;
  updateSettings(patch: Partial<Settings>): Promise<void>;
  /** Incremented after each session so screens reload their data. */
  dataVersion: number;
  notifyDataChanged(): void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [repo, setRepo] = useState<Repository | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const opened = await Repository.open();
      let stored = await opened.getSettings();
      const patch = voiceDefaultsPatch(stored);
      if (patch) {
        await opened.saveSettings(patch);
        stored = { ...stored, ...patch };
      }
      if (cancelled) return;
      setSpeechRate(stored.voiceRate);
      setVoice(stored.voiceId);
      setSoundsEnabled(stored.sounds);
      setNaturalVoice(stored.naturalVoice, stored.naturalVoiceId);
      setSettings(stored);
      setRepo(opened);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      if (!repo) return;
      await repo.saveSettings(patch);
      setSettings((previous) => {
        const next = { ...previous, ...patch };
        setSpeechRate(next.voiceRate);
        setVoice(next.voiceId);
        setSoundsEnabled(next.sounds);
        setNaturalVoice(next.naturalVoice, next.naturalVoiceId);
        return next;
      });
    },
    [repo],
  );

  const notifyDataChanged = useCallback(() => setDataVersion((v) => v + 1), []);

  if (!repo) return <>{fallback}</>;
  return (
    <AppContext.Provider value={{ repo, settings, updateSettings, dataVersion, notifyDataChanged }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
