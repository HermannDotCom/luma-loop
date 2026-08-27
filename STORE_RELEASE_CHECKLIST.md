# Checklist de publication — Luma Loop

Le MVP est techniquement prêt à être empaqueté, mais il ne peut pas encore être soumis aux stores sans les étapes opérées dans les comptes développeur du propriétaire. Les tests du moteur, le contrôle TypeScript et le lint ont été exécutés sans erreur bloquante dans l’environnement de développement.

| Élément | État actuel | Action du propriétaire avant soumission |
|---|---|---|
| Bundle ID et package Android | Préconfigurés dans `app.config.ts`. | Vérifier qu’ils restent uniques dans App Store Connect et Play Console. |
| Icône et écran de lancement | Icône originale optimisée, appliquée aux cibles Expo. | Vérifier le rendu sur un appareil réel iOS et Android. |
| Politique de confidentialité | Texte disponible dans `PRIVACY.md`. | Publier une URL HTTPS stable, puis renseigner cette même URL dans les métadonnées de chaque store et dans l’application. |
| Déclarations de données | Aucune collecte applicative volontaire; son distant et dépendances doivent être déclarés de manière exacte. | Remplir les formulaires App Privacy et Data safety après audit des bibliothèques réellement incluses. |
| Public cible | Le jeu est accessible, mais l’ajout de publicités le place sous des règles enfants/mixed audience si les enfants sont ciblés. | Choisir une cible réelle, cohérente avec l’icône, la description et la configuration publicitaire. |
| Captures et page produit | Non créées. | Créer captures, texte de présentation, URL de support et catégorie Jeu. |
| Tests réels | Tests logiques automatisés réussis. | Tester sur un iPhone et un Android physiques : audio, vibrations, pause, reprise, réseau absent et longue session. |

Apple exige une URL de politique de confidentialité et des réponses exactes aux questions App Privacy pour la soumission.[1] Google impose de compléter les déclarations de contenu, de confidentialité, de publicités et de public cible dans la Play Console; les applications visant des enfants doivent aussi offrir une politique de confidentialité dans l’app.[2]

## Publication

Créez d’abord une version validée du projet, puis utilisez le bouton **Publish** de l’interface de projet pour lancer le flux de génération de l’APK. La soumission effective à App Store Connect, TestFlight et Google Play Console reste une action de compte propriétaire et requiert les informations légales, les accès développeur, les fiches de store et les déclarations exactes.

## Références

[1]: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/ "Apple — Manage app privacy"
[2]: https://support.google.com/googleplay/android-developer/answer/9859455?hl=en "Google Play — Prepare your app for review"
