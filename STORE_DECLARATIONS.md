# Brouillon de déclarations stores — Luma Loop 1.0.0

> **Avertissement de conformité :** je ne suis pas avocat. Ce document est un brouillon opérationnel fondé sur le binaire actuel de Luma Loop et doit être relu par Flash Digital SAS ou un conseil qualifié avant toute validation dans App Store Connect ou Google Play Console.

## Périmètre vérifié

La version évaluée est un jeu solo sans compte, achat intégré, publicité active, analytique tiers, messagerie, contenu créé par les utilisateurs ou classement en ligne. Les scores, thèmes, succès, préférences de confort et préférence publicitaire future restent dans le stockage local de l’appareil. La boucle musicale est désormais incluse dans le binaire; elle ne charge aucun média à distance. La seule permission Android résolue est `MODIFY_AUDIO_SETTINGS`, liée à la lecture sonore; l’enregistrement audio et toute permission microphone sont bloqués dans la configuration Expo.

| Fonctionnalité présente | Donnée envoyée hors appareil | Conséquence de déclaration |
|---|---|---|
| Score, thèmes, statistiques, succès et série quotidienne locaux | Non | Traitement local; pas de collecte déclarable. |
| Préférences son, vibrations, contraste, réduction d’animations et publicité future | Non | Traitement local; pas de collecte déclarable. |
| Lecture de musique embarquée | Non | Pas de permission microphone et pas de donnée audio utilisateur. |
| Défi quotidien déterministe local | Non | Aucun compte, identifiant, classement ou donnée de jeu transmise. |
| Publicité future inactive | Non | Ne pas déclarer de publicité ou de suivi dans la version 1.0.0. Réviser entièrement ce document avant tout SDK publicitaire. |

## Apple — App Privacy

Dans **App Privacy**, choisir : **« No, we do not collect data from this app »**. Apple définit la collecte comme une transmission hors appareil accessible au développeur ou à ses partenaires au-delà du temps nécessaire pour servir la requête; les données restées sur l’appareil ne sont pas collectées.[1] La politique de confidentialité reste néanmoins obligatoire et doit être saisie via une **URL HTTPS publique**; la modale interne est un complément, pas un substitut.[2]

| Question Apple | Réponse proposée pour 1.0.0 | Justification |
|---|---|---|
| Données collectées par l’app ou des partenaires tiers ? | Non | Aucun SDK publicitaire/analytique, aucune API applicative et aucune synchronisation. |
| Données liées à l’utilisateur ou à l’appareil ? | Sans objet | Aucune donnée ne quitte l’appareil. |
| Données utilisées pour le suivi ? | Non | Aucun IDFA, identifiant d’appareil ou rapprochement inter-apps. |
| URL de politique de confidentialité | **À fournir avant soumission** | Héberger le contenu de `PRIVACY.md` sous un domaine HTTPS stable de Flash Digital SAS. |
| URL de choix de confidentialité | Facultative | La remise à zéro locale est déjà intégrée dans Réglages. |

## Apple — Classification d’âge

L’application est adaptée à un large public à partir de 6 ans mais ne doit pas être déclarée dans la catégorie **Made for Kids** : ce choix crée des exigences durables propres à cette catégorie. Laisser **Not Applicable** à la rubrique « Age Categories and Override » et laisser le questionnaire calculer le classement. Une app non classée ne peut pas être publiée.[3]

| Groupe du questionnaire Apple | Réponse proposée | Motif |
|---|---|---|
| Contrôles parentaux / assurance d’âge | Non | Aucun contrôle parental ni vérification d’âge. |
| Navigation web non restreinte | Non | Aucun navigateur intégré ni lien externe dans le jeu. |
| UGC, réseau social, messagerie ou chat | Non | Jeu strictement solo, sans compte. |
| Publicité | Non | Aucun SDK et aucune diffusion dans 1.0.0. |
| Langage grossier, peur, alcool, tabac, drogues | Aucun | Aucun de ces contenus. |
| Sexualité ou nudité | Aucune | Aucun de ces contenus. |
| Violence fictive, réaliste, graphique ou armes | Aucune | Aucun de ces contenus; les erreurs de rythme n’impliquent aucun dommage ou personnage. |
| Jeux d’argent, jeu simulé ou loot boxes | Non | Aucun pari, achat, hasard monétisé ou coffre. |
| Concours | **Peu fréquent** | Le défi quotidien est un objectif individuel avec récompense cosmétique locale, sans classement, argent ni achat. Confirmer cette qualification avec le libellé présent dans la console. |

