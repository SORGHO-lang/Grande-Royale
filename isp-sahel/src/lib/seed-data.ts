/**
 * Données de départ de l'ISP SAHEL.
 *
 * Elles servent à deux choses :
 *  1. générer `supabase/seed.sql` (npm run seed:sql) ;
 *  2. alimenter le site en « mode démo » quand Supabase n'est pas configuré.
 *
 * Règle : aucune information inventée. Tout ce qui n'a pas été fourni par
 * l'établissement est vide ou marqué « à compléter » / « à confirmer ».
 */
import type {
  Article,
  Categorie,
  DocumentItem,
  Filiere,
  GaleriePhoto,
  MembreEquipe,
  Parametres,
  Partenaire,
  Temoignage,
} from "./types";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const SEED_PARAMETRES: Parametres = {
  telephone_1: "+226 50 39 33 33",
  telephone_2: "+226 07 33 33 37",
  email: "contact@ispsahel.com",
  whatsapp: "22650393333",
  adresse: "Ouagadougou, quartier Dassasgho",
  stat_etudiants: "1 712",
  stat_depuis: "2010",
  stat_diplomes: "5",
  stat_cycles: "2",
  frais_licence: "350 000 F CFA",
  frais_master: "600 000 F CFA",
  annee_academique: "2026-2027",
  mot_dg: "",
  calendrier_academique: [
    "À compléter | Ouverture des pré-inscriptions",
    "À compléter | Dépôt des dossiers à la scolarité",
    "À compléter | Rentrée académique 2026-2027",
    "À compléter | Examens du premier semestre",
    "À compléter | Examens du second semestre",
    "À compléter | Soutenances et remise des diplômes",
  ].join("\n"),
  pieces_dossier: [
    "Copie du diplôme (baccalauréat ou équivalent pour la Licence, Licence pour le Master)",
    "Acte de naissance",
    "Photos d'identité",
    "Copie de la pièce d'identité",
  ].join("\n"),
};

export const PARAMETRES_LIBELLES: Record<string, string> = {
  telephone_1: "Téléphone principal",
  telephone_2: "Téléphone secondaire",
  email: "E-mail de contact",
  whatsapp: "Numéro WhatsApp (format international sans +, ex. 22650393333)",
  adresse: "Adresse",
  stat_etudiants: "Chiffre clé — nombre d'étudiants",
  stat_depuis: "Chiffre clé — année d'ouverture",
  stat_diplomes: "Chiffre clé — nombre de diplômes",
  stat_cycles: "Chiffre clé — nombre de cycles",
  frais_licence: "Frais de scolarité — Licence",
  frais_master: "Frais de scolarité — Master",
  annee_academique: "Année académique en cours",
  mot_dg: "Mot du Directeur Général (un paragraphe par ligne ; vide = « à compléter »)",
  calendrier_academique: "Calendrier académique (une ligne par étape : « Période | Événement »)",
  pieces_dossier: "Pièces du dossier d'inscription (une pièce par ligne)",
};

const DOC_PROG = {
  btp: id(301),
  topo: id(302),
  isi: id(303),
  ig: id(304),
  rit: id(305),
};

export const SEED_FILIERES: Filiere[] = [
  {
    id: id(101),
    slug: "genie-civil-btp",
    nom: "Génie civil – option BTP",
    nom_court: "Génie civil BTP",
    accroche: "Concevoir, calculer et conduire les chantiers de demain.",
    description:
      "Conception, calcul et conduite de chantiers de bâtiments et travaux publics.",
    duree_licence: "3 ans (à confirmer)",
    duree_master: "2 ans (à confirmer)",
    debouches: ["Ingénieur / technicien BTP", "Conducteur de travaux", "Chef de chantier"],
    image_url: "/filieres/genie-civil-btp.jpg",
    icone: "building",
    programme_document_id: DOC_PROG.btp,
    ordre: 1,
    publie: true,
  },
  {
    id: id(102),
    slug: "genie-civil-geometre-topographie",
    nom: "Génie civil – option Géomètre Topographie",
    nom_court: "Géomètre Topographie",
    accroche: "Mesurer, cartographier et implanter les ouvrages.",
    description: "Relevés, topographie, cartographie et implantation d'ouvrages.",
    duree_licence: "3 ans (à confirmer)",
    duree_master: "2 ans (à confirmer)",
    debouches: ["Géomètre", "Topographe", "Cabinet d'études", "Cadastre"],
    image_url: "/filieres/geometre-topographie.jpg",
    icone: "map",
    programme_document_id: DOC_PROG.topo,
    ordre: 2,
    publie: true,
  },
  {
    id: id(103),
    slug: "ingenierie-des-systemes-informatiques",
    nom: "Ingénierie des Systèmes Informatiques (ISI)",
    nom_court: "ISI",
    accroche: "Développer les logiciels et architectures de demain.",
    description:
      "Développement logiciel, systèmes d'information et architectures informatiques.",
    duree_licence: "3 ans (à confirmer)",
    duree_master: "2 ans (à confirmer)",
    debouches: ["Ingénieur logiciel", "Architecte SI", "Développeur"],
    image_url: "/filieres/systemes-informatiques.jpg",
    icone: "code",
    programme_document_id: DOC_PROG.isi,
    ordre: 3,
    publie: true,
  },
  {
    id: id(104),
    slug: "informatique-de-gestion",
    nom: "Informatique de Gestion",
    nom_court: "Informatique de Gestion",
    accroche: "Mettre l'informatique au service de l'entreprise.",
    description:
      "Outils informatiques de gestion, bases de données et progiciels d'entreprise.",
    duree_licence: "3 ans (à confirmer)",
    duree_master: "2 ans (à confirmer)",
    debouches: ["Analyste", "Gestionnaire de SI", "Administrateur de bases de données"],
    image_url: "/filieres/informatique-gestion.jpg",
    icone: "chart",
    programme_document_id: DOC_PROG.ig,
    ordre: 4,
    publie: true,
  },
  {
    id: id(105),
    slug: "reseaux-informatiques-et-telecommunications",
    nom: "Réseaux Informatiques et Télécommunications",
    nom_court: "Réseaux & Télécoms",
    accroche: "Connecter, sécuriser et faire grandir les infrastructures.",
    description:
      "Administration réseaux, sécurité, télécoms et infrastructures.",
    duree_licence: "3 ans (à confirmer)",
    duree_master: "2 ans (à confirmer)",
    debouches: ["Administrateur réseau", "Ingénieur télécoms", "Expert sécurité"],
    image_url: "/filieres/reseaux-telecoms.jpg",
    icone: "network",
    programme_document_id: DOC_PROG.rit,
    ordre: 5,
    publie: true,
  },
];

