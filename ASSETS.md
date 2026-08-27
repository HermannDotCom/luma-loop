# Inventaire d’assets — Luma Loop

| Asset | Rôle | Source et statut |
|---|---|---|
| Icône Luma Loop | Icône lanceur, splash et favicon. | Illustration originale générée pour le projet; URL de cycle de vie : `/manus-storage/luma-loop-icon_22aece36.png`. |
| Ambiance Luma Loop | Boucle instrumentale optionnelle pendant une partie. | Composition originale servie depuis le stockage durable : `https://files.manuscdn.com/user_upload_by_module/session_file/310519663253463242/vrBHtdJuieNHcUuN.mp3`, pilotée par `expo-audio`. |
| Référence verticale | Direction artistique de la serre cosmique. | Illustration originale générée; URL de cycle de vie : `/manus-storage/luma-loop-visual-target_e8810761.png`. |
| Anneau, noyau, luciole, porte | Gameplay et feedback immédiat. | Géométrie vectorielle procédurale dans `components/luma-loop-game.tsx`, sans fichiers lourds. |
| Particules de succès/erreur | Rendre chaque toucher lisible. | Ondes vectorielles en rendu natif, sans bitmap. |

Les assets de partie sont vectoriels afin de conserver une faible empreinte mémoire, un chargement quasi instantané et une bonne netteté sur les différents écrans mobiles. Aucun asset sous licence tierce n’est intégré dans le MVP.
