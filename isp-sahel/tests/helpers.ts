import { getEntity } from "@/lib/admin/entities";
import type { Role } from "@/lib/types";

export function canAccessEntity(role: Role, key: string): boolean {
  return getEntity(key)?.roles.includes(role) ?? false;
}
