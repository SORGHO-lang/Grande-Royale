import type { Role } from "../types";

/**
 * Configuration déclarative des modules CRUD de l'administration.
 * Un même moteur (liste + formulaire + actions serveur) gère toutes les entités.
 * Ce fichier ne contient que des données sérialisables (utilisable côté client).
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "select"
  | "relation"
  | "image"
  | "file"
  | "lines"
  | "datetime"
  | "slug"
  | "url";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  max?: number;
  help?: string;
  options?: { value: string; label: string }[];
  /** relation : table cible, colonne affichée, filtre éventuel */
  relation?: { table: string; label: string; filter?: [string, string] };
  /** slug : champ source */
  from?: string;
  /** image / file : sous-dossier de stockage */
  folder?: string;
  defaultValue?: string | number | boolean;
  /** largeur dans la grille du formulaire */
  full?: boolean;
};

export type EntityConfig = {
  key: string;
  table: string;
  label: string;
  singular: string;
  feminine?: boolean;
  icon: string;
  roles: Role[];
  titleField: string;
  orderBy: { column: string; ascending: boolean }[];
  columns: { name: string; label: string; kind?: "bool" | "date" | "image" | "badge" | "relation" }[];
  fields: Field[];
};

const ordre: Field = { name: "ordre", label: "Ordre d'affichage", type: "number", defaultValue: 0, help: "Les plus petits nombres s'affichent en premier." };
const publie: Field = { name: "publie", label: "Publié (visible sur le site)", type: "boolean", defaultValue: true };

export const ICONES_FILIERES = [
  { value: "building", label: "Bâtiment" },
  { value: "map", label: "Carte / topographie" },
  { value: "code", label: "Code" },
  { value: "chart", label: "Graphique / gestion" },
  { value: "network", label: "Réseau" },
  { value: "graduation", label: "Diplôme" },
  { value: "briefcase", label: "Mallette" },
  { value: "book", label: "Livre" },
];

