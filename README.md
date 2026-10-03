# Repères CE2

Application d'entraînement aux évaluations nationales « Repères CE2 » pour un enfant de CE2.
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

## Utiliser l'application sur iPhone (application web, gratuite)

L'application est publiée automatiquement sur GitHub Pages à chaque nouvelle version :
**https://kokobello1228-source.github.io/App-CE2/**

1. Ouvrir ce lien dans **Safari** sur l'iPhone.
2. Toucher le bouton **Partager** (carré avec une flèche vers le haut), puis **« Sur l'écran d'accueil »**.
3. Lancer l'application depuis son icône « Repères CE2 ». Elle fonctionne ensuite sans connexion.

Les progrès sont enregistrés dans l'iPhone (aucune donnée envoyée). Les mises à jour arrivent
toutes seules : la nouvelle version est installée en arrière-plan et s'affiche au lancement suivant.

### Mise en place (une seule fois, depuis l'iPhone)

GitHub Pages gratuit nécessite un dépôt public. Sur github.com (dans Safari) :
1. Dépôt → **Settings → General → Danger Zone → Change visibility → Public**.
2. **Settings → Pages → Build and deployment → Source : « GitHub Actions »**.
3. Si la publication est refusée pour cette branche : **Settings → Environments → github-pages →
   Deployment branches** → ajouter `claude/new-session-dbdg8i`.
4. **Actions → « Publier l'application web » → Run workflow** pour la première publication.

### Option future : vraie application iPhone

Le même code peut être compilé en application native (EAS Build) avec un compte développeur
Apple (99 €/an) : meilleure voix, stockage SQLite, installation par lien. Rien n'est à refaire.

### Pour les développeurs : tester avec Expo Go

```bash
npm install
npx expo start          # QR code à scanner avec l'iPhone (Expo Go)
npm run build:web       # construit l'application web dans dist/
```

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
