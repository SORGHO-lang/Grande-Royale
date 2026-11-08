// Doublage IA — serveur Express
// Transforme la voix off d'une vidéo en plusieurs langues via l'API Dubbing d'ElevenLabs
// (transcription, traduction, clonage de la voix d'origine, synchronisation, remixage avec le fond sonore).

import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Chargement minimal d'un fichier .env (sans dépendance)
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const API = 'https://api.elevenlabs.io/v1';
const PORT = Number(process.env.PORT) || 3000;
const DEMO = process.env.DEMO === '1';
const SERVER_KEY = process.env.ELEVENLABS_API_KEY || '';

const uploadDir = path.join(os.tmpdir(), 'doublage-ia-uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir, limits: { fileSize: 1024 * 1024 * 1024 } }); // 1 Go

export const LANGUAGES = {
  en: 'Anglais', fr: 'Français', es: 'Espagnol', de: 'Allemand', it: 'Italien', pt: 'Portugais',
  ar: 'Arabe', zh: 'Chinois', ja: 'Japonais', ko: 'Coréen', hi: 'Hindi', ru: 'Russe',
  tr: 'Turc', nl: 'Néerlandais', pl: 'Polonais', sv: 'Suédois', id: 'Indonésien', fil: 'Filipino',
  ms: 'Malais', ro: 'Roumain', uk: 'Ukrainien', el: 'Grec', cs: 'Tchèque', da: 'Danois',
  fi: 'Finnois', bg: 'Bulgare', hr: 'Croate', sk: 'Slovaque', ta: 'Tamoul', vi: 'Vietnamien',
  hu: 'Hongrois', no: 'Norvégien',
};

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// La clé peut venir du serveur (.env) ou de l'utilisateur : elle est alors gardée dans un cookie
// httpOnly de son navigateur (jamais stockée côté serveur), ce qui permet aussi aux balises <video> de lire les fichiers.
function cookie(req, name) {
  const m = (req.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}
function apiKey(req) {
  return SERVER_KEY || cookie(req, 'xi_key');
}

app.post('/api/key', (req, res) => {
  const key = String(req.body?.key || '').trim();
  const opts = { httpOnly: true, sameSite: 'strict', secure: req.secure, path: '/' };
  if (key) res.cookie('xi_key', key, { ...opts, maxAge: 1000 * 60 * 60 * 24 * 180 });
  else res.clearCookie('xi_key', opts);
  res.json({ ok: true, hasKey: Boolean(key) });
});

async function elevenlabs(req, url, init = {}) {
  const key = apiKey(req);
  if (!key) {
    const err = new Error("Aucune clé API ElevenLabs configurée. Ajoutez-la dans les paramètres ou dans le fichier .env.");
    err.status = 401;
    throw err;
  }
  const res = await fetch(API + url, { ...init, headers: { ...(init.headers || {}), 'xi-api-key': key } });
  if (!res.ok) {
    let detail = await res.text();
    try {
      const j = JSON.parse(detail);
      detail = j.detail?.message || j.detail?.status || (typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail ?? j));
    } catch { /* texte brut */ }
    const err = new Error(`ElevenLabs (${res.status}) : ${detail}`);
    err.status = res.status;
    throw err;
  }
  return res;
}

app.get('/api/config', (req, res) => {
  res.json({ demo: DEMO, serverKey: Boolean(SERVER_KEY), userKey: Boolean(cookie(req, 'xi_key')), languages: LANGUAGES });
});

// ---- Mode démo : simule le doublage sans appeler d'API ----
const demoJobs = new Map();

// Crée un doublage par langue cible.
app.post('/api/dub', upload.single('video'), async (req, res) => {
  const file = req.file;
  try {
    const targets = String(req.body.targets || '').split(',').map((s) => s.trim()).filter((l) => l in LANGUAGES);
    const sourceUrl = String(req.body.sourceUrl || '').trim();
    if (!targets.length) return res.status(400).json({ error: 'Choisissez au moins une langue cible.' });
    if (!file && !sourceUrl) return res.status(400).json({ error: 'Ajoutez une vidéo ou un lien.' });
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) return res.status(400).json({ error: 'Lien invalide.' });

    const name = (req.body.name || file?.originalname || sourceUrl).slice(0, 120);
    const source = req.body.source && (req.body.source === 'auto' || req.body.source in LANGUAGES) ? req.body.source : 'auto';
    const speakers = Math.max(0, Math.min(32, parseInt(req.body.speakers, 10) || 0));

    if (DEMO) {
      const jobs = targets.map((lang) => {
        const id = 'demo_' + Math.random().toString(36).slice(2, 10);
        const keep = file ? path.join(uploadDir, id + path.extname(file.originalname || '.mp4')) : null;
        if (file) fs.copyFileSync(file.path, keep);
        demoJobs.set(id, { start: Date.now(), file: keep, mime: file?.mimetype || 'video/mp4', lang, name });
        return { id, lang, name, expected: 8 };
      });
      return res.json({ jobs });
    }

    const blob = file ? await fs.openAsBlob(file.path, { type: file.mimetype || 'video/mp4' }) : null;
    const jobs = [];
    for (const lang of targets) {
      const fd = new FormData();
      if (blob) fd.append('file', blob, file.originalname || 'video.mp4');
      else fd.append('source_url', sourceUrl);
      fd.append('name', `${name} — ${LANGUAGES[lang]}`);
      fd.append('source_lang', source);
      fd.append('target_lang', lang);
      fd.append('num_speakers', String(speakers));
      fd.append('watermark', 'false');
      fd.append('highest_resolution', 'true');
      fd.append('drop_background_audio', req.body.dropBackground === 'true' ? 'true' : 'false');
      fd.append('disable_voice_cloning', req.body.cloneVoice === 'false' ? 'true' : 'false');
      fd.append('use_profanity_filter', 'false');
      const r = await elevenlabs(req, '/dubbing', { method: 'POST', body: fd });
      const data = await r.json();
      jobs.push({ id: data.dubbing_id, lang, name, expected: data.expected_duration_sec });
    }
    res.json({ jobs });
  } catch (e) {
    res.status(e.status && e.status < 600 ? e.status : 500).json({ error: e.message });
  } finally {
    if (file) fs.rm(file.path, { force: true }, () => {});
  }
});

