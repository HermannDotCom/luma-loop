# Notes de continuité — Luma Loop

Le MVP est volontairement local et sans monétisation. La mécanique retenue est : « toucher lorsque la luciole menthe passe dans la porte ambre ». Une réussite augmente le score et change la porte; un échec retire un des trois pétales, remet la série à zéro et laisse la boucle active.

La palette est : Nuit Encre `#090B1A`, Iris Électrique `#8B5CF6`, Menthe Lumen `#43F3C5`, Ambre Solaire `#FFD166`, Corail Doux `#FF6B8A`, Blanc Brume `#F4F7FF`. Le jeu se destine exclusivement au portrait 9:16.

Avant toute évolution de gameplay, préserver les invariants couverts par les tests : les angles 0 et 2π sont adjacents, une réussite déplace la porte, trois échecs terminent la partie et la fenêtre de réussite conserve un plancher lisible.