export const SEED_CATEGORIES: Categorie[] = [
  { id: id(201), slug: "annonce", nom: "Annonce", ordre: 1 },
  { id: id(202), slug: "evenement", nom: "Événement", ordre: 2 },
  { id: id(203), slug: "recherche", nom: "Recherche", ordre: 3 },
  { id: id(204), slug: "vie-etudiante", nom: "Vie étudiante", ordre: 4 },
];

const doc = (
  n: number,
  titre: string,
  rubrique: DocumentItem["rubrique"],
  filiere_id: string | null = null,
): DocumentItem => ({
  id: id(n),
  titre,
  description: null,
  rubrique,
  filiere_id,
  chemin_storage: null,
  nom_fichier: null,
  mime: null,
  taille: null,
  visible: true,
  publie_le: "2026-10-01T08:00:00Z",
});

export const SEED_DOCUMENTS: DocumentItem[] = [
  doc(301, "Programme — Génie civil, option BTP", "programme", id(101)),
  doc(302, "Programme — Génie civil, option Géomètre Topographie", "programme", id(102)),
  doc(303, "Programme — Ingénierie des Systèmes Informatiques (ISI)", "programme", id(103)),
  doc(304, "Programme — Informatique de Gestion", "programme", id(104)),
  doc(305, "Programme — Réseaux Informatiques et Télécommunications", "programme", id(105)),
  doc(311, "Règlement intérieur", "officiel"),
  doc(312, "Guide de l'étudiant", "officiel"),
  doc(313, "Statuts de l'institut", "officiel"),
  doc(314, "Calendrier académique 2026-2027", "officiel"),
  doc(321, "Formulaire d'inscription", "formulaire"),
  doc(322, "Demande d'attestation / relevé de notes", "formulaire"),
  doc(323, "Dossier de candidature en Master", "formulaire"),
];

