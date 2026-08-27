# Test sur téléphone — Luma Loop v0.5

La validation native doit être réalisée dans **Expo Go** sur un iPhone ou un Android réel. Ouvrez le projet dans le panneau de prévisualisation, scannez le QR code affiché, puis effectuez les séquences ci-dessous avec le son et les vibrations activés.

| Séquence | Action | Résultat attendu |
|---|---|---|
| Partie classique | Lancez une partie, réussissez plusieurs passages puis manquez trois fois. | La vitesse et la porte évoluent par niveaux; la fin arrive seulement après la troisième erreur. |
| Entraînement | Touchez **Entraînement**, ratez volontairement au moins cinq passages. | Le compteur de vies ne diminue pas et aucune fin de partie n’apparaît. |
| Défi et série | Ouvrez le défi, complétez son objectif et revenez à l’accueil. | Le calendrier marque aujourd’hui, la série augmente une seule fois et le thème Aube est débloqué. |
| Thèmes | Équipez Iris, puis un thème débloqué. | La couleur, le motif de l’orbite, le halo et les étincelles changent sans interrompre la partie. |
| Statistiques et succès | Jouez, puis ouvrez **Précision** et **Succès**. | Les touches, réussites, Parfaits, meilleure série et barres de progression correspondent à la session. |
| Confort | Coupez le son, les vibrations et activez le contraste. | Chaque réglage a un effet immédiat et se conserve après le retour à l’accueil. |

Consignez tout comportement inattendu avec le modèle suivant : appareil, version du système, étape, résultat observé et capture d’écran. Les contrôles TypeScript, lint et les tests déterministes ne remplacent pas cette validation de l’audio, des vibrations et du geste tactile natifs.

## Validation réalisée

Les six séquences ont été validées par le propriétaire du projet dans Expo Go sur un téléphone Android le 27 août 2026. Un autre appareil Android a présenté un échec de téléchargement avant le chargement du bundle; la cause et le contournement sont consignés dans [`EXPO_PREVIEW_NOTES.md`](./EXPO_PREVIEW_NOTES.md).
