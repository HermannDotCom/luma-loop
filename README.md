# Luma Loop

Luma Loop est un MVP de jeu mobile d’arcade tactile conçu pour les sessions courtes, la compréhension immédiate et un retour sensoriel doux. Le joueur touche l’écran lorsque la luciole lumineuse traverse l’arc ambre. La difficulté augmente lentement, une série récompense la précision et trois erreurs concluent une partie sans interrompre brutalement l’apprentissage.

## Démarrer le projet

Installez Node.js 22 et pnpm, puis exécutez les commandes suivantes depuis la racine du dépôt.

```bash
pnpm install
pnpm dev
```

Le serveur Expo affiche un QR code : ouvrez-le avec Expo Go sur iOS ou Android pour tester le jeu sur un appareil réel. Pour les contrôles de qualité, exécutez :

```bash
pnpm test
pnpm check
pnpm lint
```

## Architecture et sauvegarde

Le moteur de jeu vit dans `lib/game/engine.ts` et ne dépend pas de React Native. Le record et les réglages de confort sont stockés localement via AsyncStorage. L’interface est rendue avec React Native, `react-native-svg` et des styles statiques; elle reste verrouillée au format portrait.

La politique de confidentialité du MVP est disponible dans [`PRIVACY.md`](./PRIVACY.md). Avant une soumission de store, hébergez ce texte sur une URL HTTPS stable et renseignez cette URL dans les fiches App Store Connect et Play Console.

La base d’évolution se trouve dans `lib/game/catalog.ts`. Elle définit un inventaire et les cosmétiques équipés, mais n’expose ni boutique, ni paiement, ni monnaie dans ce MVP. Une intégration ultérieure pourra synchroniser les achats validés avec l’inventaire, ajouter des éléments `member` au catalogue et définir les avantages de l’abonnement sans toucher aux règles de jeu.

## Build Android et iOS

Pour un développement local Android, utilisez un environnement Android Studio configuré avec un émulateur ou un appareil USB, puis lancez `npx expo run:android`. Pour un build natif iOS local, utilisez macOS avec Xcode, puis lancez `npx expo run:ios`. Les commandes génèrent les projets natifs si nécessaire; les identifiants d’application sont déjà décrits dans `app.config.ts`.

Pour préparer une distribution Android, générez une AAB de production avec votre flux Expo/EAS ou votre CI après configuration des signatures. Pour une diffusion sur l’App Store, archivez le projet iOS dans Xcode, envoyez l’archive vers App Store Connect, puis distribuez la build via TestFlight avant la soumission. Dans l’environnement de projet Manus, créez d’abord un point de restauration puis utilisez le bouton **Publish** de l’interface : ce flux est celui qui déclenche la génération de l’APK, plutôt qu’une construction manuelle gourmande dans l’environnement de travail.

## Expérience de jeu

| Moment | Réponse du jeu |
|---|---|
| Luciole dans la porte et toucher | Point, série, porte déplacée, onde menthe et haptique de succès sur mobile. |
| Toucher hors de la porte | Un pétale s’éteint, série remise à zéro, onde corail, la boucle se poursuit. |
| Trois erreurs | Écran de bilan et action « Encore » sans temps de chargement. |
| Pause | Reprise, redémarrage ou retour à l’accueil sans perdre d’ambiguïté. |

## Dépôt

Le code source et l’historique des commits sont publiés sur [HermannDotCom/luma-loop](https://github.com/HermannDotCom/luma-loop).
