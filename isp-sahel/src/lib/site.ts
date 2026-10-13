/** Identité officielle de l'ISP SAHEL (données fixes, non éditables). */
export const SITE = {
  nom: "Institut Supérieur Privé du Sahel",
  sigle: "ISP SAHEL",
  slogan: "Savoirs · Élites · Territoires · Avenir",
  devise: "Sayansi-Elimu-Teknolojia",
  mentionCle: "Diplômes reconnus par l'État",
  presentation:
    "L'ISP SAHEL est une école supérieure reconnue par l'État qui offre des formations de haute qualité en Génie civil, Réseaux et Télécommunications et en Ingénierie des Systèmes Informatiques de niveau LICENCE et MASTER.",
  accroche:
    "Génie civil, informatique et réseaux : des formations de Licence et de Master pour construire votre avenir",
  anneeOuverture: 2010,
  ministere: "Ministère de l'Enseignement Supérieur et de l'Innovation",
  autorisation: "2009-001550/MESSRS/SG/DGERS/DERr",
  arrete: "2010/098/MESSRS/SG/DGERS/DEPr",
  fondateur: "Docteur OUALI Palamanga",
  ville: "Ouagadougou",
  quartier: "Dassasgho",
  pays: "Burkina Faso",
  // Coordonnées approximatives du quartier Dassasgho — à régler précisément.
  geo: { lat: 12.3745, lng: -1.4745 },
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://ispsahel.com").replace(/\/$/, ""),
  logo: "/brand/logo.png",
} as const;

export const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/institut", label: "L'institut" },
  { href: "/formations", label: "Formations" },
  { href: "/admission", label: "Admission" },
  { href: "/scolarite", label: "Scolarité" },
  { href: "/vie-etudiante", label: "Vie étudiante" },
  { href: "/partenaires", label: "Partenaires" },
  { href: "/galerie", label: "Galerie" },
  { href: "/actualites", label: "Actualités" },
  { href: "/documents", label: "Documents" },
  { href: "/contact", label: "Contact" },
] as const;

export const RUBRIQUES = {
  officiel: "Documents officiels",
  programme: "Programmes & curricula",
  formulaire: "Formulaires",
  autre: "Autres",
} as const;

export const NIVEAUX = ["Licence", "Master"] as const;
