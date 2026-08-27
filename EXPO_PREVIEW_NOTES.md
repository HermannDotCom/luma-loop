# Notes de prévisualisation Expo

Le test utilisateur sur un second téléphone Android a chargé correctement le bundle Expo Go et a validé les six parcours de `TEST_ON_DEVICE.md`. La compatibilité du projet avec Expo Go SDK 54 est donc confirmée pour ce flux de prévisualisation.

Le premier appareil Android a affiché `java.io.IOException: Failed to download remote update` avant l’exécution du bundle. Le manifeste Android et le bundle du projet ont répondu en HTTP 200 depuis l’environnement de développement. Cet échec est donc traité comme une limitation locale du premier appareil — cache Expo Go, réseau, proxy ou inspection HTTPS — et non comme un défaut du jeu ou un écart de SDK. Le lancement par tunnel a également été essayé puis retiré, car le tunnel n’est pas disponible dans cet environnement.

Avant un nouveau test sur un appareil en échec, forcez l’arrêt d’Expo Go, videz son stockage/cache, vérifiez que le réseau ne filtre pas les connexions HTTPS sortantes, puis scannez le QR actualisé du panneau Preview. La publication d’une version installable ne dépendra pas de ce canal de développement.
