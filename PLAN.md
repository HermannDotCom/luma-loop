# Plan de production — Luma Loop

Le risque principal du MVP est le **ressenti de synchronisation** : le joueur doit discerner la fenêtre de réussite sans calculer ni lire. Cette contrainte est traitée par une porte très épaisse, une luciole avec halo, une vitesse lente au départ et une première minute de progression par paliers. Le moteur est purement déterministe : l’angle de la luciole, l’angle de la porte et la résolution d’un toucher sont séparés du rendu.

| Tranche de risque | Décision | Critère de vérification |
|---|---|---|
| Synchronisation | Fenêtre angulaire large, diminuant graduellement. | Les tests couvrent la réussite, l’échec et la limite circulaire. |
| Réactivité | Boucle `requestAnimationFrame` limitée à 42 ms par image. | Aucun calcul lourd dans le rendu ou dans le gestionnaire tactile. |
| Compréhension | Une porte ambre et une luciole menthe; toucher possible sur toute l’aire de jeu. | Aucune instruction n’est nécessaire pour réaliser le premier geste. |
| Frustration | Trois erreurs, reprise instantanée après les deux premières. | Une erreur ne suspend jamais la session. |
| Évolution produit | Catalogue et inventaire indépendants du moteur. | Les cosmétiques futurs ne modifient pas le calcul de score. |

La validation du MVP s’appuie sur des tests unitaires du moteur, la vérification TypeScript et le lint. Les interactions natives sont protégées afin que le retour haptique enrichisse la partie sur appareils mobiles sans devenir une dépendance du gameplay sur le web.
