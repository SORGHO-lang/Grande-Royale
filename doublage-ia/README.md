# Doublage IA 🎙️

Site web pour **transformer la voix off d'une vidéo en plusieurs langues**, avec une voix **réaliste** :
la voix d'origine est clonée, traduite et synchronisée sur l'image, et la musique et les bruits de fond sont conservés.

Le moteur utilisé est l'API **Dubbing d'ElevenLabs** (transcription → traduction → clonage de voix → remixage).

## Fonctionnalités
- Import par glisser-déposer (MP4, MOV, WEBM, MP3… jusqu'à 1 Go) ou par **lien** (YouTube, TikTok, X…)
- **32 langues** cibles, plusieurs à la fois (un doublage par langue)
- Détection automatique de la langue d'origine et du nombre de personnes qui parlent
- Options : clonage de la voix d'origine, conservation du fond sonore
- Suivi en direct, lecteur vidéo intégré, téléchargement de la vidéo doublée et des sous-titres `.srt`
- Les doublages restent listés après rechargement de la page
- Interface en français, adaptée au mobile

## Installation
```bash
cd doublage-ia
npm install
cp .env.example .env      # puis collez votre clé dans ELEVENLABS_API_KEY
npm start                 # → http://localhost:3000
```
Clé API : https://elevenlabs.io/app/settings/api-keys (le doublage consomme des crédits ElevenLabs selon la durée de la vidéo).

Sans clé dans `.env`, chaque visiteur peut saisir la sienne via le bouton **⚙ Clé API**. Elle est alors gardée dans un cookie `httpOnly` de son navigateur, jamais côté serveur.

### Tester sans clé
```bash
npm run demo
```
Le mode démo simule le doublage et renvoie la vidéo d'origine. Il sert à essayer l'interface.

## Mise en ligne
L'application est un serveur Node.js (≥ 20). Elle ne peut donc **pas** être hébergée sur GitHub Pages.
Elle s'héberge sur Render, Railway, Fly.io ou un VPS : commande `npm start`, variable d'environnement `ELEVENLABS_API_KEY`.

## Structure
```
server.js         API Express (envoi, suivi, vidéo, sous-titres)
public/index.html interface
public/style.css  design
public/app.js     logique côté navigateur
```