// Statut d'un doublage
app.get('/api/dub/:id', async (req, res) => {
  try {
    if (DEMO) {
      const j = demoJobs.get(req.params.id);
      if (!j) return res.status(404).json({ error: 'Doublage introuvable.' });
      const done = Date.now() - j.start > 8000;
      return res.json({ status: done ? 'dubbed' : 'dubbing', error: null });
    }
    const r = await elevenlabs(req, `/dubbing/${encodeURIComponent(req.params.id)}`);
    const d = await r.json();
    res.json({ status: d.status, error: d.error || null, targets: d.target_languages });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// Vidéo / audio doublé (le Range est relayé pour pouvoir avancer dans la vidéo)
app.get('/api/dub/:id/media/:lang', async (req, res) => {
  const download = req.query.download === '1';
  try {
    if (DEMO) {
      const j = demoJobs.get(req.params.id);
      if (!j?.file) return res.status(404).json({ error: 'Pas de fichier en mode démo (lien utilisé).' });
      if (download) res.attachment(`${j.name}-${req.params.lang}${path.extname(j.file)}`);
      return res.sendFile(j.file);
    }
    const headers = req.get('range') ? { Range: req.get('range') } : {};
    const r = await elevenlabs(req, `/dubbing/${encodeURIComponent(req.params.id)}/audio/${encodeURIComponent(req.params.lang)}`, { headers });
    res.status(r.status);
    for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges']) {
      const v = r.headers.get(h);
      if (v) res.set(h, v);
    }
    if (download) {
      const ext = (r.headers.get('content-type') || '').includes('audio') ? 'mp3' : 'mp4';
      res.attachment(`doublage-${req.params.lang}.${ext}`);
    }
    Readable.fromWeb(r.body).pipe(res);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// Sous-titres traduits (SRT ou WebVTT)
app.get('/api/dub/:id/subtitles/:lang', async (req, res) => {
  const format = req.query.format === 'webvtt' ? 'webvtt' : 'srt';
  try {
    if (DEMO) {
      const body = format === 'webvtt'
        ? 'WEBVTT\n\n00:00:00.000 --> 00:00:04.000\n[Démo] Sous-titres traduits\n'
        : '1\n00:00:00,000 --> 00:00:04,000\n[Démo] Sous-titres traduits\n';
      res.type(format === 'webvtt' ? 'text/vtt' : 'text/plain');
      if (req.query.download === '1') res.attachment(`sous-titres-${req.params.lang}.${format === 'webvtt' ? 'vtt' : 'srt'}`);
      return res.send(body);
    }
    const r = await elevenlabs(req, `/dubbing/${encodeURIComponent(req.params.id)}/transcript/${encodeURIComponent(req.params.lang)}?format_type=${format}`);
    const text = await r.text();
    res.type(format === 'webvtt' ? 'text/vtt' : 'text/plain; charset=utf-8');
    if (req.query.download === '1') res.attachment(`sous-titres-${req.params.lang}.${format === 'webvtt' ? 'vtt' : 'srt'}`);
    res.send(text);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.use((err, _req, res, _next) => {
  const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop lourd (1 Go maximum).' : err.message;
  res.status(err.status || 400).json({ error: msg });
});

app.listen(PORT, () => {
  console.log(`Doublage IA prêt sur http://localhost:${PORT}${DEMO ? '  (mode démo)' : ''}`);
  if (!SERVER_KEY && !DEMO) console.log('Astuce : ajoutez ELEVENLABS_API_KEY dans .env, ou saisissez la clé dans le site.');
});
