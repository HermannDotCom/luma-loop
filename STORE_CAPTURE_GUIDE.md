# Guide de captures store — Luma Loop

Les captures doivent représenter l’interface réellement rendue par l’application, sans maquette ajoutée ni écran de débogage. Activez le son, les vibrations et le contraste normal. Réinitialisez ensuite les données locales si vous avez besoin de retrouver la première partie guidée pour la première capture.

| Fichier cible | Situation de capture | Texte promotionnel facultatif |
|---|---|---|
| `01-loop.png` | Luciole dans la porte dorée, score et série visibles. | Touchez quand la lumière rencontre la porte. |
| `02-rhythm.png` | Niveau Éclipse ou Flux, avec changement de direction. | Changez de rythme. Trouvez votre élan. |
| `03-daily.png` | Défi quotidien et calendrier de sept jours ouverts. | Un objectif bref. Une lumière chaque jour. |
| `04-themes.png` | Collection avec un thème déverrouillé et équipé. | Illuminez votre orbite à votre façon. |
| `05-precision.png` | Écran Précision après plusieurs parties. | Voyez chaque geste devenir plus précis. |
| `06-training.png` | Mode entraînement actif avec l’indicateur sans vies. | Jouez librement. Sans pression. |

Enregistrez les fichiers sous `store-assets/screenshots/`. Vérifiez qu’aucune notification, barre système personnelle, donnée de test sensible ou élément d’Expo Go ne soit visible. Apple accepte de une à dix captures JPEG ou PNG et met en évidence les premières captures dans les résultats de recherche; Google Play utilise les captures avec l’icône, la description courte et le visuel promotionnel pour présenter l’application.[1] [2]

## Lot préparé le 27 août 2026

Les six fichiers livrés dans `store-assets/screenshots/` sont des **pré-captures de fiche store** de l’interface réelle de Luma Loop. Ils ont été rendus depuis le composant de jeu livré, dans des états déterministes de présentation strictement limités au développement. Ces états ne sont ni proposés dans l’interface joueur ni actifs dans une build de production; ils ne modifient aucune donnée locale.

| Fichier | État rendu | Définition PNG |
|---|---|---:|
| `01-loop.png` | Partie active, niveau Élan, touche Parfait et série de 4. | 1170 × 2532 |
| `02-rhythm.png` | Partie active, niveau Flux et sens de rotation inversé. | 1170 × 2532 |
| `03-daily.png` | Défi du jour à une touche de sa conclusion et série de 5 jours. | 1170 × 2532 |
| `04-themes.png` | Collection complète avec le thème Supernova équipé. | 1170 × 2532 |
| `05-precision.png` | Écran de précision avec activité et réussite non nulles. | 1170 × 2532 |
| `06-training.png` | Entraînement actif, indicateur « Sans vies » visible. | 1170 × 2532 |

> Ces pré-captures facilitent la préparation éditoriale et le contrôle du cadrage. Avant une soumission effective, le propriétaire doit les reprendre sur une build native de distribution, sans Expo Go ni élément système personnel, ou vérifier que les fichiers sont acceptés par chaque console conformément aux règles alors en vigueur.

## Références

[1] [Apple — Upload app previews and screenshots](https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots/)

[2] [Google Play Console — Add preview assets](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)
