import "server-only";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/**
 * Envoie un e-mail de notification via l'API Resend.
 * Renvoie false (sans lever d'erreur) si l'envoi est impossible ou non configuré.
 */
export async function sendNotification(opts: { subject: string; rows: [string, string | undefined | null][]; replyTo?: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL || "contact@ispsahel.com";
  const from = process.env.EMAIL_FROM || "ISP SAHEL <site@ispsahel.com>";
  if (!key) {
    console.info(`[email] RESEND_API_KEY absente — notification non envoyée : ${opts.subject}`);
    return false;
  }
  const lignes = opts.rows.filter(([, v]) => v);
  const html = `<h2 style="font-family:sans-serif;color:#14409a">${escapeHtml(opts.subject)}</h2>
<table style="font-family:sans-serif;border-collapse:collapse">${lignes
    .map(([k, v]) => `<tr><th style="text-align:left;padding:6px 12px;background:#f3eee3;vertical-align:top">${escapeHtml(k)}</th><td style="padding:6px 12px;white-space:pre-wrap">${escapeHtml(String(v))}</td></tr>`)
    .join("")}</table>`;
  const text = lignes.map(([k, v]) => `${k} : ${v}`).join("\n");
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: opts.subject, html, text, reply_to: opts.replyTo }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[email] échec Resend :", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("[email] erreur :", err);
    return false;
  }
}
