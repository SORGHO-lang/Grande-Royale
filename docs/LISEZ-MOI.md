# La Grande Royale — site web

Site vitrine statique en **HTML / CSS / JavaScript**, sans framework ni base de données.
Il fonctionne sur n'importe quel hébergement (OVH, Hostinger, Netlify, GitHub Pages, cPanel…) :
il suffit de déposer le contenu du dossier à la racine du serveur.

---

## 1. Contenu du dossier

```
index.html            Page d'accueil
galerie.html          Galerie photo (filtres + lightbox) et galerie vidéo
conferences.html      Conférences, séminaires et coaching
boutique.html         Livre, formations en ligne, publicité, points de vente, WhatsApp
a-propos.html         À propos, contact et mentions légales
assets/css/style.css  Toute la mise en forme
assets/js/script.js   Toutes les interactions
assets/img/           Images (visuels de substitution à remplacer)
LISEZ-MOI.md          Ce document
```

Les polices **Cormorant Garamond** et **Jost** sont chargées depuis le CDN Google Fonts.

---

## 2. À remplacer en priorité

### La photo de l'auteure — la plus importante

Le fichier **`assets/img/azeta-dinga.png`** est utilisé à trois endroits :
la page d'accueil (grande photo à droite du titre), la section « Une femme, une vision »
et la page À propos.

Pour la mettre à jour, **une seule chose à faire** : remplacez ce fichier par la vraie photo,
en conservant exactement le même nom `azeta-dinga.png`. Les trois emplacements se mettent
à jour d'un coup.

Conditions pour un rendu optimal :

- **Fond transparent** (photo détourée) et format **PNG** — c'est ce qui permet à la photo
  de se poser directement sur le fond sombre de la page d'accueil.
- Cadrage **carré**, la personne centrée et occupant toute la hauteur.
- Environ **1200 × 1200 px**.

Une photo avec un fond blanc fonctionnera aussi, mais on verra un rectangle blanc
autour d'elle sur la page d'accueil.

### Les autres images

Les images restantes de `assets/img/` sont des visuels provisoires au format SVG.
Remplacez-les par vos vraies photos en `.jpg` ou `.webp`, puis mettez à jour
l'extension dans les fichiers HTML (`.svg` → `.jpg`).

Les visuels du livre — `livre-3d.jpg` (accueil et boutique) et
`livre-couverture-complete.jpg` (boutique) — sont vos fichiers d'origine,
intégrés sans aucune retouche.

| Fichier | Où il apparaît | Format conseillé |
|---|---|---|
| `banniere-*.svg` | Bandeaux des pages intérieures | paysage, 1920 × 800 px |
| `galerie-01…12.svg` | Galerie photo | paysage, 1200 × 900 px |
| `video-01…04.svg` | Miniatures vidéo | 1280 × 720 px |
| `formation-01…03.svg` | Vignettes des formations | 1000 × 750 px |
| `appel.svg` | Bandeaux d'appel à l'action | paysage, 1920 × 1000 px |
| `favicon.svg` | Icône de l'onglet du navigateur | carré |

### Les textes entre crochets

Tout ce qui est écrit `[entre crochets]` est à compléter :

- **Témoignages** (`index.html`) : trois citations, avec nom et profession.
- **Biographie** (`a-propos.html`) : 300 à 500 mots sur le parcours de l'auteure.
- **Formations** (`boutique.html`) : durées et tarifs.
- **Points de vente** (`boutique.html`) : adresses.
- **Mentions légales** (`a-propos.html`) : éditeur, responsable de publication,
  adresse, hébergeur et conditions générales de vente.

---

## 3. Réglages rapides

### Numéro WhatsApp

Dans `assets/js/script.js`, tout en haut :

```js
var CONFIG = {
  whatsapp: "22674038900",   // numéro international, sans le "+"
  messageWhatsapp: "Bonjour La Grande Royale, je souhaite commander le livre…",
  emails: ["azetadinga@yahoo.fr", "granderoyale99@gmail.com"]
};
```

Tous les boutons WhatsApp du site (dont le bouton vert flottant) utilisent ce numéro.

### Couleurs

Dans `assets/css/style.css`, section `:root` :

```css
--ivoire:  #FFF9F0;   /* fond clair            */
--encre:   #7A1400;   /* rouge profond         */
--or:      #A85C0A;   /* accent orange         */
--heros-a: #8D0300;   /* dégradé accueil, début */
--heros-c: #D99000;   /* dégradé accueil, fin   */
```

Modifier ces valeurs suffit à changer l'identité visuelle du site entier.
La palette actuelle est reprise de leaderaigle.com.

### Vidéos YouTube

Dans `galerie.html`, chaque vidéo a un attribut `data-video` vide :

```html
<figure class="video" data-video="" …>
```

Renseignez-y l'identifiant de la vidéo YouTube (la partie après `watch?v=`).
Exemple : `data-video="dQw4w9WgXcQ"`. La vidéo se charge au clic seulement,
ce qui garde la page rapide.

---

## 4. Le formulaire de contact

Le site étant purement statique, le formulaire d'`a-propos.html` **vérifie les champs
puis ouvre le logiciel de messagerie du visiteur** avec un message pré-rempli adressé
aux deux e-mails de La Grande Royale.

Pour recevoir les messages directement dans une boîte mail sans passer par le logiciel
du visiteur, deux solutions gratuites et sans serveur :

1. **Formspree** (formspree.io) — créez un formulaire, récupérez son adresse, puis
   remplacez dans `a-propos.html` :
   `<form class="formulaire" novalidate>`
   par
   `<form class="formulaire" action="https://formspree.io/f/VOTRE_ID" method="POST" novalidate>`
   et supprimez le bloc `formulaire()` de `script.js`.
2. **Web3Forms** (web3forms.com) — même principe, avec une clé d'accès.

Le lien `?objet=…` fonctionne déjà : par exemple
`a-propos.html?objet=Coaching#contact` ouvre la page avec l'objet « Coaching » présélectionné.

---

## 5. Ce qui est déjà en place

- Menu fixe qui devient opaque au défilement, menu plein écran sur téléphone
- Barre de progression de lecture en haut de page
- Animations d'apparition au défilement (désactivées si le visiteur a demandé
  la réduction des animations dans son système)
- Compteurs animés sur la page d'accueil
- Carrousel de témoignages, avec glissement au doigt sur mobile
- Galerie filtrable + lightbox (flèches, touche Échap, navigation au clavier)
- Accordéons pour la FAQ et les mentions légales
- Bouton WhatsApp flottant sur toutes les pages
- Balises `<meta>` pour le référencement et le partage sur les réseaux sociaux
- Feuille de style d'impression

---

## 6. Mise en ligne

1. Vérifiez le site en local : ouvrez `index.html` dans un navigateur.
2. Envoyez **tout le dossier** (les 5 fichiers `.html` + le dossier `assets/`)
   à la racine de votre hébergement, par FTP ou par le gestionnaire de fichiers.
3. La page d'accueil est `index.html` : elle s'affichera automatiquement.

---

*Contact : azetadinga@yahoo.fr — granderoyale99@gmail.com*
