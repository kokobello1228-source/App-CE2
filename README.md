# Repères CE2

Application mobile d'entraînement aux évaluations nationales « Repères CE2 », pour Mia.
100 % hors ligne : pas de compte, pas de serveur, pas de publicité, aucune donnée collectée.

## État actuel : étape 2 (toutes les mathématiques)

| Compétence | Contenu |
|---|---|
| M1 – Écrire des nombres | Nombre dicté 2 fois (en toutes lettres pour la voix), 70-99 et zéros intercalés au niveau 3 |
| M2 – Problèmes | 12 types d'énoncés originaux (parties-tout, transformations, 2 étapes, multiplication, partage), 6 réponses, brouillon au doigt |
| M3 – Ligne graduée | Format officiel : bornes encadrées, 2 à 10 graduations, étiquette vide fléchée |
| M4 / M5 – Opérations posées | Additions (avec ou sans retenue, 2 ou 3 termes) et soustractions sans retenue, saisie de droite à gauche, cases de retenue |
| M6 – Unités de numération | Décompositions lues, ordre mélangé, unité absente, plus de 9 dans une unité |
| M7 / M8 – Fractions | Lire (piège numérateur / dénominateur) et représenter (disques et bandes, parts inégales) |
| M9 – Dénombrer | Plaques, barres et cubes, rangés ou dispersés, plus de 9 barres ou cubes |
| M10 / M11 – Calcul mental | Faits numériques (1 min) et procédures : + 9, + 19, dizaines, compléments (3 min) |
| F2 – Mots dictés | 150 mots fréquents en 3 niveaux |
| F8 – Temps du verbe | 60 phrases originales lues à voix haute avec les 4 propositions |

Pour chaque compétence : 3 niveaux calqués sur la « caractérisation des groupes » du guide des
scores, mauvaises réponses construites à partir des erreurs types, explication d'une phrase,
erreurs types et conseils pour le parent. Aucun item officiel n'est réutilisé (contrôle automatique).

Fonctionnalités : séance du jour, entraînement libre, « Comme à l'école » (durées officielles),
synthèse vocale, difficulté adaptative, répétition espacée des erreurs, étoiles et série de jours,
espace parent provisoire. Référence officielle résumée dans `docs/reference-officielle-2026.md`.

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
