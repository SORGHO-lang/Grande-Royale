import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "ISP SAHEL — Institut Supérieur Privé du Sahel — Diplômes reconnus par l'État";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public/brand/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 56, padding: 72, background: "linear-gradient(135deg, #0d2a6b, #14409a)", color: "white", fontFamily: "sans-serif" }}>
        <img src={logoSrc} width={300} height={300} alt="" style={{ borderRadius: 9999 }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignSelf: "flex-start", background: "#f5b800", color: "#0d2a6b", padding: "10px 24px", borderRadius: 9999, fontSize: 30, fontWeight: 700 }}>
            Diplômes reconnus par l&apos;État
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, marginTop: 28, lineHeight: 1.05 }}>ISP SAHEL</div>
          <div style={{ fontSize: 40, marginTop: 12 }}>Institut Supérieur Privé du Sahel</div>
          <div style={{ fontSize: 28, marginTop: 24, color: "#f5b800" }}>Licence & Master · Ouagadougou</div>
        </div>
      </div>
    ),
    size,
  );
}
