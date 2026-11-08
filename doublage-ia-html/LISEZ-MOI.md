# Doublage IA — version HTML (sans serveur)

Même site que `doublage-ia/`, mais en **HTML/CSS/JS uniquement** : il s'héberge partout
(toutes les offres Hostinger, GitHub Pages…), sans Node.js.

Le navigateur du visiteur appelle directement l'API Dubbing d'ElevenLabs avec **sa propre clé**,
saisie via le bouton **⚙ Clé API** et enregistrée uniquement dans son navigateur.

Le site contient deux outils (onglets en haut de la page) :
- **Doublage vidéo** — ElevenLabs, clé via **⚙ Clé API**
- **Analyse d'affiche** (`#affiche`) — décrit une affiche et identifie son public cible avec OpenAI,
  clé via **⚙ Clé OpenAI** (à créer sur https://platform.openai.com/api-keys). Le modèle est choisi
  automatiquement (le plus récent « gpt-… » disponible pour la clé) ou fixé dans le même réglage.

## Mise en ligne sur Hostinger
1. hPanel → **Gestionnaire de fichiers** → dossier `public_html`
2. Envoyez les 4 fichiers : `index.html`, `style.css`, `app.js`, `affiche.js`
   (ou le zip, puis « Extraire »)
3. Ouvrez votre domaine et saisissez vos clés avec le bouton **⚙**

L'analyse d'affiche ne marche pas en ouvrant `index.html` en double-clic (fichier local) : elle doit être servie par un site web (Hostinger, etc.).

## Tester sans clé
Ajoutez `?demo` à l'adresse (ex. `https://votresite.com/?demo`) : le doublage est simulé.

## Important
- Ne mettez **jamais** votre clé dans le code : dans un site HTML, n'importe qui pourrait la lire.
  Chaque utilisateur saisit la sienne.
- Les vidéos sont envoyées directement à ElevenLabs, sans passer par votre hébergement.
- Si un message « blocage CORS » apparaît, utilisez la version serveur (`doublage-ia/`).
