-- ════════════════════════════════════════════════════════════════════
-- ISP SAHEL — données de départ (généré par scripts/generate-seed.ts)
-- Ne pas modifier à la main : éditez src/lib/seed-data.ts puis npm run seed:sql
-- ════════════════════════════════════════════════════════════════════

insert into public.parametres (cle, valeur, libelle) values
  ('telephone_1', '+226 50 39 33 33', 'Téléphone principal'),
  ('telephone_2', '+226 07 33 33 37', 'Téléphone secondaire'),
  ('email', 'contact@ispsahel.com', 'E-mail de contact'),
  ('whatsapp', '22650393333', 'Numéro WhatsApp (format international sans +, ex. 22650393333)'),
  ('adresse', 'Ouagadougou, quartier Dassasgho', 'Adresse'),
  ('stat_etudiants', '1 712', 'Chiffre clé — nombre d''étudiants'),
  ('stat_depuis', '2010', 'Chiffre clé — année d''ouverture'),
  ('stat_diplomes', '5', 'Chiffre clé — nombre de diplômes'),
  ('stat_cycles', '2', 'Chiffre clé — nombre de cycles'),
  ('frais_licence', '350 000 F CFA', 'Frais de scolarité — Licence'),
  ('frais_master', '600 000 F CFA', 'Frais de scolarité — Master'),
  ('annee_academique', '2026-2027', 'Année académique en cours'),
  ('mot_dg', '', 'Mot du Directeur Général (un paragraphe par ligne ; vide = « à compléter »)'),
  ('calendrier_academique', 'À compléter | Ouverture des pré-inscriptions
À compléter | Dépôt des dossiers à la scolarité
À compléter | Rentrée académique 2026-2027
À compléter | Examens du premier semestre
À compléter | Examens du second semestre
À compléter | Soutenances et remise des diplômes', 'Calendrier académique (une ligne par étape : « Période | Événement »)'),
  ('pieces_dossier', 'Copie du diplôme (baccalauréat ou équivalent pour la Licence, Licence pour le Master)
Acte de naissance
Photos d''identité
Copie de la pièce d''identité', 'Pièces du dossier d''inscription (une pièce par ligne)')
on conflict (cle) do nothing;

insert into public.categories (id, slug, nom, ordre) values
  ('00000000-0000-4000-8000-000000000201', 'annonce', 'Annonce', 1),
  ('00000000-0000-4000-8000-000000000202', 'evenement', 'Événement', 2),
  ('00000000-0000-4000-8000-000000000203', 'recherche', 'Recherche', 3),
  ('00000000-0000-4000-8000-000000000204', 'vie-etudiante', 'Vie étudiante', 4)
on conflict (id) do nothing;

insert into public.filieres (id, slug, nom, nom_court, accroche, description, duree_licence, duree_master, debouches, image_url, icone, programme_document_id, ordre, publie) values
  ('00000000-0000-4000-8000-000000000101', 'genie-civil-btp', 'Génie civil – option BTP', 'Génie civil BTP', 'Concevoir, calculer et conduire les chantiers de demain.', 'Conception, calcul et conduite de chantiers de bâtiments et travaux publics.', '3 ans (à confirmer)', '2 ans (à confirmer)', array['Ingénieur / technicien BTP', 'Conducteur de travaux', 'Chef de chantier']::text[], '/filieres/genie-civil-btp.jpg', 'building', null, 1, true),
  ('00000000-0000-4000-8000-000000000102', 'genie-civil-geometre-topographie', 'Génie civil – option Géomètre Topographie', 'Géomètre Topographie', 'Mesurer, cartographier et implanter les ouvrages.', 'Relevés, topographie, cartographie et implantation d''ouvrages.', '3 ans (à confirmer)', '2 ans (à confirmer)', array['Géomètre', 'Topographe', 'Cabinet d''études', 'Cadastre']::text[], '/filieres/geometre-topographie.jpg', 'map', null, 2, true),
  ('00000000-0000-4000-8000-000000000103', 'ingenierie-des-systemes-informatiques', 'Ingénierie des Systèmes Informatiques (ISI)', 'ISI', 'Développer les logiciels et architectures de demain.', 'Développement logiciel, systèmes d''information et architectures informatiques.', '3 ans (à confirmer)', '2 ans (à confirmer)', array['Ingénieur logiciel', 'Architecte SI', 'Développeur']::text[], '/filieres/systemes-informatiques.jpg', 'code', null, 3, true),
  ('00000000-0000-4000-8000-000000000104', 'informatique-de-gestion', 'Informatique de Gestion', 'Informatique de Gestion', 'Mettre l''informatique au service de l''entreprise.', 'Outils informatiques de gestion, bases de données et progiciels d''entreprise.', '3 ans (à confirmer)', '2 ans (à confirmer)', array['Analyste', 'Gestionnaire de SI', 'Administrateur de bases de données']::text[], '/filieres/informatique-gestion.jpg', 'chart', null, 4, true),
  ('00000000-0000-4000-8000-000000000105', 'reseaux-informatiques-et-telecommunications', 'Réseaux Informatiques et Télécommunications', 'Réseaux & Télécoms', 'Connecter, sécuriser et faire grandir les infrastructures.', 'Administration réseaux, sécurité, télécoms et infrastructures.', '3 ans (à confirmer)', '2 ans (à confirmer)', array['Administrateur réseau', 'Ingénieur télécoms', 'Expert sécurité']::text[], '/filieres/reseaux-telecoms.jpg', 'network', null, 5, true)
on conflict (id) do nothing;

insert into public.documents (id, titre, description, rubrique, filiere_id, chemin_storage, nom_fichier, mime, taille, visible, publie_le) values
  ('00000000-0000-4000-8000-000000000301', 'Programme — Génie civil, option BTP', null, 'programme', '00000000-0000-4000-8000-000000000101', null, null, null, null, true, '2026-10-01T08:00:00Z'),
  ('00000000-0000-4000-8000-000000000302', 'Programme — Génie civil, option Géomètre Topographie', null, 'programme', '00000000-0000-4000-8000-000000000102', null, null, null, null, true, '2026-10-01T08:00:00Z'),
  ('00000000-0000-4000-8000-000000000303', 'Programme — Ingénierie des Systèmes Informatiques (ISI)', null, 'programme', '00000000-0000-4000-8000-000000000103', null, null, null, null, true, '2026-10-01T08:00:00Z'),
  ('00000000-0000-4000-8000-000000000304', 'Programme — Informatique de Gestion', null, 'programme', '00000000-0000-4000-8000-000000000104', null, null, null, null, true, '2026-10-01T08:00:00Z'),
  ('00000000-0000-4000-8000-000000000305', 'Programme — Réseaux Informatiques et Télécommunications', null, 'programme', '00000000-0000-4000-8000-000000000105', null, null, null, null, true, '2026-10-01T08:00:00Z'),
  ('00000000-0000-4000-8000-000000000311', 'Règlement intérieur', null, 'officiel', null, null, null, null, null, true, '2026-10-01T08:00:00Z'),
  ('00000000-0000-4000-8000-000000000312', 'Guide de l''étudiant', null, 'officiel', null, null, null, null, null, true, '2026-10-01T08:00:00Z'),
  ('00000000-0000-4000-8000-000000000313', 'Statuts de l''institut', null, 'officiel', null, null, null, null, null, true, '2026-10-01T08:00:00Z'),
  ('00000000-0000-4000-8000-000000000314', 'Calendrier académique 2026-2027', null, 'officiel', null, null, null, null, null, true, '2026-10-01T08:00:00Z'),
  ('00000000-0000-4000-8000-000000000321', 'Formulaire d''inscription', null, 'formulaire', null, null, null, null, null, true, '2026-10-01T08:00:00Z'),
  ('00000000-0000-4000-8000-000000000322', 'Demande d''attestation / relevé de notes', null, 'formulaire', null, null, null, null, null, true, '2026-10-01T08:00:00Z'),
  ('00000000-0000-4000-8000-000000000323', 'Dossier de candidature en Master', null, 'formulaire', null, null, null, null, null, true, '2026-10-01T08:00:00Z')
on conflict (id) do nothing;

update public.filieres set programme_document_id = '00000000-0000-4000-8000-000000000301' where id = '00000000-0000-4000-8000-000000000101' and programme_document_id is null;
update public.filieres set programme_document_id = '00000000-0000-4000-8000-000000000302' where id = '00000000-0000-4000-8000-000000000102' and programme_document_id is null;
update public.filieres set programme_document_id = '00000000-0000-4000-8000-000000000303' where id = '00000000-0000-4000-8000-000000000103' and programme_document_id is null;
update public.filieres set programme_document_id = '00000000-0000-4000-8000-000000000304' where id = '00000000-0000-4000-8000-000000000104' and programme_document_id is null;
update public.filieres set programme_document_id = '00000000-0000-4000-8000-000000000305' where id = '00000000-0000-4000-8000-000000000105' and programme_document_id is null;

insert into public.articles (id, slug, titre, extrait, contenu, image_url, categorie_id, statut, publie_le) values
  ('00000000-0000-4000-8000-000000000401', 'rentree-academique-2026-2027-inscriptions-ouvertes', 'Rentrée académique 2026-2027 — inscriptions ouvertes en Licence et en Master', 'Les inscriptions pour l''année académique 2026-2027 sont ouvertes dans nos 5 filières, en Licence et en Master.', '<p>L''ISP SAHEL ouvre les inscriptions pour l''année académique <strong>2026-2027</strong>, en <strong>Licence</strong> et en <strong>Master</strong>.</p><h2>Les filières ouvertes</h2><ul><li>Génie civil – option BTP</li><li>Génie civil – option Géomètre Topographie</li><li>Ingénierie des Systèmes Informatiques (ISI)</li><li>Informatique de Gestion</li><li>Réseaux Informatiques et Télécommunications</li></ul><h2>Frais de scolarité</h2><p>Licence : <strong>350 000 F CFA</strong> · Master : <strong>600 000 F CFA</strong>.</p><h2>Comment s''inscrire ?</h2><p>Remplissez le formulaire de pré-inscription en ligne, appelez-nous au <strong>+226 50 39 33 33</strong> / <strong>+226 07 33 33 37</strong> ou écrivez-nous sur WhatsApp. Notre scolarité vous rappelle pour la suite de votre dossier.</p>', '/gallery/ceremonie-02.jpg', '00000000-0000-4000-8000-000000000201', 'publie', '2026-10-01T08:00:00Z'),
  ('00000000-0000-4000-8000-000000000402', 'des-diplomes-reconnus-par-l-etat', 'Des diplômes reconnus par l''État', 'Ouvert en 2010 sous l''autorisation du Ministère de l''Enseignement Supérieur, l''ISP SAHEL délivre des diplômes reconnus par l''État.', '<p>L''ISP SAHEL est une école supérieure <strong>reconnue par l''État</strong>. L''établissement a ouvert ses portes en <strong>2010</strong> sous l''autorisation du Ministère de l''Enseignement Supérieur et de l''Innovation.</p><h2>Références officielles</h2><ul><li>Autorisation d''ouverture n° 2009-001550/MESSRS/SG/DGERS/DERr</li><li>Arrêté n° 2010/098/MESSRS/SG/DGERS/DEPr</li></ul><p>Aujourd''hui, l''institut accueille <strong>1 712 étudiants</strong> et propose <strong>5 diplômes</strong> de Licence et de Master en Génie civil, Réseaux et Télécommunications et Ingénierie des Systèmes Informatiques.</p>', '/gallery/ceremonie-01.jpg', '00000000-0000-4000-8000-000000000201', 'publie', '2026-09-15T08:00:00Z')
on conflict (id) do nothing;

insert into public.galerie_photos (id, album, legende, alt, image_url, ordre, publie) values
  ('00000000-0000-4000-8000-000000000501', 'Cérémonie de remise de diplômes', 'Photo de groupe devant la banderole de l''ISP SAHEL', 'Diplômés, encadrants et invités posent devant une banderole « Institut Supérieur Privé du Sahel — Licence, Master »', '/gallery/ceremonie-01.jpg', 1, true),
  ('00000000-0000-4000-8000-000000000502', 'Cérémonie de remise de diplômes', 'Remise d''un diplôme de Master professionnel', 'Un diplômé en toge bleue et étole jaune reçoit son diplôme de Master professionnel devant la bannière de l''ISP SAHEL', '/gallery/ceremonie-02.jpg', 2, true),
  ('00000000-0000-4000-8000-000000000503', 'Cérémonie de remise de diplômes', 'Remise de diplôme', 'Une représentante de l''institut remet son diplôme à un diplômé en toge bleue, devant une bannière de l''ISP SAHEL', '/gallery/ceremonie-03.jpg', 3, true),
  ('00000000-0000-4000-8000-000000000504', 'Cérémonie de remise de diplômes', 'Remise d''un diplôme de Licence en Génie civil', 'Un diplômé en toge bleue présente son diplôme de Licence en Génie civil aux côtés d''un aîné en boubou', '/gallery/ceremonie-04.jpg', 4, true),
  ('00000000-0000-4000-8000-000000000505', 'Cérémonie de remise de diplômes', 'Remise d''un diplôme de Licence en Génie civil', 'Une diplômée en toge bleue reçoit son diplôme de Licence en Génie civil devant la bannière de l''ISP SAHEL', '/gallery/ceremonie-05.jpg', 5, true),
  ('00000000-0000-4000-8000-000000000506', 'Cérémonie de remise de diplômes', 'Remise d''un diplôme de Licence en Génie civil', 'Un diplômé en toge bleue présente son diplôme de Licence en Génie civil aux côtés d''un aîné en boubou, devant une bannière de l''ISP SAHEL', '/gallery/ceremonie-06.jpg', 6, true),
  ('00000000-0000-4000-8000-000000000507', 'Cérémonie de remise de diplômes', 'Remise d''un diplôme de Licence professionnelle', 'Un représentant de l''institut en costume remet son diplôme à un jeune diplômé devant la bannière de l''ISP SAHEL', '/gallery/ceremonie-07.jpg', 7, true),
  ('00000000-0000-4000-8000-000000000508', 'Cérémonie de remise de diplômes', 'Remise d''un diplôme de Licence professionnelle', 'Un diplômé présente son diplôme de Licence professionnelle aux côtés d''un représentant de l''institut en costume', '/gallery/ceremonie-08.jpg', 8, true),
  ('00000000-0000-4000-8000-000000000509', 'Cérémonie de remise de diplômes', 'Remise d''un diplôme de Licence professionnelle', 'Une représentante de l''ISP SAHEL remet son diplôme de Licence professionnelle à une diplômée en toge bleue', '/gallery/ceremonie-09.jpg', 9, true),
  ('00000000-0000-4000-8000-000000000510', 'Cérémonie de remise de diplômes', 'Les diplômés réunis autour de la table d''honneur', 'Une rangée de diplômés en toge bleue et étole jaune assis autour d''une table décorée de fleurs', '/gallery/ceremonie-10.jpg', 10, true),
  ('00000000-0000-4000-8000-000000000511', 'Cérémonie de remise de diplômes', 'Les diplômés pendant la cérémonie', 'Une rangée de diplômés en toge bleue et étole jaune assis à une table pendant la cérémonie', '/gallery/ceremonie-11.jpg', 11, true),
  ('00000000-0000-4000-8000-000000000512', 'Cérémonie de remise de diplômes', 'Un diplômé souriant pendant la cérémonie', 'Un diplômé en toge bleue et étole jaune, souriant, assis dans la salle', '/gallery/ceremonie-12.jpg', 12, true),
  ('00000000-0000-4000-8000-000000000513', 'Cérémonie de remise de diplômes', 'Diplômé de la promotion, tout sourire', 'Un diplômé souriant en toge bleue et étole jaune, assis dans la salle', '/gallery/ceremonie-13.jpg', 13, true),
  ('00000000-0000-4000-8000-000000000514', 'Cérémonie de remise de diplômes', 'Deux diplômés de la promotion', 'Deux jeunes diplômés en toge bleue et étole jaune assis côte à côte', '/gallery/ceremonie-14.jpg', 14, true),
  ('00000000-0000-4000-8000-000000000515', 'Cérémonie de remise de diplômes', 'Diplômé de la promotion', 'Un diplômé barbu en toge bleue et étole jaune assis pendant la cérémonie', '/gallery/ceremonie-15.jpg', 15, true),
  ('00000000-0000-4000-8000-000000000516', 'Cérémonie de remise de diplômes', 'Diplômé de la promotion', 'Un diplômé portant des lunettes teintées, en toge bleue et étole jaune', '/gallery/ceremonie-16.jpg', 16, true),
  ('00000000-0000-4000-8000-000000000517', 'Cérémonie de remise de diplômes', 'Diplômé de la promotion', 'Un diplômé en toge bleue et étole jaune assis au premier rang', '/gallery/ceremonie-17.jpg', 17, true),
  ('00000000-0000-4000-8000-000000000518', 'Cérémonie de remise de diplômes', 'Diplômé de la promotion', 'Un diplômé barbu en toge bleue, le gland jaune de sa toque sur le côté', '/gallery/ceremonie-18.jpg', 18, true),
  ('00000000-0000-4000-8000-000000000519', 'Cérémonie de remise de diplômes', 'Diplômée de la promotion', 'Une diplômée en toge bleue et étole jaune assise pendant la cérémonie', '/gallery/ceremonie-19.jpg', 19, true),
  ('00000000-0000-4000-8000-000000000520', 'Cérémonie de remise de diplômes', 'Diplômé de la promotion', 'Un diplômé en toge bleue et étole jaune, d''autres diplômés derrière lui', '/gallery/ceremonie-20.jpg', 20, true),
  ('00000000-0000-4000-8000-000000000521', 'Cérémonie de remise de diplômes', 'Diplômé de la promotion', 'Un diplômé en toge bleue et étole jaune, le regard baissé, entouré d''autres diplômés', '/gallery/ceremonie-21.jpg', 21, true),
  ('00000000-0000-4000-8000-000000000522', 'Cérémonie de remise de diplômes', 'Diplômé de la promotion', 'Un diplômé en toge bleue et étole jaune, le gland jaune de sa toque devant le visage', '/gallery/ceremonie-22.jpg', 22, true),
  ('00000000-0000-4000-8000-000000000523', 'Cérémonie de remise de diplômes', 'Diplômé de la promotion', 'Un jeune diplômé à lunettes en toge bleue et étole jaune', '/gallery/ceremonie-23.jpg', 23, true),
  ('00000000-0000-4000-8000-000000000524', 'Cérémonie de remise de diplômes', 'Diplômé de la promotion', 'Un diplômé à lunettes en toge bleue assis dans la salle de cérémonie', '/gallery/ceremonie-24.jpg', 24, true),
  ('00000000-0000-4000-8000-000000000525', 'Cérémonie de remise de diplômes', 'Diplômé de la promotion', 'Un jeune diplômé en toge bleue et étole jaune assis au premier rang', '/gallery/ceremonie-25.jpg', 25, true),
  ('00000000-0000-4000-8000-000000000526', 'Cérémonie de remise de diplômes', 'Diplômé de la promotion', 'Un jeune diplômé en toge bleue et étole jaune pendant la cérémonie', '/gallery/ceremonie-26.jpg', 26, true)
on conflict (id) do nothing;

insert into public.equipe (id, nom, fonction, photo_url, bio, ordre, publie) values
  ('00000000-0000-4000-8000-000000000601', 'Dr OUALI Palamanga', 'Fondateur & Directeur Général', '/equipe/ouali-palamanga.jpg', null, 1, true),
  ('00000000-0000-4000-8000-000000000602', 'Dr OUEDRAOGO Lamini', 'Directeur académique', '/equipe/ouedraogo-lamini.jpg', null, 2, true),
  ('00000000-0000-4000-8000-000000000603', 'Dre Ange Patricia ILBOUDOU', 'Responsable de la filière Génie civil', null, null, 3, true),
  ('00000000-0000-4000-8000-000000000604', 'Dr Wilfred SAWADOGO', 'Responsable de la filière Informatique', null, null, 4, true)
on conflict (id) do nothing;

insert into public.partenaires (id, nom, sigle, type, description, logo_url, site_url, ordre, publie) values
  ('00000000-0000-4000-8000-000000000701', 'ISTM', 'ISTM', 'academique', null, null, null, 1, true),
  ('00000000-0000-4000-8000-000000000702', 'Université de Fada N''Gourma', null, 'academique', null, null, null, 2, true),
  ('00000000-0000-4000-8000-000000000703', 'Helen Keller International', 'HKI', 'ong', null, null, null, 3, true),
  ('00000000-0000-4000-8000-000000000704', 'Action contre la Faim', 'ACF', 'ong', null, null, null, 4, true),
  ('00000000-0000-4000-8000-000000000705', 'Catholic Relief Services', 'CRS', 'ong', null, null, null, 5, true)
on conflict (id) do nothing;

insert into public.temoignages (id, nom, fonction, texte, photo_url, ordre, publie) values
  ('00000000-0000-4000-8000-000000000801', 'LOMPO Ezekiel', null, null, null, 1, true),
  ('00000000-0000-4000-8000-000000000802', 'Georges Kabré', null, null, null, 2, true),
  ('00000000-0000-4000-8000-000000000803', 'SANOU Rosine', null, null, null, 3, true),
  ('00000000-0000-4000-8000-000000000804', 'Diallo Fadima', null, null, null, 4, true)
on conflict (id) do nothing;
