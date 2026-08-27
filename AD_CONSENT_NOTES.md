# Préférence publicitaire future

Luma Loop ne diffuse actuellement aucune publicité et n’intègre aucun SDK publicitaire. Le réglage « Publicité future » garde seulement une préférence explicite et réversible sur l’appareil : être consulté plus tard, préférer des annonces non personnalisées ou demander une personnalisation.

Cette préférence interne **ne remplace pas** le consentement requis lors de l’intégration effective d’un partenaire. Avant toute diffusion, l’intégration devra sélectionner un SDK et faire afficher son formulaire de consentement à chaque lancement lorsque nécessaire; Google recommande notamment d’actualiser l’information de consentement à chaque lancement et d’exposer un point d’entrée de confidentialité si requis.[1] Sur iOS, une demande système App Tracking Transparency est nécessaire avant tout suivi entre apps ou sites, lorsque le cas s’applique.[2]

| Invariant du MVP | Règle à respecter avant ajout de publicité |
|---|---|
| Aucune publicité n’est chargée. | Ne charger aucune annonce avant le consentement applicable. |
| La préférence est locale et révocable. | Ne pas la présenter comme un substitut à une décision réglementaire. |
| L’app ne crée pas de compte. | Mettre à jour `PRIVACY.md`, la fiche store et les déclarations de données si un SDK collecte ou partage des données. |
| Le jeu vise un public général. | Réévaluer le public cible, le réseau et les règles enfants avant toute activation. |

## Références

[1] [Google — Set up UMP SDK](https://developers.google.com/admob/android/privacy)

[2] [Apple — User privacy and data use](https://developer.apple.com/app-store/user-privacy-and-data-use/)
