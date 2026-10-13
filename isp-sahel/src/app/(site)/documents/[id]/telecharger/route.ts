import { NextResponse } from "next/server";
import { hasServiceRole } from "@/lib/supabase/config";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Redirige vers une URL signée (valable 5 min) du fichier, si le document est visible. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notFound = () => NextResponse.redirect(new URL("/documents?indisponible=1", request.url), 303);
  if (!UUID.test(id) || !hasServiceRole()) return notFound();

  const db = createServiceClient();
  const { data: doc } = await db.from("documents").select("chemin_storage, nom_fichier, visible").eq("id", id).maybeSingle();
  if (!doc?.visible || !doc.chemin_storage) return notFound();

  const { data, error } = await db.storage
    .from("documents")
    .createSignedUrl(doc.chemin_storage, 300, { download: doc.nom_fichier ?? true });
  if (error || !data) {
    console.error("[documents] URL signée :", error);
    return notFound();
  }
  return NextResponse.redirect(data.signedUrl, 302);
}
