# Site officiel de l'ISP SAHEL

Site web de l'**Institut Supérieur Privé du Sahel** (Ouagadougou, Burkina Faso) — *Diplômes reconnus par l'État*.

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS 4**
- **Supabase** : PostgreSQL (avec RLS), authentification, stockage de fichiers
- Mobile-first, mode clair par défaut + mode sombre, SEO complet (metadata, `sitemap.xml`, `robots.txt`, Open Graph, JSON-LD `CollegeOrUniversity`, flux RSS)
- Espace d'administration complet (`/admin`)

> Sans Supabase configuré, le site public fonctionne en **mode démo** avec les données du seed (pratique pour le développement et la relecture). L'administration et l'enregistrement des formulaires nécessitent Supabase.

---

## 1. Arborescence

```
isp-sahel/
├── public/                  Logo, photos (visuels de substitution à remplacer)
├── scripts/                 Seed SQL, création d'admin, vérifications (liens, navigateur, BDD)
├── supabase/
│   ├── migrations/          Schéma, RLS, buckets Storage
│   └── seed.sql             Données de départ (généré depuis src/lib/seed-data.ts)
├── src/
│   ├── app/
│   │   ├── (site)/          Pages publiques (accueil, institut, formations, admission…)
│   │   ├── admin/           Administration (connexion, CRUD, paramètres, exports)
│   │   ├── actions/         Server Actions des formulaires publics
│   │   ├── sitemap.ts, robots.ts, opengraph-image.tsx, icon.png, favicon.ico
│   ├── components/          Composants (layout, cartes, formulaires, admin)
│   └── lib/                 Données, validation, sécurité, Supabase, configuration
└── tests/                   Tests unitaires (Vitest) et tests SQL/RLS
```

### Pages publiques

| URL | Contenu |
| --- | --- |
| `/` | Hero, chiffres clés, encadré de confiance, filières, atouts, partenaires, témoignages, actualités |
| `/institut` | À propos, mot du DG, reconnaissance officielle, histoire, équipe |
| `/formations`, `/formations/[slug]` | Tableau récapitulatif + fiche détaillée par filière |
| `/admission` | Étapes, pièces, conditions, **formulaire de pré-inscription** |
| `/scolarite` | Processus, frais, calendrier (indicatif), FAQ |
| `/vie-etudiante`, `/partenaires`, `/galerie` | Services, partenaires, galerie avec visionneuse |
| `/actualites`, `/actualites/[slug]`, `/actualites/rss.xml` | Blog paginé, filtres, partage, RSS |
| `/documents` | Recherche, filtre par rubrique, téléchargement (URL signée) |
| `/contact` | Coordonnées, formulaire, carte OpenStreetMap |
| `/mentions-legales`, `/confidentialite` | Pages légales |

### Modèle de données

`profils` (rôles), `parametres` (clé/valeur), `filieres`, `categories`, `articles`, `documents`, `galerie_photos`, `equipe`, `partenaires`, `temoignages`, `preinscriptions`, `messages_contact`. Voir `supabase/migrations/20261013000000_schema.sql`.

**Sécurité (RLS)** : lecture publique des seuls contenus publiés ; écriture réservée au personnel. L'**éditeur** gère actualités, documents et galerie ; l'**admin** gère tout (filières, équipe, partenaires, témoignages, paramètres, pré-inscriptions, messages, utilisateurs). Les formulaires publics passent par le serveur (aucune écriture anonyme possible en base).

---

## 2. Installation locale

Prérequis : Node.js 20+ (22 recommandé).

```bash
cd isp-sahel
npm install
cp .env.example .env.local     # puis renseigner les variables (facultatif en mode démo)
npm run dev                    # http://localhost:3000
```

### Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL publique (`https://ispsahel.com`) — liens canoniques, sitemap, Open Graph |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Projet Supabase (Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur (formulaires, URL signées, vérification des fichiers). **Ne jamais l'exposer.** |
| `RESEND_API_KEY`, `EMAIL_FROM`, `NOTIFICATION_EMAIL` | E-mails de notification (Resend). Facultatif. |
| `NEXT_PUBLIC_MAX_UPLOAD_MB` | Taille maximale des documents (20 par défaut — garder en phase avec le bucket) |
| `RATE_LIMIT_SALT` | Sel aléatoire pour anonymiser les IP |

### Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` / `build` / `start` | Développement, build de production, serveur |
| `npm run lint`, `npm run typecheck` | ESLint, TypeScript |
| `npm test` | Tests unitaires (validation des formulaires, upload, rôles, CSV, nettoyage HTML, données officielles) |
| `npm run test:db` | Applique migrations + seed sur un PostgreSQL local jetable et vérifie toutes les règles RLS |
| `npm run seed:sql` | Régénère `supabase/seed.sql` à partir de `src/lib/seed-data.ts` |
| `npm run check:links -- http://localhost:3000` | Explore le site et échoue au moindre lien mort |
| `node scripts/smoke.mjs http://localhost:3000` | Contrôle navigateur de chaque page de 320 à 1440 px (débordement, alt, erreurs console) |
| `npm run assets` | Régénère les visuels de substitution manquants |
| `npm run create-admin -- email motdepasse "Nom"` | Crée le premier administrateur |

---

## 3. Mise en place de Supabase

1. Créez un projet sur [supabase.com](https://supabase.com) (région la plus proche : `eu-west`/Europe).
2. **SQL Editor** → exécutez dans l'ordre :
   - `supabase/migrations/20261013000000_schema.sql` (tables, RLS, buckets `media` et `documents`) ;
   - `supabase/seed.sql` (filières, équipe, partenaires, témoignages, articles, documents types, paramètres).

   Ou avec la CLI : `supabase link --project-ref <ref>` puis `supabase db push` et `psql "$DB_URL" -f supabase/seed.sql`.
3. **Authentication → Providers → Email** : laissez l'e-mail activé et **désactivez « Allow new users to sign up »** (pas d'inscription publique).
4. Copiez l'URL et les clés dans `.env.local` (et dans Vercel).

### Créer le premier administrateur

```bash
npm run create-admin -- direction@ispsahel.com "MotDePasseTrèsSolide2026" "Dr OUALI Palamanga"
```

Connectez-vous ensuite sur `/admin/connexion`. Les comptes suivants (admin ou éditeur) se créent depuis **Admin → Utilisateurs**.

---

## 4. Déploiement (Vercel + Supabase)

