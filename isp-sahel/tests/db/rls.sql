-- Tests RLS : chaque bloc lève une exception si le comportement est incorrect.
\set ON_ERROR_STOP on

insert into auth.users values
  ('11111111-1111-4111-8111-111111111111', 'admin@test'),
  ('22222222-2222-4222-8222-222222222222', 'editeur@test'),
  ('33333333-3333-4333-8333-333333333333', 'intrus@test');
insert into public.profils (id, nom, role) values
  ('11111111-1111-4111-8111-111111111111', 'Admin', 'admin'),
  ('22222222-2222-4222-8222-222222222222', 'Éditeur', 'editeur');
insert into public.articles (slug, titre, statut) values ('brouillon-secret', 'Brouillon', 'brouillon');
insert into public.preinscriptions (nom, telephone, filiere, niveau) values ('Test', '+22670000000', 'ISI', 'Licence');

-- ── Visiteur anonyme ───────────────────────────────────────────────────
set role anon;
do $$ begin
  if (select count(*) from public.filieres) <> 5 then raise exception 'anon : 5 filières attendues'; end if;
  if exists (select 1 from public.articles where statut = 'brouillon') then raise exception 'anon voit un brouillon'; end if;
  if (select count(*) from public.articles) <> 2 then raise exception 'anon : 2 articles publiés attendus'; end if;
  if exists (select 1 from public.preinscriptions) then raise exception 'anon lit les pré-inscriptions'; end if;
  begin
    insert into public.preinscriptions (nom, telephone, filiere, niveau) values ('Spam', '+22600000000', 'x', 'Licence');
    raise exception 'anon a pu insérer une pré-inscription';
  exception when insufficient_privilege then null; end;
  begin
    update public.parametres set valeur = 'pirate' where cle = 'email';
    if (select valeur from public.parametres where cle = 'email') = 'pirate' then raise exception 'anon a modifié un paramètre'; end if;
  end;
end $$;
reset role;

-- ── Éditeur : actualités/documents/galerie oui, filières/paramètres/formulaires non ─
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);
do $$ begin
  insert into public.articles (slug, titre, statut) values ('article-editeur', 'Article éditeur', 'publie');
  if not exists (select 1 from public.articles where slug = 'brouillon-secret') then raise exception 'éditeur ne voit pas les brouillons'; end if;
  insert into public.galerie_photos (image_url, alt) values ('/gallery/x.jpg', 'x');
  insert into public.documents (titre) values ('Doc éditeur');
  begin
    insert into public.filieres (slug, nom) values ('pirate', 'Pirate');
    raise exception 'éditeur a pu créer une filière';
  exception when insufficient_privilege then null; end;
  if exists (select 1 from public.preinscriptions) then raise exception 'éditeur lit les pré-inscriptions'; end if;
  update public.parametres set valeur = 'pirate' where cle = 'email';
  if (select valeur from public.parametres where cle = 'email') = 'pirate' then raise exception 'éditeur a modifié un paramètre'; end if;
  begin
    insert into storage.objects (bucket_id, name) values ('documents', 'documents/2026/10/abc-test.pdf');
  exception when insufficient_privilege then raise exception 'éditeur ne peut pas téléverser un document'; end;
end $$;

-- ── Utilisateur authentifié sans profil : aucun droit d'écriture ───────
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', false);
do $$ begin
  begin
    insert into public.articles (slug, titre) values ('intrus', 'Intrus');
    raise exception 'un compte sans profil a pu écrire';
  exception when insufficient_privilege then null; end;
  begin
    insert into storage.objects (bucket_id, name) values ('media', 'galerie/2026/10/abc-x.jpg');
    raise exception 'un compte sans profil a pu téléverser';
  exception when insufficient_privilege then null; end;
  if exists (select 1 from public.articles where statut = 'brouillon') then raise exception 'compte sans profil voit un brouillon'; end if;
end $$;

-- ── Admin : tout ───────────────────────────────────────────────────────
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);
do $$ begin
  update public.parametres set valeur = 'contact@ispsahel.com' where cle = 'email';
  insert into public.filieres (slug, nom, publie) values ('test-admin', 'Test admin', false);
  if (select count(*) from public.preinscriptions) <> 1 then raise exception 'admin ne lit pas les pré-inscriptions'; end if;
  update public.preinscriptions set statut = 'traite';
  if (select count(*) from public.profils) <> 2 then raise exception 'admin ne voit pas tous les profils'; end if;
end $$;
reset role;

select 'RLS : tous les tests sont passés ✓' as resultat;
