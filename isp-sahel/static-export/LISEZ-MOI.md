# Site ISP SAHEL — version HTML pour Hostinger

Ce dossier contient **tout le site**, prêt à être déposé chez Hostinger.
Il fonctionne avec **n'importe quelle formule** d'hébergement web (Premium, Business…) : pas besoin de VPS.

---

## 1. Ce qu'il y a dans le dossier

| Élément | À quoi ça sert |
| --- | --- |
| `index.html` et les dossiers `institut/`, `formations/`, `admission/`… | Les pages du site |
| `assets/` | Le style (couleurs, mise en page) et les petites animations (menu, mode sombre, galerie…) |
| `brand/`, `hero/`, `filieres/`, `gallery/` | Le logo et les photos (**provisoires** : à remplacer) |
| `envoi.php` | Reçoit les formulaires (pré-inscription et contact) et vous les envoie par e-mail |
| `documents/fichiers/` | Les documents à télécharger (PDF…) |
| `donnees/` | **Privé** : la liste des pré-inscriptions et des messages (fichiers Excel). Personne ne peut y accéder depuis Internet. |
| `.htaccess` | Réglages du serveur (sécurité, HTTPS…). **Ne pas supprimer.** |

---

## 2. Mettre le site en ligne (≈ 10 minutes)

1. Connectez-vous à **hPanel** (hostinger.com).
2. Allez dans **Sites web** → choisissez **ispsahel.com** → **Tableau de bord**.
3. Ouvrez le **Gestionnaire de fichiers**, puis le dossier **`public_html`**.
4. S'il contient un fichier `default.php` (page Hostinger par défaut), **supprimez-le**.
5. Cliquez sur **Importer** (icône flèche vers le haut) et envoyez le fichier **`isp-sahel-html.zip`**.
6. Faites un clic droit sur le .zip → **Extraire** → laissez le dossier **`public_html`** (ou un point `.`) → **Extraire**.
   Les fichiers (`index.html`, `assets`, etc.) doivent se trouver **directement** dans `public_html`, et non dans un sous-dossier.
7. Supprimez le fichier .zip (il ne sert plus).
8. Ouvrez **https://ispsahel.com** : le site s'affiche. 🎉

> **Vous ne voyez pas le fichier `.htaccess` ?** C'est normal, il est « caché ». Dans le Gestionnaire de fichiers, activez **Afficher les fichiers cachés** (paramètres en haut à droite) pour vérifier qu'il est bien là.

---

## 3. Activer le cadenas HTTPS (SSL)

hPanel → **Sécurité** → **SSL** → à côté de ispsahel.com, cliquez sur **Installer** (certificat gratuit).
Cela prend quelques minutes. Ensuite, sur la même page, activez **Forcer HTTPS** pour que tous les visiteurs passent en `https://`.

---

## 4. Recevoir les pré-inscriptions par e-mail

Les formulaires envoient un e-mail à **contact@ispsahel.com**.

1. Cette adresse doit **exister** : hPanel → **E-mails** → créez la boîte `contact@ispsahel.com` si ce n'est pas déjà fait.
2. Pour changer l'adresse qui reçoit les demandes : ouvrez **`envoi.php`** dans le Gestionnaire de fichiers (clic droit → **Modifier**) et changez les lignes du haut :

   ```php
   $DESTINATAIRE = 'contact@ispsahel.com';   // qui reçoit les demandes
   $EXPEDITEUR   = 'contact@ispsahel.com';   // doit être une adresse de VOTRE domaine
   ```

3. **Faites un essai** : remplissez le formulaire de pré-inscription sur le site, puis vérifiez votre boîte mail (et les spams).

### La liste complète des inscriptions (Excel)

Chaque demande est **aussi enregistrée** dans le dossier privé `donnees/` :

- `donnees/preinscriptions.csv` : toutes les pré-inscriptions
- `donnees/messages.csv` : tous les messages de contact

