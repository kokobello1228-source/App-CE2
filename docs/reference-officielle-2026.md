# Référence officielle – Repères CE2 2026

Synthèse (reformulée) des documents Éduscol consultés le 3 octobre 2026 :
cahier de l'élève (26ce2e), guide du professeur (26ce2p), guide des scores (mis à jour le 23/09/2026).
Les fiches ressources (zip) n'ont pas pu être téléchargées (protection anti-robot du site).

Les seuils de `skills.config.ts` correspondent exactement au guide des scores.
Les durées suivent le guide du professeur (consignes de passation).

## Règle de contenu

Aucun item officiel n'est réutilisé. La liste des items officiels connus est dans
`src/content/officialItems.ts` et le script `npm run validate` refuse tout item identique.

## Formats officiels observés (utiles pour coller au format)

| Comp. | Format exact | Timing de passation |
|---|---|---|
| F2 | Mot dicté, répété 2 fois ; mots « fréquents, réguliers ou invariables » ; marques du pluriel acceptées | 20 s entre chaque mot (3 min 20) |
| F8 | « Phrase. » puis « Dans cette phrase, le temps du verbe souligné est : » ; choix lus : l'imparfait / le présent / le futur / le passé composé ; verbes du 1er groupe, être, avoir, sans indicateur de temps | 15 s par phrase après lecture des choix |
| F9 | « La phrase avec le verbe « avoir » au présent est : » + 4 phrases identiques sauf le temps (être, avoir, 1er groupe ; présent, imparfait, futur, passé composé en distracteur) | 15 s |
| M3 | Deux exercices de 6 lignes (3 min chacun). Seules les deux bornes sont écrites, dans des cadres ; 2 à 10 intervalles ; une flèche descend d'une étiquette vide vers une graduation | 3 min + 3 min |
| M10 | 20 calculs en colonnes : a + b = …, a + … = c, … + b = c ; sommes jusqu'à 20, zéros possibles | 1 min |
| M1 | Nombre dit 2 fois puis 5 s | 5 s |
| M2 | Énoncé écrit et lu, cadre de recherche, 6 nombres à entourer (distracteurs : nombres de l'énoncé, mauvaise opération, erreur de calcul) | 1 min 30 par problème, 2 × 4 problèmes |
| M6 | « 3 dizaines + 4 unités + 6 centaines = » ; 4 nombres à cocher (distracteurs : chiffres dans l'ordre lu, somme des chiffres…) | 20 s |
| M7 / M8 | Fraction lue ; 4 écritures chiffrées / 4 figures grises | 20 s / 30 s |

## Caractérisation des groupes et difficultés (pour les niveaux et l'espace parent)

### F2 – Mots dictés (seuils 0-3 / 4-6 / 7-10)
- À besoins : encode les mots simples et quelques graphies complexes ; échoue sur les lettres à valeur contextuelle (c, g, s selon la voyelle).
- Fragile : encode des mots plus complexes, échoue sur les doubles digrammes, valeurs contextuelles et mots invariables.
- Au-delà : écrit la plupart des mots ; reste parfois en difficulté sur les lettres muettes finales qui demandent la dérivation (chaud → chaude).
- Difficultés : graphèmes de plusieurs lettres (an, en, ien, ou, on, au, eau) ; sons proches (f/v, ch/j, t/d, b/d, s/z) ; valeurs d'une même lettre ; lettres muettes finales ; mots invariables.

### F8 + F9 – Temps de conjugaison (seuils 0-5 / 6-9 / 10-16)
- À besoins : reconnaît le présent (1er groupe, être, avoir) avec un sujet singulier ; échoue sur le futur.
- Fragile : reconnaît le présent ; commence à reconnaître le futur sans toutes ses terminaisons.
- Au-delà : reconnaît présent et futur ; commence à reconnaître l'imparfait.
- → Ordre de difficulté retenu : présent < futur < imparfait ; sujets singuliers < pluriels/nous/vous.

### M3 – Ligne graduée (seuils 0-4 / 5-6 / 7-12)
- À besoins : ligne de 1 en 1, bornes proches, nombres < 100.
- Fragile : lignes de 1 en 1 ou de 10 en 10 ; le passage à la dizaine supérieure reste fragile.
- Au-delà : tout intervalle (2, 5, 10, 100), bornes dans des dizaines ou centaines différentes.
- Difficultés : régularité des espacements, valeur de l'intervalle, 0 n'est pas toujours la borne, compter de 2 en 2, 5 en 5…

### M10 – Faits numériques (seuils 0-9 / 10-13 / 14-20)
- À besoins : peu de faits mémorisés, compte sur les doigts.
- Fragile : tables, doubles < 10 et compléments à 10 en partie mémorisés, procédures personnelles.
- Au-delà : restitution rapide.
- Difficultés : commutativité (1 + 8 = 8 + 1), calculs à trou (… + 8 = 10), rester bloqué sur un calcul.

### Autres compétences (pour les étapes suivantes)
- **F1** (0-2 / 3-4 / 5-8) : texte littéraire d'environ 250 mots (type fable) ; difficultés : vocabulaire, reprises anaphoriques, inférences, discours direct.
- **F3 + F4** (0-6 / 7-8 / 9-12) : négation, termes spatiaux, forme passive (rarement comprise par les fragiles), pronoms substituts.
- **F5** (0-3 / 4-5 / 6-10) : à besoins = choisit un nom commun par le sens seul ; fragile = noms et verbes ; au-delà = aussi les adjectifs, en tenant compte des accords.
- **F6 + F7** (0-2 / 3-4 / 5-8) : à besoins = verbe du 1er groupe seulement ; fragile = sujet en 1re position (hors pronom) et début du verbe avoir ; au-delà = être/avoir, sujet pronom ou après un complément.
- **F10** (0-3 / 4-6 / 7-8) : confusion synonyme/antonyme, croit qu'un synonyme doit se ressembler à l'oral.
- **F11** (0-2 / 3-4 / 5-8) : s'appuie sur la forme (piège fort / forêt) ; au-delà = raisonnement morphologique et sémantique.
- **F12** (0-2 / 3-4 / 5-8) : à besoins = accord audible, adjectif après le nom ; au-delà = quelle que soit la place de l'adjectif.
- **F13** (0-2 / 3-4 / 5-8) : à besoins = nom propre seulement ; fragile = + déterminant ; au-delà = nom commun, l'adjectif restant difficile (mots ambigus : nouveau, bleu).
- **F14** (0-49 / 50-69 / 70+ mots) : texte officiel de 137 mots ; si fini avant 60 s, score extrapolé.
- **M1** (0-5 / 6-8 / 9-10) : nombres 70-99, zéros intercalés (904), chiffres en miroir comptés justes.
- **M2** (0-2 / 3-5 / 6-8) : à besoins = transformation à 1 étape ; fragile = additifs 1 étape, début 2 étapes et multiplicatif ; au-delà = début partage et additif 2 étapes.
- **M4 + M5** (0-2 / 3-6 / 7-8) : à besoins = additions sans retenue ; fragile = avec retenue et soustractions sans retenue ; au-delà = quel que soit le nombre de termes et de chiffres.
- **M6** (0-2 / 3-4 / 5-8) : à besoins = ordre positionnel respecté ; fragile = ordre mélangé ; au-delà = unité absente et plus de 9 dans une unité (50 dizaines).
- **M7 + M8** (0-4 / 5-7 / 8-10) : à besoins = écriture proche de l'oral ; fragile = fractions unitaires en partage ; au-delà = la plupart des fractions. Confusion numérateur / dénominateur.
- **M9** (0-3 / 4-6 / 7-8) : 76 au lieu de 67, 13 pour 6 dizaines et 7 unités, unité absente (108), éléments dispersés.
- **M11** (0-7 / 8-12 / 13-20) : + 9, + 19, ajout de dizaines entières, compléments à la dizaine.