1. Poussez le dépôt sur GitHub, puis sur [vercel.com](https://vercel.com) : **Add New → Project** → importez le dépôt.
2. **Root Directory : `isp-sahel`** (le dépôt contient aussi un autre site dans `docs/`). Framework : Next.js (détecté).
3. Renseignez toutes les variables d'environnement (Production + Preview), avec `NEXT_PUBLIC_SITE_URL=https://ispsahel.com`.
4. Déployez. Les pages publiques sont générées statiquement et revalidées toutes les 5 minutes ; chaque enregistrement dans l'admin les régénère immédiatement.

### Nom de domaine ispsahel.com

1. Vercel → Project → **Settings → Domains** → ajoutez `ispsahel.com` et `www.ispsahel.com` (redirection de `www` vers le domaine nu, ou l'inverse).
2. Chez le registraire du domaine, créez les enregistrements indiqués par Vercel, en général :
   - `A` `@` → `76.76.21.21`
   - `CNAME` `www` → `cname.vercel-dns.com`
   (ou délégation complète des serveurs DNS vers `ns1.vercel-dns.com` / `ns2.vercel-dns.com`).
3. **SSL** : le certificat HTTPS (Let's Encrypt) est émis et renouvelé automatiquement par Vercel dès que le DNS est propagé (quelques minutes à 48 h).
4. **E-mails** : si `contact@ispsahel.com` est hébergé ailleurs, **conservez les enregistrements MX existants**. Pour Resend, ajoutez les enregistrements SPF/DKIM fournis par Resend (domaine `ispsahel.com`) afin que `EMAIL_FROM` soit délivré.
5. Dans Supabase → **Authentication → URL Configuration**, mettez `Site URL = https://ispsahel.com`.

---

## 5. Administration

- **Actualités** : éditeur riche (titres, listes, liens, citations, images), brouillon/publié, date de publication programmable.
- **Documents** : téléversement PDF, Word, PowerPoint, Excel, CSV, TXT, ZIP (20 Mo max). Le fichier est envoyé directement au stockage Supabase depuis le navigateur, puis **revérifié côté serveur** (extension, type MIME réellement stocké, taille) ; tout fichier non conforme est supprimé. Le téléchargement public passe par une **URL signée** valable 5 minutes. Un fichier remplacé ou un document supprimé est effacé du stockage.
- **Galerie** : ajout multiple, légendes, texte alternatif, albums, ordre.
- **Filières, Équipe, Partenaires, Témoignages, Catégories** (admin).
- **Pré-inscriptions et Messages** : statut nouveau/traité, suppression, **export CSV** (compatible Excel).
- **Paramètres** : chiffres clés, téléphones, e-mail, WhatsApp, frais, calendrier académique, pièces du dossier, mot du DG.

### Sécurité

- RLS sur toutes les tables et sur Storage, rôles `admin` / `editeur` vérifiés à la fois dans l'application et en base.
- Server Actions (protection CSRF intégrée de Next.js : vérification de l'origine), formulaires validés côté client **et** serveur (Zod).
- Anti-spam : champ piège, délai minimal de saisie, limitation de débit (en mémoire + en base par empreinte d'IP, 5 envois / 15 min). Connexion admin limitée à 8 tentatives / 15 min.
- En-têtes : CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, nosniff. `/admin` en `noindex` et `no-store`.
- HTML des articles nettoyé par liste blanche (sanitize-html) à l'enregistrement et à l'affichage ; export CSV protégé contre l'injection de formules.

---

## 6. Assets (visuels de substitution)

Les fichiers suivants sont des **visuels générés provisoirement** (mention « Photo à remplacer ») car les originaux n'étaient pas dans le dépôt. Remplacez-les en conservant les mêmes noms, ou téléversez de nouvelles images depuis l'admin :

| Fichier | À remplacer par |
| --- | --- |
| `public/filieres/*.jpg` | Une photo par filière (~1200 × 750) |

Déjà remplacés par les visuels officiels : logo (`public/brand/logo.png` et icônes dérivées dans `src/app/`), photo d'accueil (`public/hero/diplomee.jpg`) et galerie (`public/gallery/ceremonie-*.jpg`, 26 photos).

Voir aussi **[CHECKLIST.md](./CHECKLIST.md)** : liste des éléments à fournir par l'établissement.

---

## 7. Résultats de vérification (build actuel)

- `npm run build` : aucune erreur ni avertissement ; 24 tests unitaires et tests SQL/RLS passés.
- Explorateur de liens : 164 URL, **aucun lien mort**.
- Navigateur : 17 pages × 5 largeurs (320 → 1440 px), aucun débordement horizontal, aucune image sans `alt`, aucune erreur console.
- Lighthouse mobile (accueil) : Performance 92 · Accessibilité 100 · Bonnes pratiques 96 · SEO 100.

---

## 8. Version HTML (hébergement mutualisé Hostinger, sans Node.js)

Le dossier **`../isp-sahel-html/`** contient une version **statique** du site (HTML + CSS + JS + un fichier PHP pour les formulaires), qui fonctionne sur n'importe quel hébergement web classique. Guide de mise en ligne en français : `isp-sahel-html/LISEZ-MOI.md`.

- Même design et mêmes pages ; menu, mode sombre, galerie, recherche de documents et filtre des actualités en JavaScript sans dépendance (`static-export/assets/js/site.js`).
- Formulaires → `envoi.php` : validation, anti-robots, limitation de débit, e-mail à l'établissement et enregistrement dans `donnees/*.csv` (dossier interdit d'accès web).
- Documents : déposer un fichier nommé selon `documents/fichiers/NOMS-DES-FICHIERS.txt` active le bouton « Télécharger » (détection via `documents/liste.php`).
- Pas d'espace d'administration.

**Régénérer** après une modification du code ou de `src/lib/seed-data.ts` (sans variables Supabase, donc en mode démo) :

```bash
npm run build && npx next start -p 3100 &   # serveur local
npm run export:html                          # écrit ../isp-sahel-html (conserve documents/fichiers et donnees)
```

Les fichiers modèles propres à cette version (PHP, `.htaccess`, scripts, guide) sont dans `static-export/`.
