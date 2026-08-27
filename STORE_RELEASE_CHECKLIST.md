# Checklist de publication — Luma Loop

Le MVP est préparé pour l’empaquetage, mais il ne peut pas être soumis aux stores sans les étapes opérées dans les comptes développeur du propriétaire. Les tests du moteur, le contrôle TypeScript et le lint ont été exécutés sans erreur bloquante dans l’environnement de développement. Les réponses proposées se trouvent dans [`STORE_DECLARATIONS.md`](STORE_DECLARATIONS.md) et restent à valider avant leur envoi.

| Élément | État actuel | Action du propriétaire avant soumission |
|---|---|---|
| Bundle ID et package Android | Préconfigurés : `com.flashdigital.lumaloop`; projet EAS `@hermanndotcom/luma-loop` associé. | Vérifier puis enregistrer la disponibilité de cet identifiant dans Apple Developer et Play Console avant la première soumission. |
| Profils de build | `eas.json` contient les profils `preview` (APK interne) et `production` (archive store, versions automatiques). | Gérer le keystore Android, le certificat iOS et le provisioning profile uniquement dans EAS / les comptes développeur. Ne jamais verser ces secrets au dépôt. |
| Icône et écran de lancement | Icône originale optimisée, appliquée aux cibles Expo. | Vérifier le rendu sur un appareil réel iOS et Android. |
| Politique de confidentialité | Texte disponible dans `PRIVACY.md`. | Publier une URL HTTPS stable, puis renseigner cette même URL dans les métadonnées de chaque store et dans l’application. |
| Déclarations de données | Aucun enregistrement micro, aucune publicité/analytique active, musique embarquée, données de jeu strictement locales. | Reporter les réponses de `STORE_DECLARATIONS.md` dans App Privacy et Data safety, puis ré-auditer tout SDK ajouté avant chaque mise à jour. |
| Public cible et âge | Cible produit déclarée : 6–80 ans; brouillon Apple et IARC préparé. | Répondre à chaque questionnaire avec le binaire 1.0.0, contrôler le classement calculé, et ne pas sélectionner la catégorie Made for Kids sans décision produit dédiée. |
| Captures et page produit | Six pré-captures PNG sont disponibles. | Valider ou reprendre les captures sur une build native de distribution; renseigner textes, URL de support, URL de confidentialité et catégorie Jeu. |
| Tests réels | Tests logiques automatisés réussis. | Tester sur un iPhone et un Android physiques : audio, vibrations, pause, reprise, réseau absent et longue session. |

Apple exige une URL de politique de confidentialité et des réponses exactes aux questions App Privacy pour la soumission.[1] Google impose un formulaire Data safety même si l’application ne collecte aucune donnée, ainsi qu’une politique de confidentialité et une classification de contenu.[2] [3]

## Publication

Créez d’abord une version validée du projet, puis utilisez le bouton **Publish** de l’interface de projet pour lancer le flux de génération de la build. Le profil `production` est prévu pour une archive `.aab` Android et `.ipa` iOS signées. La soumission effective à App Store Connect, TestFlight et Google Play Console reste une action de compte propriétaire et requiert les informations légales, les accès développeur, les fiches de store et les déclarations exactes.

## Références

[1]: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/ "Apple — Manage app privacy"
[2]: https://support.google.com/googleplay/android-developer/answer/10787469?hl=en "Google Play — Data safety"
[3]: https://support.google.com/googleplay/android-developer/answer/9859655?hl=en "Google Play — Content rating requirements"
