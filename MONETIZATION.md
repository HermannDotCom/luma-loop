# Monétisation recommandée — Luma Loop

> **Avis de prudence :** ceci est une analyse produit, pas une prévision de revenu ni un conseil financier. Le résultat dépendra surtout de la rétention, du volume de joueurs, des pays d’audience, des coûts d’acquisition et du remplissage publicitaire.

## Recommandation

Pour ce jeu très simple, je recommande un modèle **free-to-play financé d’abord par de la publicité récompensée, jamais imposée**, plutôt qu’un abonnement. Le joueur n’a pas aujourd’hui une raison assez forte et récurrente de payer chaque mois : l’abonnement ne correspondrait ni à la durée des sessions ni à la profondeur de contenu du MVP. La publicité peut être pertinente, mais seulement comme échange explicite de valeur et après validation de la rétention.

| Format | Décision | Raison |
|---|---|---|
| Vidéo récompensée en fin de partie | Recommandée à tester en v1.1. | Offre un « continuer une fois » ou un multiplicateur de récompense uniquement sur demande du joueur. |
| Interstitiel entre les manches | À éviter au lancement. | Les manches sont brèves : interrompre fréquemment la relance abîmerait le rythme central. |
| Bannière permanente | À exclure. | Réduit l’espace tactile et dégrade l’impression premium sans créer une récompense claire. |
| Abonnement mensuel | À repousser. | À envisager seulement après ajout de contenu récurrent, défis, thèmes saisonniers ou avantages substantiels. |
| Cosmétiques | Option secondaire future. | À introduire lorsque la collection possède une vraie valeur visuelle et un nombre suffisant d’objets. |

## Cadre enfants et audiences mixtes

Le choix « accessible dès 6 ans » change complètement le risque de conformité. Dans la catégorie Enfants d’Apple, les publicités tierces sont en principe exclues, avec seulement des exceptions contextuelles limitées.[1] Sur Google Play, si des enfants font partie de l’audience cible, les annonces aux enfants ou aux utilisateurs d’âge inconnu doivent passer par un SDK certifié Families, sans ciblage par centres d’intérêt; une audience mixte exige en plus un écran d’âge neutre.[2]

Par conséquent, le jeu ne doit pas être présenté comme une application spécifiquement conçue pour les enfants si son modèle futur repose sur la publicité tierce. La voie pragmatique est de le positionner comme un **jeu de réflexe généraliste**, de choisir un public cible cohérent dans les consoles, et d’ajouter une architecture d’âge neutre avant toute intégration publicitaire. Cela ne supprime pas les obligations relatives aux mineurs : les déclarations et la configuration du SDK restent à contrôler juridiquement avant publication.

## Seuil de décision produit

Ne prévoyez pas de revenu significatif dès la publication. Le test à réaliser est d’abord comportemental : le jeu doit obtenir des relances naturelles, une rétention et des sessions suffisamment régulières pour que l’affichage d’une récompense ne soit pas vécu comme une friction. Une fois un petit groupe de test constitué, comparez une cohorte sans annonces à une cohorte avec une seule récompense optionnelle par session; conservez cette dernière uniquement si la relance et le temps de jeu ne se dégradent pas sensiblement.

## Intégration future, sans activation dans le MVP

L’intégration devra isoler le fournisseur publicitaire dans un module `ads/` avec quatre garde-fous : consentement et écran d’âge neutre lorsque requis, configuration non personnalisée par défaut pour les mineurs ou âges inconnus, aucune annonce au lancement ni pendant une action de jeu, et un bouton « Continuer avec une vidéo » clairement facultatif. Les déclarations App Privacy et Data safety devront être révisées dès l’ajout du SDK, car les pratiques des partenaires tiers doivent être déclarées.[3] [4]

## Références

[1]: https://developer.apple.com/app-store/review/guidelines/ "Apple — App Review Guidelines, Kids Category"
[2]: https://support.google.com/googleplay/android-developer/answer/9893335?hl=en "Google Play — Families Policies"
[3]: https://developer.apple.com/app-store/app-privacy-details/ "Apple — App privacy details"
[4]: https://support.google.com/googleplay/android-developer/answer/9859455?hl=en "Google Play — Prepare your app for review"
