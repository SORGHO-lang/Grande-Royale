import { getStaff } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const EXPORTS = {
  preinscriptions: {
    table: "preinscriptions",
    columns: [
      { key: "created_at", label: "Date" },
      { key: "nom", label: "Nom" },
      { key: "telephone", label: "Téléphone" },
      { key: "email", label: "E-mail" },
      { key: "filiere", label: "Filière" },
      { key: "niveau", label: "Niveau" },
      { key: "message", label: "Message" },
      { key: "statut", label: "Statut" },
    ],
  },
  messages: {
    table: "messages_contact",
    columns: [
      { key: "created_at", label: "Date" },
      { key: "nom", label: "Nom" },
      { key: "email", label: "E-mail" },
      { key: "telephone", label: "Téléphone" },
      { key: "sujet", label: "Sujet" },
      { key: "message", label: "Message" },
      { key: "statut", label: "Statut" },
    ],
  },
} as const;

export async function GET(_req: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const conf = EXPORTS[type as keyof typeof EXPORTS];
  if (!conf) return new Response("Introuvable", { status: 404 });
  const staff = await getStaff();
  if (!staff || staff.role !== "admin") return new Response("Accès refusé", { status: 403 });

  const supabase = await createSessionClient();
  const { data, error } = await supabase.from(conf.table).select(conf.columns.map((c) => c.key).join(", ")).order("created_at", { ascending: false });
  if (error) return new Response("Erreur", { status: 500 });
  const csv = toCsv((data ?? []) as unknown as Record<string, unknown>[], [...conf.columns]);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
