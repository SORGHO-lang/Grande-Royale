# Doublage IA — version HTML (sans serveur)

Même site que `doublage-ia/`, mais en **HTML/CSS/JS uniquement** : il s'héberge partout
(toutes les offres Hostinger, GitHub Pages…), sans Node.js.

Le navigateur du visiteur appelle directement l'API Dubbing d'ElevenLabs avec **sa propre clé**,
saisie via le bouton **⚙ Clé API** et enregistrée uniquement dans son navigateur.

## Mise en ligne sur Hostinger
1. hPanel → **Gestionnaire de fichiers** → dossier `public_html`
2. Envoyez `index.html`, `style.css` et `app.js` (ou le zip, puis « Extraire »)
3. Ouvrez votre domaine, cliquez sur **⚙ Clé API**, collez votre clé ElevenLabs

## Tester sans clé
Ajoutez `?demo` à l'adresse (ex. `https://votresite.com/?demo`) : le doublage est simulé.

## Important
- Ne mettez **jamais** votre clé dans le code : dans un site HTML, n'importe qui pourrait la lire.
  Chaque utilisateur saisit la sienne.
- Les vidéos sont envoyées directement à ElevenLabs, sans passer par votre hébergement.
- Si un message « blocage CORS » apparaît, utilisez la version serveur (`doublage-ia/`).
