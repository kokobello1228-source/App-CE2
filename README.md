# Repères CE2

Application mobile d'entraînement aux évaluations nationales « Repères CE2 », pour Mia.
100 % hors ligne : pas de compte, pas de serveur, pas de publicité, aucune donnée collectée.

## État actuel : étape 1 (version minimale)

| Compétence | Contenu |
|---|---|
| M10 – Faits numériques | Générateur : tables d'addition, doubles, compléments à 10, calculs à trou (3 niveaux) |
| M3 – Ligne graduée | Générateur : pas de 1, 2, 5, 10, 100, bornes non nulles, repères au milieu (3 niveaux) |
| F8 – Temps du verbe | 60 phrases originales (imparfait, présent, futur, passé composé), lues à voix haute |
| F2 – Mots dictés | 150 mots fréquents classés en 3 niveaux, dictés 2 fois avec une phrase de contexte |

Fonctionnalités incluses : séance du jour, entraînement libre, « Comme à l'école » (par
compétence, avec les durées officielles), synthèse vocale, retour immédiat expliqué, difficulté
adaptative, répétition espacée des erreurs, étoiles et série de jours, espace parent provisoire
(positionnement estimé, erreur fréquente et conseil, réglages).

## Lancer l'application sur le téléphone (Expo Go)

1. Sur le téléphone, installer (ou mettre à jour) **Expo Go** depuis l'App Store ou le Play Store.
   Le projet utilise le SDK Expo 57 : il faut la version récente d'Expo Go.
2. Sur l'ordinateur (Node.js 20 ou plus récent) :
   ```bash
   git clone <url-du-dépôt> App-CE2
   cd App-CE2
   git checkout claude/new-session-dbdg8i
   npm install
   npx expo start
   ```
3. Scanner le QR code affiché :
   - **iPhone** : avec l'appareil photo, puis ouvrir dans Expo Go ;
   - **Android** : depuis l'application Expo Go (« Scan QR code »).

Le téléphone et l'ordinateur doivent être sur le même Wi-Fi. Si le réseau bloque la connexion
(Wi-Fi public, VPN), utiliser `npx expo start --tunnel`.

### Conseils

- **Voix** : la qualité dépend des voix françaises installées sur le téléphone.
  - iPhone : Réglages → Accessibilité → Contenu énoncé → Voix → Français → télécharger une voix
    « améliorée » (par exemple Audrey ou Thomas). L'application choisit automatiquement une voix améliorée.
  - Android : Paramètres → Gestion globale / Système → Synthèse vocale → moteur Google → installer
    les données vocales « Français (France) ».
- Si aucun son ne sort sur iPhone, vérifier que le bouton silencieux est désactivé.
- **Espace parent** : accessible en bas de l'accueil, protégé par une multiplication.

## Développement

```bash
npm run typecheck   # TypeScript strict
npm run validate    # vérifie toutes les banques et tous les générateurs
npm test            # tests Jest
npm run check       # les trois à la suite
```

### Structure

```
skills.config.ts        référentiel officiel (items, durées, seuils) – à mettre à jour chaque année
src/app/                écrans (Expo Router)
src/skills/<id>/        une compétence : logic.ts (générateur ou banque, correction, explications,
                        erreurs types) et View.tsx (affichage)
src/engine/             moteur : séance, difficulté adaptative, répétition espacée, scores
src/components/         QCM, pavé numérique, ligne graduée, minuteur, retour, déroulé de séance
src/content/fr/         banques d'items en JSON (validées par un schéma zod)
src/storage/            SQLite local et migrations
src/services/speech.ts  synthèse vocale fr-FR
scripts/validate-content.ts
```

Le code et les commentaires sont en anglais ; l'interface et le contenu sont en français.
Tous les textes, phrases et mots sont originaux (aucun item officiel recopié).