Le résultat attendu est **4+** si les réponses ci-dessus sont retenues, car Apple inclut les concours peu fréquents dans ce niveau; le résultat final reste celui calculé par la console.[4]

## Google Play — Data safety

Dans **Policy > App content > Data safety**, déclarer : **« No, this app does not collect or share any of the required user data types »**. Google exige le formulaire et une URL de politique de confidentialité même lorsqu’une app ne collecte aucune donnée; les bibliothèques et SDK tiers doivent être inclus dans l’audit.[5]

| Étape Google Play | Réponse proposée pour 1.0.0 | Contrôle avant soumission |
|---|---|---|
| Collecte ou partage de données utilisateur requises | Non | Confirmer qu’aucun SDK d’analytics, d’attribution, de publicité ou de crash reporting n’a été ajouté. |
| Chiffrement en transit | Sans objet | Aucune donnée utilisateur collectée ou transmise. |
| Suppression des données | Sans objet dans le formulaire | La fonction interne « Réinitialiser les données » efface toutefois les données locales. |
| URL de politique de confidentialité | **À fournir avant soumission** | URL HTTPS publique de Flash Digital SAS. |
| Publicités dans l’app | Non | Répondre non tant qu’aucune régie n’est ajoutée. |

## Google Play — Public cible et classification IARC

La cible annoncée est **6–80 ans**. Dans « Target audience and content », sélectionner les tranches correspondant aux 6–8 ans, 9–12 ans, 13–15 ans, 16–17 ans et adultes; ne pas sélectionner « 5 ans et moins » sans nouvelle décision produit. Puisque des enfants figurent dans la cible, le produit relève des obligations Google Play Families applicables; l’absence actuelle de publicité et de collecte de données est cohérente avec ce positionnement.[6]

| Rubrique IARC / contenu Google Play | Réponse proposée | Motif |
|---|---|---|
| Catégorie | Game | Jeu d’arcade tactile solo. |
| Violence, effroi, langage, sexualité, substances | Non | Aucun contenu concerné. |
| Jeu d’argent, simulation de jeu d’argent, loterie, récompense aléatoire payante | Non | Défis et thèmes sont déterministes; aucun achat ni hasard. |
| Interaction entre utilisateurs, partage de données personnelles, UGC | Non | Aucun compte ni fonction sociale. |
| Publicité | Non | Aucun contenu publicitaire dans la version 1.0.0. |
| Contenu accessible après paiement | Non | Aucun achat intégré ni abonnement. |

Google Play génère des classements régionaux via IARC et peut refuser une déclaration trompeuse. La note finale affichée doit donc être contrôlée dans la page de synthèse avant envoi.[6] [7]

## Changements futurs à ne pas oublier

L’ajout d’une régie publicitaire, d’analytics, d’un compte, d’un classement, de données cloud ou d’achats intégrés impose une nouvelle analyse du binaire et la mise à jour de ces réponses, de `PRIVACY.md`, de la classification et des permissions. Toute publicité destinée à une app dont la cible inclut les enfants doit en outre respecter les règles Families et correspondre au classement de contenu.[6] [7]

## Références

[1] [Apple — App privacy details, définition de la collecte](https://developer.apple.com/app-store/app-privacy-details/)

[2] [Apple — Manage app privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/)

[3] [Apple — Set an app age rating](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/)

[4] [Apple — Age ratings values and definitions](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions/)

[5] [Google Play — Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)

[6] [Google Play — Content rating requirements](https://support.google.com/googleplay/android-developer/answer/9859655?hl=en)

[7] [Google Play — Content ratings policy](https://support.google.com/googleplay/android-developer/answer/9898843?hl=en)
