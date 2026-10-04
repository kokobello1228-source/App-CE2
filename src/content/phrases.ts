/** Phrases said by Plume (also pre-recorded with the natural voice). */
/** Never a single word: alone, the neural voice garbles it ("Excellent !" heard "assez lent"). */
export const CHEERS = ['Bravo, c’est juste !', 'Super, bien joué !', 'Génial, tu as trouvé !', 'Excellent travail !', 'Trop fort, bravo !', 'Parfait, c’est ça !'];
export const RETRY_TITLE = 'Presque ! Regarde bien.';
export const HELLO = 'Bonjour !';
export const MISSION_QUESTION = 'On part en mission aujourd’hui ?';

export function streakCheer(days: number): string {
  return `Déjà ${days} jours de suite, bravo !`;
}

export function homeGreeting(streak: number): string {
  return streak > 1 ? streakCheer(streak) : MISSION_QUESTION;
}

/** Spoken at the end of a session (the name is only shown, not said). */
export function summarySpeech(correct: number, total: number): string {
  return `Bravo ! Tu as réussi ${correct} question${correct > 1 ? 's' : ''}. Il y en avait ${total}.`;
}

export const VOICE_SAMPLE = 'Bonjour ! Écoute bien : le chat dort sur le tapis. Combien font trois plus quatre ?';

export const FLUENCY_INSTRUCTION =
  'Tu vas lire un texte à voix haute. Lis aussi bien et aussi vite que tu peux. Tu as une minute. Si tu bloques sur un mot, passe au suivant.';
