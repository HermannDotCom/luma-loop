# Repères officiels de publication — Luma Loop

**Statut :** note de travail du 27 août 2026. Elle soutient les réponses préparées pour Flash Digital SAS, mais ne remplace ni les consoles Apple et Google Play, ni une revue juridique avant soumission.

| Sujet | Constat officiel à appliquer | Conséquence pour Luma Loop |
|---|---|---|
| App Store Connect — confidentialité | Apple exige une URL de politique de confidentialité pour une app iOS et une déclaration couvrant les pratiques de l’app et de ses partenaires tiers. | La modale interne ne suffit pas : `PRIVACY.md` doit être publié sous une URL HTTPS stable avant la soumission. |
| App Store Connect — âge | Une classification d’âge est obligatoire et se calcule à partir d’un questionnaire décrivant les contenus et capacités présents dans l’app. | Déclarer uniquement le contenu réellement livré : jeu abstrait, sans violence, achat, publicité, messagerie, navigation web, UGC ni hasard monétisé. |
| Google Play — Data safety | Toute app publiée, y compris sans collecte de données, doit compléter le formulaire et fournir une politique de confidentialité. Les SDK tiers sont inclus dans le périmètre. | Auditer l’audio distant et tout SDK embarqué avant de confirmer « aucune donnée collectée ou partagée ». |
| Google Play — âge/IARC | Une classification de contenu IARC est requise; les réponses doivent être mises à jour si le contenu évolue. | Préparer des réponses « aucune » pour les catégories absentes, puis contrôler le résultat calculé dans Play Console. |
| Signature de distribution | Une soumission nécessite une archive signée : `.aab` sur Android et `.ipa` sur iOS. EAS peut gérer les identifiants de signature ou utiliser des identifiants existants. | Préparer des profils `eas.json` de production, puis associer les identifiants privés dans les comptes de publication sans jamais les ajouter au dépôt. |

## Sources officielles

[1] [Apple — Manage app privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/)

[2] [Apple — Set an app age rating](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/)

[3] [Apple — App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

[4] [Google Play — Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)

[5] [Google Play — Content ratings](https://support.google.com/googleplay/android-developer/answer/9898843?hl=en)

[6] [Google Play — Content rating requirements](https://support.google.com/googleplay/android-developer/answer/9859655?hl=en)

[7] [Expo — EAS Build](https://docs.expo.dev/build/introduction/)

[8] [Expo — App credentials](https://docs.expo.dev/app-signing/app-credentials/)

[9] [Expo — Submit to app stores](https://docs.expo.dev/deploy/submit-to-app-stores/)
