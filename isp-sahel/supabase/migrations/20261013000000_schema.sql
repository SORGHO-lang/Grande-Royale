-- ════════════════════════════════════════════════════════════════════════
-- ISP SAHEL — schéma initial
-- Tables de contenu, formulaires publics, profils/rôles, RLS et Storage.
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── Utilitaires ────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── Profils (rôles des comptes d'administration) ───────────────────────
create table public.profils (
  id uuid primary key references auth.users (id) on delete cascade,
  nom text,
  role text not null default 'editeur' check (role in ('admin', 'editeur')),
  created_at timestamptz not null default now()
);

-- Les fonctions de rôle sont SECURITY DEFINER pour éviter la récursion RLS.
create or replace function public.current_role_name()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profils where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profils where id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profils where id = auth.uid() and role = 'admin');
$$;

-- ─── Paramètres du site (clé / valeur) ─────────────────────────────────
create table public.parametres (
  cle text primary key,
  valeur text not null default '',
  libelle text,
  updated_at timestamptz not null default now()
);
create trigger parametres_updated before update on public.parametres
  for each row execute function public.set_updated_at();

-- ─── Filières ───────────────────────────────────────────────────────────
create table public.filieres (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nom text not null,
  nom_court text,
  accroche text not null default '',
  description text not null default '',
  duree_licence text not null default '3 ans (à confirmer)',
  duree_master text not null default '2 ans (à confirmer)',
  debouches text[] not null default '{}',
  image_url text,
  icone text not null default 'building',
  programme_document_id uuid,
  ordre int not null default 0,
  publie boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger filieres_updated before update on public.filieres
  for each row execute function public.set_updated_at();

-- ─── Catégories & actualités ────────────────────────────────────────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nom text not null,
  ordre int not null default 0
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  titre text not null,
  extrait text not null default '',
  contenu text not null default '',
  image_url text,
  categorie_id uuid references public.categories (id) on delete set null,
  statut text not null default 'brouillon' check (statut in ('brouillon', 'publie')),
  publie_le timestamptz,
  auteur_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index articles_publies_idx on public.articles (statut, publie_le desc);
create trigger articles_updated before update on public.articles
  for each row execute function public.set_updated_at();

-- ─── Documents téléchargeables ──────────────────────────────────────────
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text,
  rubrique text not null default 'officiel'
    check (rubrique in ('officiel', 'programme', 'formulaire', 'autre')),
  filiere_id uuid references public.filieres (id) on delete set null,
  chemin_storage text,
  nom_fichier text,
  mime text,
  taille bigint,
  visible boolean not null default true,
  publie_le timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger documents_updated before update on public.documents
  for each row execute function public.set_updated_at();

alter table public.filieres
  add constraint filieres_programme_fk foreign key (programme_document_id)
  references public.documents (id) on delete set null;

-- ─── Galerie ────────────────────────────────────────────────────────────
create table public.galerie_photos (
  id uuid primary key default gen_random_uuid(),
  album text not null default 'Remise de diplômes',
  legende text not null default '',
  alt text not null default '',
  image_url text not null,
  ordre int not null default 0,
  publie boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── Équipe, partenaires, témoignages ──────────────────────────────────
create table public.equipe (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  fonction text not null,
  photo_url text,
  bio text,
  ordre int not null default 0,
  publie boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.partenaires (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  sigle text,
  type text not null check (type in ('academique', 'ong')),
  description text,
  logo_url text,
  site_url text check (site_url is null or site_url ~ '^https?://'),
  ordre int not null default 0,
  publie boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.temoignages (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  fonction text,
  texte text,
  photo_url text,
  ordre int not null default 0,
  publie boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── Formulaires publics ────────────────────────────────────────────────
create table public.preinscriptions (
  id uuid primary key default gen_random_uuid(),
  nom text not null check (char_length(nom) between 2 and 120),
  telephone text not null check (char_length(telephone) between 8 and 30),
  email text check (email is null or char_length(email) <= 200),
  filiere text not null,
  niveau text not null check (niveau in ('Licence', 'Master')),
  message text check (message is null or char_length(message) <= 2000),
  statut text not null default 'nouveau' check (statut in ('nouveau', 'traite')),
  ip_hash text,
  created_at timestamptz not null default now()
);
create index preinscriptions_ip_idx on public.preinscriptions (ip_hash, created_at desc);

create table public.messages_contact (
  id uuid primary key default gen_random_uuid(),
  nom text not null check (char_length(nom) between 2 and 120),
  email text not null check (char_length(email) <= 200),
  telephone text,
  sujet text,
  message text not null check (char_length(message) between 5 and 5000),
  statut text not null default 'nouveau' check (statut in ('nouveau', 'traite')),
  ip_hash text,
  created_at timestamptz not null default now()
);
create index messages_contact_ip_idx on public.messages_contact (ip_hash, created_at desc);

-- ════════════════════════════════════════════════════════════════════════
-- Row Level Security
-- Lecture publique des contenus publiés ; écriture réservée au personnel.
-- Les formulaires publics passent par le serveur (clé service_role).
-- ════════════════════════════════════════════════════════════════════════
alter table public.profils enable row level security;
alter table public.parametres enable row level security;
alter table public.filieres enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.documents enable row level security;
alter table public.galerie_photos enable row level security;
alter table public.equipe enable row level security;
alter table public.partenaires enable row level security;
alter table public.temoignages enable row level security;
alter table public.preinscriptions enable row level security;
alter table public.messages_contact enable row level security;

-- Profils : chacun lit le sien ; l'admin gère tout.
create policy "profils_lecture" on public.profils for select
  using (id = auth.uid() or public.is_admin());
create policy "profils_admin" on public.profils for all
  using (public.is_admin()) with check (public.is_admin());

-- Paramètres : lecture publique, écriture admin.
create policy "parametres_lecture" on public.parametres for select using (true);
create policy "parametres_admin" on public.parametres for all
  using (public.is_admin()) with check (public.is_admin());

-- Contenus réservés à l'admin (filières, équipe, partenaires, témoignages, catégories).
create policy "filieres_lecture" on public.filieres for select using (publie or public.is_staff());
create policy "filieres_admin" on public.filieres for all
  using (public.is_admin()) with check (public.is_admin());

create policy "categories_lecture" on public.categories for select using (true);
create policy "categories_admin" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "equipe_lecture" on public.equipe for select using (publie or public.is_staff());
create policy "equipe_admin" on public.equipe for all
  using (public.is_admin()) with check (public.is_admin());

create policy "partenaires_lecture" on public.partenaires for select using (publie or public.is_staff());
create policy "partenaires_admin" on public.partenaires for all
  using (public.is_admin()) with check (public.is_admin());

create policy "temoignages_lecture" on public.temoignages for select using (publie or public.is_staff());
create policy "temoignages_admin" on public.temoignages for all
  using (public.is_admin()) with check (public.is_admin());

-- Contenus éditoriaux (admin + éditeur) : actualités, documents, galerie.
create policy "articles_lecture" on public.articles for select
  using ((statut = 'publie' and publie_le <= now()) or public.is_staff());
create policy "articles_staff" on public.articles for all
  using (public.is_staff()) with check (public.is_staff());

create policy "documents_lecture" on public.documents for select using (visible or public.is_staff());
create policy "documents_staff" on public.documents for all
  using (public.is_staff()) with check (public.is_staff());

create policy "galerie_lecture" on public.galerie_photos for select using (publie or public.is_staff());
create policy "galerie_staff" on public.galerie_photos for all
  using (public.is_staff()) with check (public.is_staff());

-- Formulaires : aucun accès anonyme ; réservés à l'admin (l'éditeur n'y a pas accès).
create policy "preinscriptions_admin" on public.preinscriptions for all
  using (public.is_admin()) with check (public.is_admin());
create policy "messages_admin" on public.messages_contact for all
  using (public.is_admin()) with check (public.is_admin());

-- ════════════════════════════════════════════════════════════════════════
-- Storage
--   media     : images publiques (actualités, galerie, filières, équipe…)
--   documents : fichiers téléchargeables, privés, servis par URL signée
-- ════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('documents', 'documents', false, 20971520,
    array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "media_lecture" on storage.objects for select
  using (bucket_id = 'media');
create policy "media_staff_ajout" on storage.objects for insert
  with check (bucket_id = 'media' and public.is_staff());
create policy "media_staff_maj" on storage.objects for update
  using (bucket_id = 'media' and public.is_staff());
create policy "media_staff_suppr" on storage.objects for delete
  using (bucket_id = 'media' and public.is_staff());

create policy "documents_staff_lecture" on storage.objects for select
  using (bucket_id = 'documents' and public.is_staff());
create policy "documents_staff_ajout" on storage.objects for insert
  with check (bucket_id = 'documents' and public.is_staff());
create policy "documents_staff_maj" on storage.objects for update
  using (bucket_id = 'documents' and public.is_staff());
create policy "documents_staff_suppr" on storage.objects for delete
  using (bucket_id = 'documents' and public.is_staff());
