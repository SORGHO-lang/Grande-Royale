export type Role = "admin" | "editeur";

export type Filiere = {
  id: string;
  slug: string;
  nom: string;
  nom_court: string | null;
  accroche: string;
  description: string;
  duree_licence: string;
  duree_master: string;
  debouches: string[];
  image_url: string | null;
  icone: string;
  programme_document_id: string | null;
  ordre: number;
  publie: boolean;
};

export type Categorie = { id: string; slug: string; nom: string; ordre: number };

export type Article = {
  id: string;
  slug: string;
  titre: string;
  extrait: string;
  contenu: string;
  image_url: string | null;
  categorie_id: string | null;
  statut: "brouillon" | "publie";
  publie_le: string | null;
  categorie?: Categorie | null;
};

export type Rubrique = "officiel" | "programme" | "formulaire" | "autre";

export type DocumentItem = {
  id: string;
  titre: string;
  description: string | null;
  rubrique: Rubrique;
  filiere_id: string | null;
  chemin_storage: string | null;
  nom_fichier: string | null;
  mime: string | null;
  taille: number | null;
  visible: boolean;
  publie_le: string;
};

export type GaleriePhoto = {
  id: string;
  album: string;
  legende: string;
  alt: string;
  image_url: string;
  ordre: number;
  publie: boolean;
};

export type MembreEquipe = {
  id: string;
  nom: string;
  fonction: string;
  photo_url: string | null;
  bio: string | null;
  ordre: number;
  publie: boolean;
};

export type Partenaire = {
  id: string;
  nom: string;
  sigle: string | null;
  type: "academique" | "ong";
  description: string | null;
  logo_url: string | null;
  site_url: string | null;
  ordre: number;
  publie: boolean;
};

export type Temoignage = {
  id: string;
  nom: string;
  fonction: string | null;
  texte: string | null;
  photo_url: string | null;
  ordre: number;
  publie: boolean;
};

export type Preinscription = {
  id: string;
  nom: string;
  telephone: string;
  email: string | null;
  filiere: string;
  niveau: "Licence" | "Master";
  message: string | null;
  statut: "nouveau" | "traite";
  created_at: string;
};

export type MessageContact = {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  sujet: string | null;
  message: string;
  statut: "nouveau" | "traite";
  created_at: string;
};

export type Parametres = Record<string, string>;
