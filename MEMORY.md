# Notes de continuité — Luma Loop

Le MVP est volontairement local et sans monétisation. La mécanique retenue est : « toucher lorsque la luciole menthe passe dans la porte ambre ». Une réussite augmente le score et change la porte; un échec retire un des trois pétales, remet la série à zéro et laisse la boucle active.

La palette est : Nuit Encre `#090B1A`, Iris Électrique `#8B5CF6`, Menthe Lumen `#43F3C5`, Ambre Solaire `#FFD166`, Corail Doux `#FF6B8A`, Blanc Brume `#F4F7FF`. Le jeu se destine exclusivement au portrait 9:16.

Avant toute évolution de gameplay, préserver les invariants couverts par les tests : les angles 0 et 2π sont adjacents, une réussite déplace la porte, trois échecs terminent la partie et la fenêtre de réussite conserve un plancher lisible.

La difficulté n’est plus calculée sur le score, mais sur les passages réussis : 0–3 Éveil, 4–8 Élan, 9–14 Éclipse, 15–21 Flux et 22+ Luma. À Éclipse, la direction est inversée au passage du niveau et change ensuite à intervalle régulier selon le palier. Une touche parfaite et une série d’au moins trois réussites reçoivent un bonus de score.

Les défis quotidiens sont générés de manière déterministe depuis la date locale et se limitent à des actions déjà présentes dans la boucle de jeu. La récompense Aube est ajoutée de façon permanente au profil local au premier achèvement. Les autres thèmes utilisent uniquement le meilleur score persistant; aucun thème ne dépend d’un paiement.

La série quotidienne ne s’incrémente qu’une fois par date, progresse seulement si la date est consécutive à la précédente réussite et garde son meilleur historique après une interruption. Le mode `training` du moteur est intentionnellement non terminal : une erreur y réinitialise la série mais ne retire aucune vie et ne peut jamais déclencher `finished`.
