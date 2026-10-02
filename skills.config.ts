/**
 * Official reference for the "Repères CE2" national assessment.
 *
 * This is the single file to update each school year: item counts, official
 * durations, timing format and score thresholds (number of successful items
 * for the "à besoins" / "fragile" / "satisfaisant" bands).
 *
 * Source: Éduscol, "Évaluations Repères CE2 2026" (guide du professeur and
 * guide des scores).
 */

export type Domain = 'fr' | 'math';

export type SkillId =
  | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12' | 'F13' | 'F14'
  | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10' | 'M11';

export type Band = 'besoins' | 'fragile' | 'satisfaisant';

/**
 * How the official assessment times a skill.
 * - perItem: each item has its own countdown (e.g. 20 s per dictated word).
 * - global: one countdown for the whole block (e.g. 6 min for 12 items).
 * - speed: "as many as possible" within the countdown (fact fluency).
 */
export type Timing =
  | { kind: 'perItem'; seconds: number }
  | { kind: 'global'; seconds: number }
  | { kind: 'speed'; seconds: number };

export interface SkillConfig {
  id: SkillId;
  domain: Domain;
  title: string;
  /** Short official format description, shown to the parent. */
  format: string;
  officialItems: number;
  officialDurationSec: number;
  timing: Timing;
  /** Officially read aloud to the pupil (we use speech synthesis). */
  heard: boolean;
  /** Score group used for thresholds (some skills are scored together). */
  scoreGroup: ScoreGroupId;
}

export type ScoreGroupId =
  | 'F1' | 'F2' | 'F3F4' | 'F5' | 'F6F7' | 'F8F9' | 'F10' | 'F11' | 'F12' | 'F13' | 'F14'
  | 'M1' | 'M2' | 'M3' | 'M4M5' | 'M6' | 'M7M8' | 'M9' | 'M10' | 'M11';

export interface ScoreGroup {
  id: ScoreGroupId;
  skills: SkillId[];
  /** Maximum score (number of items). For F14 this is a words-per-minute target, not a max. */
  maxScore: number;
  /** Minimum score to be "fragile" (below: "à besoins"). */
  fragileMin: number;
  /** Minimum score to be "satisfaisant". */
  satisfaisantMin: number;
  unit: 'items' | 'wcpm';
}

export const SCORE_GROUPS: Record<ScoreGroupId, ScoreGroup> = {
  F1: { id: 'F1', skills: ['F1'], maxScore: 8, fragileMin: 3, satisfaisantMin: 5, unit: 'items' },
  F2: { id: 'F2', skills: ['F2'], maxScore: 10, fragileMin: 4, satisfaisantMin: 7, unit: 'items' },
  F3F4: { id: 'F3F4', skills: ['F3', 'F4'], maxScore: 12, fragileMin: 7, satisfaisantMin: 9, unit: 'items' },
  F5: { id: 'F5', skills: ['F5'], maxScore: 10, fragileMin: 4, satisfaisantMin: 6, unit: 'items' },
  F6F7: { id: 'F6F7', skills: ['F6', 'F7'], maxScore: 8, fragileMin: 3, satisfaisantMin: 5, unit: 'items' },
  F8F9: { id: 'F8F9', skills: ['F8', 'F9'], maxScore: 16, fragileMin: 6, satisfaisantMin: 10, unit: 'items' },
  F10: { id: 'F10', skills: ['F10'], maxScore: 8, fragileMin: 4, satisfaisantMin: 7, unit: 'items' },
  F11: { id: 'F11', skills: ['F11'], maxScore: 8, fragileMin: 3, satisfaisantMin: 5, unit: 'items' },
  F12: { id: 'F12', skills: ['F12'], maxScore: 8, fragileMin: 3, satisfaisantMin: 5, unit: 'items' },
  F13: { id: 'F13', skills: ['F13'], maxScore: 8, fragileMin: 3, satisfaisantMin: 5, unit: 'items' },
  F14: { id: 'F14', skills: ['F14'], maxScore: 70, fragileMin: 50, satisfaisantMin: 70, unit: 'wcpm' },
  M1: { id: 'M1', skills: ['M1'], maxScore: 10, fragileMin: 6, satisfaisantMin: 9, unit: 'items' },
  M2: { id: 'M2', skills: ['M2'], maxScore: 8, fragileMin: 3, satisfaisantMin: 6, unit: 'items' },
  M3: { id: 'M3', skills: ['M3'], maxScore: 12, fragileMin: 5, satisfaisantMin: 7, unit: 'items' },
  M4M5: { id: 'M4M5', skills: ['M4', 'M5'], maxScore: 8, fragileMin: 3, satisfaisantMin: 7, unit: 'items' },
  M6: { id: 'M6', skills: ['M6'], maxScore: 8, fragileMin: 3, satisfaisantMin: 5, unit: 'items' },
  M7M8: { id: 'M7M8', skills: ['M7', 'M8'], maxScore: 10, fragileMin: 5, satisfaisantMin: 8, unit: 'items' },
  M9: { id: 'M9', skills: ['M9'], maxScore: 8, fragileMin: 4, satisfaisantMin: 7, unit: 'items' },
  M10: { id: 'M10', skills: ['M10'], maxScore: 20, fragileMin: 10, satisfaisantMin: 14, unit: 'items' },
  M11: { id: 'M11', skills: ['M11'], maxScore: 20, fragileMin: 8, satisfaisantMin: 13, unit: 'items' },
};