export const SEED_ARTICLES: Article[] = [
  {
    id: id(401),
    slug: "rentree-academique-2026-2027-inscriptions-ouvertes",
    titre: "Rentrée académique 2026-2027 — inscriptions ouvertes en Licence et en Master",
    extrait:
      "Les inscriptions pour l'année académique 2026-2027 sont ouvertes dans nos 5 filières, en Licence et en Master.",
    contenu: [
      "<p>L'ISP SAHEL ouvre les inscriptions pour l'année académique <strong>2026-2027</strong>, en <strong>Licence</strong> et en <strong>Master</strong>.</p>",
      "<h2>Les filières ouvertes</h2>",
      "<ul><li>Génie civil – option BTP</li><li>Génie civil – option Géomètre Topographie</li><li>Ingénierie des Systèmes Informatiques (ISI)</li><li>Informatique de Gestion</li><li>Réseaux Informatiques et Télécommunications</li></ul>",
      "<h2>Frais de scolarité</h2>",
      "<p>Licence : <strong>350 000 F CFA</strong> · Master : <strong>600 000 F CFA</strong>.</p>",
      "<h2>Comment s'inscrire ?</h2>",
      "<p>Remplissez le formulaire de pré-inscription en ligne, appelez-nous au <strong>+226 50 39 33 33</strong> / <strong>+226 07 33 33 37</strong> ou écrivez-nous sur WhatsApp. Notre scolarité vous rappelle pour la suite de votre dossier.</p>",
    ].join(""),
    image_url: "/hero/diplomee.jpg",
    categorie_id: id(201),
    statut: "publie",
    publie_le: "2026-10-01T08:00:00Z",
  },
  {
    id: id(402),
    slug: "des-diplomes-reconnus-par-l-etat",
    titre: "Des diplômes reconnus par l'État",
    extrait:
      "Ouvert en 2010 sous l'autorisation du Ministère de l'Enseignement Supérieur, l'ISP SAHEL délivre des diplômes reconnus par l'État.",
    contenu: [
      "<p>L'ISP SAHEL est une école supérieure <strong>reconnue par l'État</strong>. L'établissement a ouvert ses portes en <strong>2010</strong> sous l'autorisation du Ministère de l'Enseignement Supérieur et de l'Innovation.</p>",
      "<h2>Références officielles</h2>",
      "<ul><li>Autorisation d'ouverture n° 2009-001550/MESSRS/SG/DGERS/DERr</li><li>Arrêté n° 2010/098/MESSRS/SG/DGERS/DEPr</li></ul>",
      "<p>Aujourd'hui, l'institut accueille <strong>1 712 étudiants</strong> et propose <strong>5 diplômes</strong> de Licence et de Master en Génie civil, Réseaux et Télécommunications et Ingénierie des Systèmes Informatiques.</p>",
    ].join(""),
    image_url: "/gallery/ceremonie-groupe.jpg",
    categorie_id: id(201),
    statut: "publie",
    publie_le: "2026-09-15T08:00:00Z",
  },
];

export const SEED_GALERIE: GaleriePhoto[] = [
  {
    id: id(501),
    album: "Remise de diplômes",
    legende: "Cérémonie de remise de diplômes Licence et Master — les diplômés devant la bannière de l'ISP SAHEL",
    alt: "Groupe de diplômés en toge bleue et étole jaune devant la bannière de l'ISP SAHEL",
    image_url: "/gallery/ceremonie-groupe.jpg",
    ordre: 1,
    publie: true,
  },
  {
    id: id(502),
    album: "Remise de diplômes",
    legende: "Remise de diplôme à une diplômée",
    alt: "Une diplômée en toge reçoit son diplôme lors de la cérémonie",
    image_url: "/gallery/remise-diplome.jpg",
    ordre: 2,
    publie: true,
  },
  {
    id: id(503),
    album: "Remise de diplômes",
    legende: "Les diplômés et leurs proches",
    alt: "Des diplômés en toge entourés de leurs proches après la cérémonie",
    image_url: "/gallery/diplomes-proches.jpg",
    ordre: 3,
    publie: true,
  },
];

export const SEED_EQUIPE: MembreEquipe[] = [
  { id: id(601), nom: "Dr OUALI Palamanga", fonction: "Fondateur & Directeur Général", photo_url: null, bio: null, ordre: 1, publie: true },
  { id: id(602), nom: "Dr OUEDRAOGO Lamini", fonction: "Directeur académique", photo_url: null, bio: null, ordre: 2, publie: true },
  { id: id(603), nom: "Dre Ange Patricia ILBOUDOU", fonction: "Responsable de la filière Génie civil", photo_url: null, bio: null, ordre: 3, publie: true },
  { id: id(604), nom: "Dr Wilfred SAWADOGO", fonction: "Responsable de la filière Informatique", photo_url: null, bio: null, ordre: 4, publie: true },
];

export const SEED_PARTENAIRES: Partenaire[] = [
  { id: id(701), nom: "ISTM", sigle: "ISTM", type: "academique", description: null, logo_url: null, site_url: null, ordre: 1, publie: true },
  { id: id(702), nom: "Université de Fada N'Gourma", sigle: null, type: "academique", description: null, logo_url: null, site_url: null, ordre: 2, publie: true },
  { id: id(703), nom: "Helen Keller International", sigle: "HKI", type: "ong", description: null, logo_url: null, site_url: null, ordre: 3, publie: true },
  { id: id(704), nom: "Action contre la Faim", sigle: "ACF", type: "ong", description: null, logo_url: null, site_url: null, ordre: 4, publie: true },
  { id: id(705), nom: "Catholic Relief Services", sigle: "CRS", type: "ong", description: null, logo_url: null, site_url: null, ordre: 5, publie: true },
];

export const SEED_TEMOIGNAGES: Temoignage[] = [
  { id: id(801), nom: "LOMPO Ezekiel", fonction: null, texte: null, photo_url: null, ordre: 1, publie: true },
  { id: id(802), nom: "Georges Kabré", fonction: null, texte: null, photo_url: null, ordre: 2, publie: true },
  { id: id(803), nom: "SANOU Rosine", fonction: null, texte: null, photo_url: null, ordre: 3, publie: true },
  { id: id(804), nom: "Diallo Fadima", fonction: null, texte: null, photo_url: null, ordre: 4, publie: true },
];
