# Repères CE2

Application d'entraînement aux évaluations nationales « Repères CE2 » pour un enfant de CE2.
100 % hors ligne : pas de compte, pas de serveur, pas de publicité, aucune donnée collectée.

## État actuel : les 25 compétences sont disponibles

| Domaine | Compétences |
|---|---|
| Français – lecture | F1 texte lu (12 récits originaux, 8 questions chacun), F5 phrases à trou (60), F14 lecture à voix haute à deux (15 textes, courbe de progrès) |
| Français – oral | F3 texte entendu (12 documentaires lus deux fois), F4 phrases entendues (images générées : négation, sur/sous/à côté, passif, « qui ») |
| Français – vocabulaire | F10 synonymes en contexte (61), F11 familles de mots avec intrus piège (61) |
| Français – grammaire | F2 dictée (150 mots), F6/F7 sujet et verbe (61 phrases), F8/F9 temps des verbes (60 phrases + générateur), F12 accords (générateur), F13 classes de mots (générateur) |
| Mathématiques | M1 à M11 (générateurs, voir le détail ci-dessous) |

Pour chaque compétence : 3 niveaux calqués sur la « caractérisation des groupes » du guide des
scores, mauvaises réponses construites à partir des erreurs types, explication d'une phrase,
erreurs types et conseils pour le parent. Aucun item officiel n'est réutilisé (contrôle automatique).

Interface : Plume la chouette accompagne l'enfant (consignes, encouragements), boutons « 3D », confettis et petits sons de réussite.
Voix : voix naturelle pré-enregistrée (Piper, voix « Siwis », CC-BY 4.0) pour les consignes, dictées, textes et corrections ;
voix de l'appareil pour les phrases calculées à la volée. Régénérer après une modification de contenu :
`npm run voice:collect > texts.json && python3 scripts/voice/synthesize.py texts.json <dossier piper>`.

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