export const ENTITIES: EntityConfig[] = [
  {
    key: "actualites",
    table: "articles",
    label: "Actualités",
    singular: "article",
    icon: "file",
    roles: ["admin", "editeur"],
    titleField: "titre",
    orderBy: [{ column: "created_at", ascending: false }],
    columns: [
      { name: "titre", label: "Titre" },
      { name: "statut", label: "Statut", kind: "badge" },
      { name: "publie_le", label: "Publication", kind: "date" },
    ],
    fields: [
      { name: "titre", label: "Titre", type: "text", required: true, max: 200, full: true },
      { name: "slug", label: "Adresse (slug)", type: "slug", from: "titre", max: 90, help: "Générée à partir du titre si laissée vide.", full: true },
      { name: "categorie_id", label: "Catégorie", type: "relation", relation: { table: "categories", label: "nom" } },
      {
        name: "statut",
        label: "Statut",
        type: "select",
        required: true,
        defaultValue: "brouillon",
        options: [
          { value: "brouillon", label: "Brouillon (non visible)" },
          { value: "publie", label: "Publié (visible par tous)" },
        ],
      },
      { name: "publie_le", label: "Date de publication", type: "datetime", help: "Laisser vide pour publier immédiatement." },
      { name: "image_url", label: "Image principale", type: "image", folder: "actualites" },
      { name: "extrait", label: "Extrait (résumé)", type: "textarea", required: true, max: 400, full: true },
      { name: "contenu", label: "Contenu", type: "richtext", full: true },
    ],
  },
  {
    key: "documents",
    table: "documents",
    label: "Documents",
    singular: "document",
    icon: "download",
    roles: ["admin", "editeur"],
    titleField: "titre",
    orderBy: [{ column: "rubrique", ascending: true }, { column: "titre", ascending: true }],
    columns: [
      { name: "titre", label: "Titre" },
      { name: "rubrique", label: "Rubrique", kind: "badge" },
      { name: "nom_fichier", label: "Fichier" },
      { name: "visible", label: "Visible", kind: "bool" },
    ],
    fields: [
      { name: "titre", label: "Titre", type: "text", required: true, max: 200, full: true },
      {
        name: "rubrique",
        label: "Rubrique",
        type: "select",
        required: true,
        defaultValue: "officiel",
        options: [
          { value: "officiel", label: "Documents officiels" },
          { value: "programme", label: "Programmes & curricula" },
          { value: "formulaire", label: "Formulaires" },
          { value: "autre", label: "Autres" },
        ],
      },
      { name: "filiere_id", label: "Filière liée", type: "relation", relation: { table: "filieres", label: "nom" } },
      { name: "chemin_storage", label: "Fichier", type: "file", folder: "documents", full: true },
      { name: "description", label: "Description", type: "textarea", max: 500, full: true },
      { name: "publie_le", label: "Date affichée", type: "datetime", help: "Laisser vide pour la date du jour." },
      { name: "visible", label: "Visible sur le site", type: "boolean", defaultValue: true },
    ],
  },
  {
    key: "galerie",
    table: "galerie_photos",
    label: "Galerie",
    singular: "photo",
    feminine: true,
    icon: "image",
    roles: ["admin", "editeur"],
    titleField: "legende",
    orderBy: [{ column: "album", ascending: true }, { column: "ordre", ascending: true }],
    columns: [
      { name: "image_url", label: "Photo", kind: "image" },
      { name: "legende", label: "Légende" },
      { name: "album", label: "Album", kind: "badge" },
      { name: "ordre", label: "Ordre" },
      { name: "publie", label: "Publiée", kind: "bool" },
    ],
    fields: [
      { name: "image_url", label: "Photo", type: "image", required: true, folder: "galerie", full: true },
      { name: "legende", label: "Légende", type: "text", max: 300, full: true },
      { name: "alt", label: "Description de l'image (accessibilité)", type: "text", required: true, max: 300, full: true, help: "Décrit ce que montre la photo, pour les personnes malvoyantes." },
      { name: "album", label: "Album", type: "text", required: true, max: 100, defaultValue: "Remise de diplômes" },
      ordre,
      publie,
    ],
  },
  {
    key: "filieres",
    table: "filieres",
    label: "Filières",
    singular: "filière",
    feminine: true,
    icon: "graduation",
    roles: ["admin"],
    titleField: "nom",
    orderBy: [{ column: "ordre", ascending: true }],
    columns: [
      { name: "image_url", label: "Image", kind: "image" },
      { name: "nom", label: "Nom" },
      { name: "ordre", label: "Ordre" },
      { name: "publie", label: "Publiée", kind: "bool" },
    ],
    fields: [
      { name: "nom", label: "Nom de la filière", type: "text", required: true, max: 200, full: true },
      { name: "slug", label: "Adresse (slug)", type: "slug", from: "nom", max: 90, full: true },
      { name: "nom_court", label: "Nom court", type: "text", max: 80 },
      { name: "icone", label: "Icône", type: "select", options: ICONES_FILIERES, defaultValue: "building" },
      { name: "accroche", label: "Phrase d'accroche", type: "text", max: 200, full: true },
      { name: "description", label: "Description", type: "textarea", required: true, max: 3000, full: true },
      { name: "duree_licence", label: "Durée Licence", type: "text", max: 60, defaultValue: "3 ans (à confirmer)" },
      { name: "duree_master", label: "Durée Master", type: "text", max: 60, defaultValue: "2 ans (à confirmer)" },
      { name: "debouches", label: "Débouchés (un par ligne)", type: "lines", full: true },
      { name: "image_url", label: "Photo d'illustration", type: "image", folder: "filieres", full: true },
      { name: "programme_document_id", label: "Programme PDF associé", type: "relation", relation: { table: "documents", label: "titre", filter: ["rubrique", "programme"] }, full: true, help: "Document de la rubrique « Programmes & curricula »." },
      ordre,
      publie,
    ],
  },
  {
    key: "equipe",
    table: "equipe",
    label: "Équipe",
    singular: "membre",
    icon: "users",
    roles: ["admin"],
    titleField: "nom",
    orderBy: [{ column: "ordre", ascending: true }],
    columns: [
      { name: "photo_url", label: "Photo", kind: "image" },
      { name: "nom", label: "Nom" },
      { name: "fonction", label: "Fonction" },
      { name: "publie", label: "Publié", kind: "bool" },
    ],
    fields: [
      { name: "nom", label: "Nom", type: "text", required: true, max: 120 },
      { name: "fonction", label: "Fonction", type: "text", required: true, max: 150 },
      { name: "photo_url", label: "Photo", type: "image", folder: "equipe", full: true },
      { name: "bio", label: "Biographie courte", type: "textarea", max: 1000, full: true },
      ordre,
      publie,
    ],
  },
  {
    key: "partenaires",
    table: "partenaires",
    label: "Partenaires",
    singular: "partenaire",
    icon: "briefcase",
    roles: ["admin"],
    titleField: "nom",
    orderBy: [{ column: "type", ascending: true }, { column: "ordre", ascending: true }],
    columns: [
      { name: "logo_url", label: "Logo", kind: "image" },
      { name: "nom", label: "Nom" },
      { name: "type", label: "Type", kind: "badge" },
      { name: "publie", label: "Publié", kind: "bool" },
    ],
    fields: [
      { name: "nom", label: "Nom", type: "text", required: true, max: 150 },
      { name: "sigle", label: "Sigle", type: "text", max: 20 },
      {
        name: "type",
        label: "Type",
        type: "select",
        required: true,
        defaultValue: "academique",
        options: [
          { value: "academique", label: "Partenaire académique" },
          { value: "ong", label: "ONG / organisation" },
        ],
      },
      { name: "site_url", label: "Site web", type: "url", max: 300 },
      { name: "logo_url", label: "Logo", type: "image", folder: "partenaires", full: true },
      { name: "description", label: "Description", type: "textarea", max: 500, full: true },
      ordre,
      publie,
    ],
  },
  {
    key: "temoignages",
    table: "temoignages",
    label: "Témoignages",
    singular: "témoignage",
    icon: "quote",
    roles: ["admin"],
    titleField: "nom",
    orderBy: [{ column: "ordre", ascending: true }],
    columns: [
      { name: "photo_url", label: "Photo", kind: "image" },
      { name: "nom", label: "Nom" },
      { name: "fonction", label: "Fonction / promotion" },
      { name: "publie", label: "Publié", kind: "bool" },
    ],
    fields: [
      { name: "nom", label: "Nom", type: "text", required: true, max: 120 },
      { name: "fonction", label: "Fonction / promotion", type: "text", max: 150 },
      { name: "texte", label: "Témoignage", type: "textarea", max: 1500, full: true, help: "Laisser vide : « Témoignage à venir » s'affiche sur le site." },
      { name: "photo_url", label: "Photo", type: "image", folder: "temoignages", full: true },
      ordre,
      publie,
    ],
  },
  {
    key: "categories",
    table: "categories",
    label: "Catégories",
    singular: "catégorie",
    feminine: true,
    icon: "book",
    roles: ["admin"],
    titleField: "nom",
    orderBy: [{ column: "ordre", ascending: true }],
    columns: [
      { name: "nom", label: "Nom" },
      { name: "slug", label: "Slug" },
      { name: "ordre", label: "Ordre" },
    ],
    fields: [
      { name: "nom", label: "Nom", type: "text", required: true, max: 60 },
      { name: "slug", label: "Slug", type: "slug", from: "nom", max: 60 },
      ordre,
    ],
  },
];

export function getEntity(key: string): EntityConfig | undefined {
  return ENTITIES.find((e) => e.key === key);
}

export const BADGE_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  publie: "Publié",
  officiel: "Officiel",
  programme: "Programme",
  formulaire: "Formulaire",
  autre: "Autre",
  academique: "Académique",
  ong: "ONG",
};
