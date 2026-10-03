/**
 * Original word-problem templates for M2 (no official statement is reused).
 * Placeholders: {N} first name, {il}/{Il} pronoun, {a} {b} {c} {t} numbers.
 */
export type ProblemType =
  | 'combine' | 'missingPart' | 'gain' | 'loss' | 'initialLoss' | 'initialGain'
  | 'twoStepBus' | 'twoStepPrice' | 'twoStepChange' | 'multiply' | 'quotition' | 'partition';

export const NAMES: { name: string; f: boolean }[] = [
  { name: 'Léa', f: true }, { name: 'Sami', f: false }, { name: 'Inès', f: true }, { name: 'Hugo', f: false },
  { name: 'Aya', f: true }, { name: 'Noah', f: false }, { name: 'Jade', f: true }, { name: 'Malik', f: false },
  { name: 'Lina', f: true }, { name: 'Tom', f: false }, { name: 'Chloé', f: true }, { name: 'Yanis', f: false },
  { name: 'Nora', f: true }, { name: 'Lucas', f: false }, { name: 'Fatou', f: true }, { name: 'Enzo', f: false },
  { name: 'Maëlle', f: true }, { name: 'Karim', f: false }, { name: 'Rose', f: true }, { name: 'Théo', f: false },
];

export const TEMPLATES: Record<ProblemType, string[]> = {
  combine: [
    'Dans un verger, il y a {a} pommiers et {b} poiriers. Combien d’arbres y a-t-il dans le verger ?',
    '{N} a {a} cartes de football et {b} cartes de dinosaures. Combien de cartes {N} a-t-{il} en tout ?',
    'Dans la bibliothèque de l’école, il y a {a} albums et {b} bandes dessinées. Combien de livres y a-t-il en tout ?',
    'Au zoo, on compte {a} flamants roses et {b} pingouins. Combien d’oiseaux y a-t-il en tout ?',
  ],
  missingPart: [
    'Dans une boîte de {a} crayons, {b} crayons sont rouges. Les autres sont bleus. Combien de crayons sont bleus ?',
    'Dans un parking de {a} places, {b} places sont occupées. Combien de places sont libres ?',
    'L’école de musique accueille {a} élèves. {b} élèves jouent du piano, les autres jouent de la guitare. Combien d’élèves jouent de la guitare ?',
    'Un livre a {a} pages. {N} en a déjà lu {b}. Combien de pages lui reste-t-il à lire ?',
  ],
  gain: [
    '{N} a {a} billes. À la récréation, {il} en gagne {b}. Combien de billes {N} a-t-{il} maintenant ?',
    'Dans le car, il y a {a} enfants. À l’arrêt, {b} enfants montent. Combien d’enfants y a-t-il dans le car maintenant ?',
    'Une poule a pondu {a} œufs cette semaine et {b} œufs la semaine suivante. Combien d’œufs a-t-elle pondus en tout ?',
  ],
  loss: [
    '{N} a {a} euros dans sa tirelire. {Il} achète un jeu à {b} euros. Combien d’argent lui reste-t-il ?',
    'Un fleuriste a {a} roses. Il en vend {b}. Combien de roses lui reste-t-il ?',
    'Sur un arbre, il y a {a} feuilles. Le vent en fait tomber {b}. Combien de feuilles reste-t-il sur l’arbre ?',
  ],
  initialLoss: [
    '{N} a perdu {b} autocollants. Maintenant, {il} en a {c}. Combien d’autocollants {N} avait-{il} avant ?',
    'Ce matin, le boulanger a vendu {b} croissants. Il lui en reste {c}. Combien de croissants avait-il au début ?',
    '{N} a donné {b} images à son frère. Il lui en reste {c}. Combien d’images {N} avait-{il} avant ?',
  ],
  initialGain: [
    '{N} a reçu {b} perles pour son anniversaire. Maintenant, {il} en a {c}. Combien de perles {N} avait-{il} avant ?',
    'Le fermier a acheté {b} moutons. Maintenant, il en a {c}. Combien de moutons avait-il avant ?',
  ],
  twoStepBus: [
    'Dans le train, il y a {a} voyageurs. À la gare, {b} voyageurs descendent et {c} voyageurs montent. Combien de voyageurs y a-t-il dans le train maintenant ?',
    '{N} a {a} perles. {Il} en utilise {b} pour faire un collier, puis sa grand-mère lui en donne {c}. Combien de perles {N} a-t-{il} maintenant ?',
  ],
  twoStepPrice: [
    '{N} achète un ballon à {a} euros, un sifflet à {b} euros et une casquette. {Il} dépense {t} euros en tout. Quel est le prix de la casquette ?',
    'Pour la fête, la classe achète des jus de fruits à {a} euros, des gâteaux à {b} euros et des ballons. Elle dépense {t} euros en tout. Combien coûtent les ballons ?',
  ],
  twoStepChange: [
    'Au marché, {N} achète des fraises à {a} euros et des cerises à {b} euros. {Il} paie avec un billet de {t} euros. Combien d’argent lui rend-on ?',
  ],
  multiply: [
    '{N} a {a} boîtes. Chaque boîte contient {b} feutres. Combien de feutres {N} a-t-{il} en tout ?',
    'Un paquet contient {b} biscuits. {N} achète {a} paquets. Combien de biscuits {N} a-t-{il} ?',
    'Dans la salle, il y a {a} rangées de {b} chaises. Combien de chaises y a-t-il ?',
  ],
  quotition: [
    '{N} a {t} œufs. {Il} les range dans des boîtes de {b} œufs. Combien de boîtes {N} remplit-{il} ?',
    'Le professeur de sport a {t} élèves. Il fait des équipes de {b} élèves. Combien d’équipes y a-t-il ?',
  ],
  partition: [
    '{N} partage {t} bonbons entre {a} amis. Chacun reçoit le même nombre de bonbons. Combien de bonbons reçoit chaque ami ?',
    'Le jardinier plante {t} fleurs dans {a} jardinières, avec le même nombre de fleurs dans chacune. Combien de fleurs y a-t-il dans chaque jardinière ?',
  ],
};