Pour les consulter : Gestionnaire de fichiers → `donnees` → clic droit sur le fichier → **Télécharger**, puis ouvrez-le avec **Excel**.
Même si un e-mail se perd, la demande reste dans cette liste.

---

## 5. Ajouter un document à télécharger (PDF…)

C'est très simple : **il suffit de déposer le fichier avec le bon nom**.

1. Gestionnaire de fichiers → `public_html/documents/fichiers/`
2. Ouvrez **`NOMS-DES-FICHIERS.txt`** : il donne le nom exact de chaque document. Par exemple :
   - `reglement-interieur.pdf` → Règlement intérieur
   - `programme-genie-civil-option-btp.pdf` → Programme de la filière BTP
3. Renommez votre fichier **exactement** ainsi (en minuscules, sans accents ni espaces) et **importez-le** dans ce dossier.
4. Sur le site, le bouton « Bientôt disponible » devient **« Télécharger »** tout seul, avec la taille du fichier.

Formats acceptés : PDF (conseillé), Word, Excel, PowerPoint, ZIP, CSV, TXT.

---

## 6. Remplacer les photos et le logo

Toutes les images du site sont les visuels officiels de l'établissement.
Pour changer une image, remplacez le fichier **en gardant exactement le même nom** :

| Fichier | Photo à mettre |
| --- | --- |
| `brand/logo.png` | Logo officiel (carré, fond transparent, environ 512 × 512) |
| `hero/diplomee.jpg` | Photo principale de l'accueil (étudiante en toge), en hauteur |
| `filieres/genie-civil-btp.jpg` | Filière BTP |
| `filieres/geometre-topographie.jpg` | Filière Géomètre Topographie |
| `filieres/systemes-informatiques.jpg` | Filière ISI |
| `filieres/informatique-gestion.jpg` | Filière Informatique de Gestion |
| `filieres/reseaux-telecoms.jpg` | Filière Réseaux & Télécoms |
| `gallery/ceremonie-01.jpg` … `ceremonie-26.jpg` | Photos de la galerie |
| `equipe/ouali-palamanga.jpg` | Photo du Fondateur & Directeur Général (carrée) |
| `equipe/ouedraogo-lamini.jpg` | Photo du Directeur académique (carrée) |

Conseil : réduisez les photos à **1600 pixels de large maximum** avant de les envoyer (le site restera rapide sur téléphone).
Après un remplacement, faites **Ctrl + F5** sur le site pour voir la nouvelle image.

---

## 7. Modifier un texte

Les textes sont dans les fichiers `index.html` de chaque dossier (par ex. `institut/index.html` pour la page L'institut).
Dans le Gestionnaire de fichiers : clic droit → **Modifier**, puis cherchez le texte (Ctrl + F), modifiez-le et **Enregistrez**.

⚠️ Ne touchez qu'au texte visible, pas aux balises `< >`. En cas de doute, demandez de l'aide : il est plus sûr de régénérer le site.

---

## 8. Ce que cette version ne contient pas

- **Pas d'espace d'administration** : les ajouts se font en déposant ou en modifiant des fichiers (voir ci-dessus).
- Pour ajouter une **actualité** ou une **filière**, le plus simple est de demander une nouvelle génération du site.
  La version complète (avec espace admin) reste disponible dans le dossier `isp-sahel/` du dépôt.

---

## 9. En cas de problème

| Problème | Solution |
| --- | --- |
| La page Hostinger par défaut s'affiche | Supprimez `default.php` dans `public_html` |
| Les pages autres que l'accueil donnent une erreur | Vérifiez que `.htaccess` est bien présent dans `public_html` (fichiers cachés) |
| Le formulaire dit « L'envoi n'a pas abouti » | Vérifiez que la boîte `contact@ispsahel.com` existe ; regardez `donnees/preinscriptions.csv` |
| Les e-mails arrivent dans les spams | hPanel → E-mails → vérifiez que les réglages **SPF/DKIM** du domaine sont activés |
| Le site n'est pas en HTTPS | Installez le certificat SSL (étape 3) |
