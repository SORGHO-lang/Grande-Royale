/** Génère un CSV (séparateur « ; » et BOM UTF-8 pour Excel en français). */
export function toCsv(rows: Record<string, unknown>[], columns: { key: string; label: string }[]): string {
  const cell = (v: unknown) => {
    let s = v === null || v === undefined ? "" : Array.isArray(v) ? v.join(", ") : String(v);
    // Neutralise les formules (injection CSV dans Excel).
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.map((c) => cell(c.label)).join(";"), ...rows.map((r) => columns.map((c) => cell(r[c.key])).join(";"))];
  return "﻿" + lines.join("\r\n") + "\r\n";
}
