/**
 * Items of the official 2026 assessment. The app must never reuse them, so that
 * the child learns the skill and not the answers. Checked by validate.ts.
 */
export const OFFICIAL_F2_WORDS = ['demain', 'comme', 'enfant', 'rien', 'malade', 'visage', 'fille', 'mouton', 'chaud', 'oiseau'];

export const OFFICIAL_F8_SENTENCES = [
  'Amir mange une pomme.',
  'Les enfants échangent des cartes.',
  'Les déménageurs porteront les meubles.',
  'Les chevaux galopaient sur la plage.',
  'Le petit chat est sage.',
  'Nous étions amis.',
  'J’ai un nouveau cahier.',
  'Ils auront une bonne note.',
];

/** Official M3 lines, as "start-end". */
export const OFFICIAL_M3_LINES = ['29-31', '56-66', '0-20', '300-340', '120-140', '0-100', '46-50', '68-72', '60-70', '20-60', '93-97', '0-1000'];

/** Official M1 dictated numbers. */
export const OFFICIAL_M1_NUMBERS = [13, 22, 91, 541, 79, 880, 63, 674, 347, 904];

/** Official M11 calculations, as displayed ("…" is the blank). */
export const OFFICIAL_M11_FACTS = [
  '22 + 3 = …', '36 + 1 = …', '16 + … = 18', '13 + 10 = …', '25 + 9 = …', '41 + … = 49', '33 + 15 = …',
  '63 + 20 = …', '4 + … = 38', '57 + 3 = …', '… + 1 = 15', '36 + … = 39', '27 + 5 = …', '33 + 40 = …',
  '32 + 19 = …', '3 + … = 76', '83 + 10 = …', '50 + 17 = …', '15 + 54 = …', '55 + … = 65',
];

/** Official column operations (terms joined by + or -). */
export const OFFICIAL_COLUMN_OPS = ['43+53', '15+30+221', '83+6+556', '42+543+233', '595+45', '55-25', '578-241', '159-48'];

/** Official M6 decompositions, as displayed. */
export const OFFICIAL_M6_TEXTS = [
  '2 dizaines + 7 unités', '6 unités + 8 dizaines', '3 centaines + 2 dizaines + 5 unités',
  '3 dizaines + 4 unités + 6 centaines', '6 unités + 3 centaines', '50 dizaines', '5 dizaines + 20 unités',
  '33 unités + 4 dizaines + 1 centaine',
];
