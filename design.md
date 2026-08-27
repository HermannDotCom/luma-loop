# Design produit — Luma Loop

**Luma Loop** est un jeu d’arcade tactile en portrait 9:16. Le joueur suit une luciole lumineuse qui tourne autour d’un noyau et touche l’écran lorsqu’elle traverse une porte lumineuse. Un toucher bien synchronisé déclenche une explosion douce de particules, augmente une série et déplace immédiatement la porte. L’expérience repose sur une seule action, comprise par la démonstration visuelle : **toucher lorsque les lumières se rencontrent**.

## Principes d’interface

L’interface privilégie une utilisation à une main, avec toute action récurrente dans la moitié inférieure de l’écran. Les cibles sont larges au début, les éléments textuels ne sont jamais indispensables au jeu et l’état est communiqué par couleurs, mouvement, forme et son. Les touches critiques disposent d’une zone tactile d’au moins 48 points et d’un retour visuel immédiat. Le jeu est verrouillé en portrait, sans navigation à onglets pendant une partie.

## Écrans

| Écran | Contenu principal | Fonctionnalité |
|---|---|---|
| Accueil | Logo Luma Loop, meilleur score, bouton circulaire « Jouer », bouton discret de réglages. | Lancer une partie et accéder aux réglages. |
| Partie | Anneau central, luciole orbitale, porte-cible, score, série et trois pétales de sérénité. | Toucher n’importe où au bon instant pour marquer; pause en haut à droite. |
| Pause | Score courant et boutons Reprendre, Recommencer, Accueil. | Interrompre sans perdre la partie active. |
| Fin de partie | Score, record éventuel, progression de collection, grande action « Encore ». | Rejouer en un geste ou revenir à l’accueil. |
| Réglages | Bascules son, haptiques et contraste renforcé. | Adapter l’expérience sans affecter la progression. |
| Collection future | Emplacement architectural non exposé dans le MVP. | Préparer des cosmétiques sans créer de boutique ni de paiement. |

Les défis et la collection font désormais partie du MVP : un défi journalier est calculé localement à partir de la date de l’appareil. Il demande soit des passages réussis, soit des touches Parfait, et offre le thème **Aube** lorsqu’il est terminé. Les autres thèmes deviennent disponibles à partir de records de 15, 35, 60 et 100 points. Cette progression n’impose aucun compte, paiement, connexion ni temps d’attente.

Le défi affiche un calendrier léger de sept jours. Une réussite quotidienne prolonge la série, tandis qu’un jour manqué la remet à un jour sans effacer le meilleur historique. Le mode **Entraînement** laisse le joueur répéter sans perdre de vies ni atteindre un écran de fin. Chaque thème d’orbite se distingue désormais par sa couleur, l’épaisseur ou le motif de l’anneau, le halo de la luciole et de petites étincelles vectorielles, sans modifier les règles ni créer de surcharge visuelle.

## Boucle de jeu et difficulté

La luciole se déplace constamment autour de l’anneau. Lorsque le joueur touche pendant qu’elle est dans la porte, il gagne des points, conserve sa série et la porte se relocalise. Une réussite au centre exact de la porte déclenche un **Parfait** et un bonus visible. En cas de toucher trop tôt ou trop tard, un pétale s’éteint et la série retombe à zéro; la luciole continue immédiatement, ce qui évite une sanction brutale. La partie s’achève après trois erreurs.

La difficulté progresse désormais sur cinq niveaux lisibles à l’écran : **Éveil** (4 passages), **Élan** (9), **Éclipse** (15), **Flux** (22) et **Luma**. Chaque niveau augmente nettement la vitesse, resserre l’arc de réussite et augmente la valeur des points; à partir d’Éclipse, le sens de rotation change périodiquement. Une carte de passage annonce chaque niveau pour transformer la progression en objectif concret plutôt qu’en augmentation imperceptible.

## Parcours clés

| Intention | Parcours |
|---|---|
| Commencer en moins de deux secondes | Accueil → toucher « Jouer » → animation d’apparition de l’anneau → la première luciole traverse une porte très large. |
| Réussir une synchronisation | Observer la luciole → toucher au passage dans la porte → flash, vibration légère, son clair → nouveau point et nouvelle cible. |
| Revenir après une erreur | Toucher hors de la porte → pétale qui s’éteint → ralenti bref et signal discret → la boucle reprend automatiquement. |
| Rejouer | Fin de partie → toucher le large bouton « Encore » au bas de l’écran → nouvelle partie sans écran de chargement. |
| Adapter le confort | Accueil → réglages → activer/désactiver sons, haptiques ou contraste → retour immédiat à l’accueil. |

## Direction artistique

L’univers graphique est une « serre cosmique » : un fond nuit-encre révèle un noyau doux et des traces de lumière satinées. Les formes restent simples, lisibles et sans dépendance au langage. Les effets renforcent la réussite plutôt que de détourner de la mécanique : halo à l’approche, onde circulaire à la validation, particules en arc et inflexion brève de l’anneau sur erreur.

| Élément | Couleur | Usage |
|---|---|---|
| Nuit Encre | `#090B1A` | Fond principal profond et reposant. |
| Iris Électrique | `#8B5CF6` | Anneaux, interface active et profondeur. |
| Menthe Lumen | `#43F3C5` | Luciole, validations et actions primaires. |
| Ambre Solaire | `#FFD166` | Série, record et récompenses. |
| Corail Doux | `#FF6B8A` | Erreur, pétales éteints et avertissements non anxiogènes. |
| Blanc Brume | `#F4F7FF` | Texte et repères à contraste élevé. |

## Architecture d’expérience

La partie est pilotée par un état déterministe distinct de l’interface : configuration de niveau, position orbitale, fenêtre de réussite, score, erreurs et progression persistée localement. Les futurs abonnements et cosmétiques se grefferont à des catalogues de contenu et à un profil d’inventaire abstrait, sans modifier le moteur de partie. Le MVP n’expose ni paiement, ni monnaie, ni magasin.
