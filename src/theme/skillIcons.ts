import type { SkillId } from '../../skills.config';

/** One pictogram per skill, to recognise it without reading. */
export const SKILL_ICONS: Record<SkillId, string> = {
  F1: '📖', F2: '✍️', F3: '👂', F4: '🖼️', F5: '🧩', F6: '👤', F7: '🏃', F8: '⏳', F9: '🔁',
  F10: '🔎', F11: '🌳', F12: '🤝', F13: '🏷️', F14: '🗣️',
  M1: '🔢', M2: '🧠', M3: '📏', M4: '➕', M5: '➖', M6: '🧱', M7: '🍕', M8: '🥧', M9: '🧊', M10: '⚡', M11: '🚀',
};
