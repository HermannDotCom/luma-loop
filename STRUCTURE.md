# Structure technique — Luma Loop

Le projet utilise Expo, React Native, TypeScript et `react-native-svg`. Cette pile conserve le rendu natif cross-platform et évite l’ajout d’un moteur 3D ou d’une pile serveur inutile pour une expérience à une action. Toutes les données de jeu restent sur l’appareil avec AsyncStorage, sans compte utilisateur ni synchronisation réseau.

| Dossier | Responsabilité |
|---|---|
| `app/(tabs)` | Point d’entrée Expo Router, sans barre d’onglets pendant le jeu. |
| `components/luma-loop-game.tsx` | Orchestration des écrans et rendu de l’aire de jeu. |
| `lib/game/engine.ts` | Règles pures : angles, difficulté, score, vies, validation de toucher. |
| `lib/game/profile.ts` | Chargement et sauvegarde locale du record et des préférences. |
| `lib/game/catalog.ts` | Contrats neutres pour cosmétiques, inventaire et avantages futurs. |
| `lib/game/haptics.ts` | Retour tactile sécurisé par plateforme. |
| `tests/game-engine.test.ts` | Scénarios déterministes de règles et de catalogue. |

Le futur système d’abonnement devra uniquement alimenter `memberBenefitsActive` depuis un fournisseur de paiement et ajouter des définitions au catalogue. Un futur système d’accessoires devra accorder des identifiants dans `unlockedIds` puis modifier `equipped`; il ne devra ni injecter de devise dans le moteur ni modifier les règles de synchronisation.
