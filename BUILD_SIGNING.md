# Préparation de build signée — Luma Loop

**Statut :** configuration de préparation, le 27 août 2026. Aucune archive de production n’a encore été créée ni envoyée à un store. Les clés et certificats doivent rester privés et ne doivent jamais être ajoutés au dépôt GitHub.

## Configuration prête dans le projet

| Élément | Valeur préparée | Rôle |
|---|---|---|
| Compte Expo | `hermanndotcom` | Propriétaire du projet de build EAS à associer. |
| Identifiant iOS | `com.flashdigital.lumaloop` | Bundle identifier à enregistrer dans le compte Apple Developer de Flash Digital SAS. |
| Identifiant Android | `com.flashdigital.lumaloop` | Application ID à réserver pour le premier package Google Play. |
| Version produit | `1.0.0` | Version utilisateur de la première soumission. |
| Build iOS initial | `1` | Valeur de départ avant incrément automatique EAS. |
| Build Android initial | `1` | Valeur de départ avant incrément automatique EAS. |
| Profil `preview` | Distribution interne; APK Android | Installation privée de contrôle, sans diffusion publique. |
| Profil `production` | Archive store signée; incrément automatique | Produit un `.aab` Android et un `.ipa` iOS destinés aux stores. |
| Soumission Android | Piste interne, état brouillon | Empêche tout déploiement public implicite. |

## Signature et comptes à associer

Pour Android, activez **Google Play App Signing** lors de la première importation. La clé d’envoi peut être générée et gérée par EAS; elle ne doit jamais être commitée. Pour iOS, EAS doit accéder à un compte Apple Developer au nom du propriétaire afin de créer ou réutiliser le certificat de distribution et le profil de provisioning de `com.flashdigital.lumaloop`.[1] [2]

> Le compte Expo `HermannDotCom` est connecté dans le navigateur, mais l’outil de build local n’est pas encore authentifié. Une authentification EAS et les appartenances Apple Developer / Google Play Console sont nécessaires avant de générer les archives signées.

## Passage vers une archive de distribution

Une fois l’accès de build et les comptes développeur vérifiés, le projet sera associé à EAS, qui inscrira son `projectId` dans la configuration Expo. Le profil `production` doit produire un **Android App Bundle (`.aab`)** et une **archive iOS (`.ipa`)** signés. La création d’une archive n’envoie pas l’application en production : l’import Android est préparé en brouillon sur la piste interne, tandis qu’une archive iOS arrive d’abord dans App Store Connect/TestFlight.[1] [3]

La publication finale demeure une action du propriétaire dans les consoles. Dans l’interface du projet, créez d’abord un checkpoint puis utilisez le bouton **Publish** pour déclencher le processus de build; n’essayez pas de fabriquer manuellement un APK dans l’environnement de travail.

## Vérifications bloquantes avant de lancer la production

| Vérification | Responsable | État |
|---|---|---|
| Confirmer que `com.flashdigital.lumaloop` est disponible ou enregistré pour Flash Digital SAS. | Propriétaire dans Apple Developer et Google Play Console | À faire |
| Associer le projet au compte EAS `hermanndotcom` et gérer les credentials privés. | Propriétaire / EAS | À faire |
| Ajouter une politique de confidentialité sur une URL HTTPS stable appartenant à Flash Digital SAS. | Propriétaire | À faire |
| Vérifier ou reprendre les captures depuis une build native de distribution. | Propriétaire | À faire |
| Compléter et relire les déclarations préparées dans `STORE_DECLARATIONS.md`. | Propriétaire | À faire |

## Références

[1] [Expo — EAS Build](https://docs.expo.dev/build/introduction/)

[2] [Expo — App credentials](https://docs.expo.dev/app-signing/app-credentials/)

[3] [Expo — Submit to app stores](https://docs.expo.dev/deploy/submit-to-app-stores/)
