import "server-only";
import type { EntityConfig } from "@/lib/admin/entities";
import { createSessionClient } from "@/lib/supabase/server";

/** Options des listes déroulantes « relation ». */
export async function loadRelations(config: EntityConfig) {
  const supabase = await createSessionClient();
  const out: Record<string, { value: string; label: string }[]> = {};
  for (const f of config.fields.filter((x) => x.type === "relation" && x.relation)) {
    const r = f.relation!;
    let q = supabase.from(r.table).select(`id, ${r.label}`).order(r.label);
    if (r.filter) q = q.eq(r.filter[0], r.filter[1]);
    const { data } = await q;
    out[f.name] = ((data ?? []) as unknown as Record<string, string>[]).map((row) => ({ value: row.id!, label: row[r.label]! }));
  }
  return out;
}