export const SKILLS: Record<SkillId, SkillConfig> = {
  F1: {
    id: 'F1', domain: 'fr', title: 'Comprendre un texte lu',
    format: 'Texte narratif lu seul, puis QCM à 4 choix',
    officialItems: 8, officialDurationSec: 900, timing: { kind: 'global', seconds: 900 },
    heard: false, scoreGroup: 'F1',
  },
  F2: {
    id: 'F2', domain: 'fr', title: 'Écrire des mots dictés',
    format: 'Mot dicté 2 fois, 20 s par mot',
    officialItems: 10, officialDurationSec: 200, timing: { kind: 'perItem', seconds: 20 },
    heard: true, scoreGroup: 'F2',
  },
  F3: {
    id: 'F3', domain: 'fr', title: 'Comprendre un texte entendu',
    format: 'Texte documentaire lu 2 fois, QCM lu à voix haute, 30 s par question',
    officialItems: 6, officialDurationSec: 600, timing: { kind: 'perItem', seconds: 30 },
    heard: true, scoreGroup: 'F3F4',
  },
  F4: {
    id: 'F4', domain: 'fr', title: 'Comprendre des phrases entendues',
    format: 'Phrase entendue, choisir l’image parmi 4',
    officialItems: 6, officialDurationSec: 120, timing: { kind: 'perItem', seconds: 20 },
    heard: true, scoreGroup: 'F3F4',
  },
  F5: {
    id: 'F5', domain: 'fr', title: 'Comprendre des phrases lues',
    format: 'Phrase à trou, choisir le mot parmi 4',
    officialItems: 10, officialDurationSec: 200, timing: { kind: 'perItem', seconds: 20 },
    heard: false, scoreGroup: 'F5',
  },
  F6: {
    id: 'F6', domain: 'fr', title: 'Identifier le sujet',
    format: 'Trouver le sujet parmi 4 groupes de mots',
    officialItems: 4, officialDurationSec: 80, timing: { kind: 'perItem', seconds: 20 },
    heard: true, scoreGroup: 'F6F7',
  },
  F7: {
    id: 'F7', domain: 'fr', title: 'Identifier le verbe conjugué',
    format: 'Trouver le verbe parmi 4 groupes de mots',
    officialItems: 4, officialDurationSec: 80, timing: { kind: 'perItem', seconds: 20 },
    heard: true, scoreGroup: 'F6F7',
  },
  F8: {
    id: 'F8', domain: 'fr', title: 'Identifier le temps d’un verbe',
    format: 'Verbe souligné : imparfait, présent, futur ou passé composé',
    officialItems: 8, officialDurationSec: 120, timing: { kind: 'perItem', seconds: 15 },
    heard: true, scoreGroup: 'F8F9',
  },
  F9: {
    id: 'F9', domain: 'fr', title: 'Reconnaître la forme d’un verbe',
    format: 'Trouver la phrase au temps demandé parmi 4',
    officialItems: 8, officialDurationSec: 160, timing: { kind: 'perItem', seconds: 20 },
    heard: true, scoreGroup: 'F8F9',
  },
  F10: {
    id: 'F10', domain: 'fr', title: 'Trouver un synonyme',
    format: 'Choisir le sens d’un mot peu courant parmi 4',
    officialItems: 8, officialDurationSec: 160, timing: { kind: 'perItem', seconds: 20 },
    heard: true, scoreGroup: 'F10',
  },
  F11: {
    id: 'F11', domain: 'fr', title: 'Mots de la même famille',
    format: 'Trouver l’intrus parmi 4 mots',
    officialItems: 8, officialDurationSec: 160, timing: { kind: 'perItem', seconds: 20 },
    heard: true, scoreGroup: 'F11',
  },
  F12: {
    id: 'F12', domain: 'fr', title: 'Accorder dans le groupe nominal',
    format: 'Choisir l’adjectif bien accordé parmi 4',
    officialItems: 8, officialDurationSec: 160, timing: { kind: 'perItem', seconds: 20 },
    heard: true, scoreGroup: 'F12',
  },
  F13: {
    id: 'F13', domain: 'fr', title: 'Classes de mots',
    format: 'Déterminant, nom commun, adjectif ou nom propre',
    officialItems: 8, officialDurationSec: 160, timing: { kind: 'perItem', seconds: 20 },
    heard: true, scoreGroup: 'F13',
  },
  F14: {
    id: 'F14', domain: 'fr', title: 'Lire à voix haute',
    format: 'Lire un texte pendant 1 minute',
    officialItems: 1, officialDurationSec: 60, timing: { kind: 'global', seconds: 60 },
    heard: false, scoreGroup: 'F14',
  },
  M1: {
    id: 'M1', domain: 'math', title: 'Écrire des nombres',
    format: 'Nombre dicté 2 fois, 5 s pour l’écrire',
    officialItems: 10, officialDurationSec: 60, timing: { kind: 'perItem', seconds: 5 },
    heard: true, scoreGroup: 'M1',
  },
  M2: {
    id: 'M2', domain: 'math', title: 'Résoudre des problèmes',
    format: 'Énoncé lu 2 fois, réponse parmi 6 nombres, 1 min 30 par problème',
    officialItems: 8, officialDurationSec: 720, timing: { kind: 'perItem', seconds: 90 },
    heard: true, scoreGroup: 'M2',
  },
  M3: {
    id: 'M3', domain: 'math', title: 'Ligne graduée',
    format: 'Écrire le nombre montré par la flèche',
    officialItems: 12, officialDurationSec: 360, timing: { kind: 'global', seconds: 360 },
    heard: false, scoreGroup: 'M3',
  },
  M4: {
    id: 'M4', domain: 'math', title: 'Additions posées',
    format: 'Additions en colonnes, 2 ou 3 termes',
    officialItems: 5, officialDurationSec: 200, timing: { kind: 'global', seconds: 200 },
    heard: false, scoreGroup: 'M4M5',
  },
  M5: {
    id: 'M5', domain: 'math', title: 'Soustractions posées',
    format: 'Soustractions en colonnes, sans retenue',
    officialItems: 3, officialDurationSec: 120, timing: { kind: 'global', seconds: 120 },
    heard: false, scoreGroup: 'M4M5',
  },
  M6: {
    id: 'M6', domain: 'math', title: 'Unités de numération',
    format: 'Décomposition entendue, choisir le nombre',
    officialItems: 8, officialDurationSec: 160, timing: { kind: 'perItem', seconds: 20 },
    heard: true, scoreGroup: 'M6',
  },
  M7: {
    id: 'M7', domain: 'math', title: 'Lire des fractions',
    format: 'Fraction entendue, choisir l’écriture chiffrée',
    officialItems: 5, officialDurationSec: 100, timing: { kind: 'perItem', seconds: 20 },
    heard: true, scoreGroup: 'M7M8',
  },
  M8: {
    id: 'M8', domain: 'math', title: 'Représenter des fractions',
    format: 'Fraction entendue, choisir la figure',
    officialItems: 5, officialDurationSec: 150, timing: { kind: 'perItem', seconds: 30 },
    heard: true, scoreGroup: 'M7M8',
  },
  M9: {
    id: 'M9', domain: 'math', title: 'Dénombrer des collections',
    format: 'Cubes, barres et plaques : écrire le total',
    officialItems: 8, officialDurationSec: 160, timing: { kind: 'global', seconds: 160 },
    heard: false, scoreGroup: 'M9',
  },
  M10: {
    id: 'M10', domain: 'math', title: 'Faits numériques',
    format: 'Un maximum de calculs en 1 minute',
    officialItems: 20, officialDurationSec: 60, timing: { kind: 'speed', seconds: 60 },
    heard: false, scoreGroup: 'M10',
  },
  M11: {
    id: 'M11', domain: 'math', title: 'Calcul mental',
    format: 'Un maximum de calculs en 3 minutes',
    officialItems: 20, officialDurationSec: 180, timing: { kind: 'speed', seconds: 180 },
    heard: false, scoreGroup: 'M11',
  },
};

export const SKILL_ORDER: SkillId[] = [
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'F13', 'F14',
  'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11',
];
