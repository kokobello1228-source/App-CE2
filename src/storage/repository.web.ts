import { MemoryStore, type Persistence } from './memoryStore';

export type { AttemptInput, SkillHistory } from './store';

const KEY = 'reperes-ce2:v1';

/** Browser storage. Private browsing can refuse it: the app then works without saving. */
const browserStorage: Persistence = {
  load() {
    try {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  },
  save(data) {
    try {
      globalThis.localStorage?.setItem(KEY, data);
    } catch {
      // Storage full or refused: keep going in memory.
    }
  },
};

/** Web version of the repository (same API as the SQLite one in repository.ts). */
export class Repository extends MemoryStore {
  static async open(): Promise<Repository> {
    // Ask the browser not to evict the data of the home-screen app.
    try {
      await globalThis.navigator?.storage?.persist?.();
    } catch {
      // Not supported: data is usually kept anyway for home-screen apps.
    }
    return new Repository(browserStorage);
  }
}
