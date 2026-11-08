// Doublage IA — version 100 % HTML (aucun serveur nécessaire)
// Le navigateur appelle directement l'API Dubbing d'ElevenLabs avec la clé saisie par l'utilisateur.
// Ajoutez ?demo à l'adresse pour tester l'interface sans clé (doublage simulé).

const API = 'https://api.elevenlabs.io/v1';
const DEMO = new URLSearchParams(location.search).has('demo');
const LANGUAGES = {
  en: 'Anglais', fr: 'Français', es: 'Espagnol', de: 'Allemand', it: 'Italien', pt: 'Portugais',
  ar: 'Arabe', zh: 'Chinois', ja: 'Japonais', ko: 'Coréen', hi: 'Hindi', ru: 'Russe',
  tr: 'Turc', nl: 'Néerlandais', pl: 'Polonais', sv: 'Suédois', id: 'Indonésien', fil: 'Filipino',
  ms: 'Malais', ro: 'Roumain', uk: 'Ukrainien', el: 'Grec', cs: 'Tchèque', da: 'Danois',
  fi: 'Finnois', bg: 'Bulgare', hr: 'Croate', sk: 'Slovaque', ta: 'Tamoul', vi: 'Vietnamien',
  hu: 'Hongrois', no: 'Norvégien',
};
const POPULAR = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ar', 'zh', 'ja', 'ko', 'hi', 'ru', 'tr', 'nl'];

const $ = (s) => document.querySelector(s);
let mode = 'file';
let file = null;
const selected = new Set();
const demoJobs = new Map();

// ---------- Stockage local (clé + liste des doublages) ----------
const local = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage indisponible */ } },
};
const getKey = () => local.get('doublage-ia-key', '');
const store = {
  get: () => (DEMO ? [] : local.get('doublage-ia-jobs', [])),
  set: (v) => !DEMO && local.set('doublage-ia-jobs', v),
};

// ---------- Appels ElevenLabs ----------
async function readError(res) {
  let detail = await res.text();
  try {
    const j = JSON.parse(detail);
    detail = j.detail?.message || j.detail?.status || (typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail ?? j));
  } catch { /* texte brut */ }
  if (res.status === 401) {
    if (/permission/i.test(detail)) return `Votre clé n’a pas le droit d’utiliser le doublage. Sur ElevenLabs, modifiez la clé et activez l’accès « Dubbing ». (Détail : ${detail})`;
    return `Clé API refusée par ElevenLabs. Vérifiez-la dans ⚙ Clé API. (Détail : ${detail})`;
  }
  if (res.status === 402 || /quota|credit|subscription|plan/i.test(detail)) {
    return `Crédits ou abonnement ElevenLabs insuffisants pour ce doublage. (Détail : ${detail})`;
  }
  return `ElevenLabs (${res.status}) : ${detail}`;
}

async function eleven(path, init = {}) {
  let res;
  try {
    res = await fetch(API + path, { ...init, headers: { ...(init.headers || {}), 'xi-api-key': getKey() } });
  } catch {
    throw new Error('Impossible de joindre ElevenLabs depuis ce navigateur (connexion ou blocage CORS).');
  }
  if (!res.ok) throw new Error(await readError(res));
  return res;
}

// Envoi avec barre de progression (XHR)
function createDubbing(fd, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', API + '/dubbing');
    xhr.setRequestHeader('xi-api-key', getKey());
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = async () => {
      if (xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error('Réponse inattendue d’ElevenLabs.')); }
      } else {
        reject(new Error(await readError(new Response(xhr.responseText, { status: xhr.status }))));
      }
    };
    xhr.onerror = () => reject(new Error('Impossible de joindre ElevenLabs depuis ce navigateur (connexion ou blocage CORS).'));
    xhr.send(fd);
  });
}

// ---------- Initialisation ----------
function init() {
  if (DEMO) {
    const b = $('#demoBanner');
    b.textContent = 'Mode démo : aucune API n’est appelée, la vidéo d’origine est renvoyée pour tester l’interface.';
    b.hidden = false;
  }
  if (getKey()) $('#apiKey').placeholder = '•••••••• (clé enregistrée)';

  const codes = Object.keys(LANGUAGES);
  const ordered = [...POPULAR, ...codes.filter((c) => !POPULAR.includes(c)).sort((a, b) => LANGUAGES[a].localeCompare(LANGUAGES[b], 'fr'))];
  for (const c of ordered) {
    $('#source').add(new Option(LANGUAGES[c], c));
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.lang = c;
    b.setAttribute('aria-pressed', 'false');
    b.textContent = LANGUAGES[c];
    b.onclick = () => toggleLang(c, b);
    $('#langs').append(b);
  }
  for (const c of ['en', 'es']) toggleLang(c, $(`.chip[data-lang="${c}"]`));
  syncSource();

  store.get().forEach(renderJob);
  if (!DEMO && !getKey() && location.hash !== '#affiche') openSettings();
}

function toggleLang(c, btn) {
  if (!btn || btn.disabled) return;
  selected.has(c) ? selected.delete(c) : selected.add(c);
  btn.setAttribute('aria-pressed', String(selected.has(c)));
  $('#countSel').textContent = selected.size ? `· ${selected.size} sélectionnée${selected.size > 1 ? 's' : ''}` : '';
}

// Empêche de choisir la langue d'origine comme cible
function syncSource() {
  const src = $('#source').value;
  document.querySelectorAll('.chip').forEach((b) => {
    const same = b.dataset.lang === src;
    if (same && selected.has(src)) toggleLang(src, b);
    b.disabled = same;
  });
}
$('#source').onchange = syncSource;

// ---------- Onglets fichier / lien ----------
document.querySelectorAll('.tab').forEach((t) => (t.onclick = () => {
  mode = t.dataset.tab;
  document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === t));
  document.querySelectorAll('[data-pane]').forEach((p) => (p.hidden = p.dataset.pane !== mode));
}));

// ---------- Import de fichier ----------
const drop = $('#drop');
function setFile(f) {
  if (f && !/^(video|audio)\//.test(f.type) && !/\.(mp4|mov|webm|mkv|avi|mp3|wav|m4a)$/i.test(f.name)) {
    return showError('Ce fichier n’est pas une vidéo ou un audio.');
  }
  file = f || null;
  $('.drop-empty').hidden = !!file;
  $('.drop-file').hidden = !file;
  const v = $('#preview');
  if (v.src) URL.revokeObjectURL(v.src);
  if (file) {
    v.src = URL.createObjectURL(file);
    $('#fileName').textContent = file.name;
    $('#fileSize').textContent = (file.size / 1048576).toFixed(1) + ' Mo';
  } else {
    v.removeAttribute('src');
    $('#video').value = '';
  }
}
$('#video').onchange = (e) => setFile(e.target.files[0]);
$('#clearFile').onclick = (e) => { e.preventDefault(); setFile(null); };
['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => e.dataTransfer.files[0] && setFile(e.dataTransfer.files[0]));

// ---------- Paramètres (clé API) ----------
function openSettings() { $('#settings').showModal(); }
$('#settingsBtn').onclick = openSettings;
$('#saveKey').onclick = (e) => {
  e.preventDefault();
  // Nettoie les copier-coller : espaces, retours à la ligne, guillemets, « xi-api-key: »
  const key = $('#apiKey').value.replace(/^\s*(xi-api-key\s*:)?/i, '').replace(/["'\s]/g, '');
  local.set('doublage-ia-key', key);
  $('#apiKey').value = '';
  $('#apiKey').placeholder = key ? '•••••••• (clé enregistrée)' : 'sk_…';
  $('#settings').close();
};

// ---------- Envoi ----------
function showError(msg) {
  const el = $('#formError');
  el.textContent = msg || '';
  el.hidden = !msg;
}

$('#dubForm').onsubmit = async (e) => {
  e.preventDefault();
  showError('');
  const url = $('#sourceUrl').value.trim();
  if (mode === 'file' && !file) return showError('Ajoutez d’abord une vidéo.');
  if (mode === 'url' && !/^https?:\/\//i.test(url)) return showError('Collez un lien valide (https://…).');
  if (!selected.size) return showError('Choisissez au moins une langue.');
  if (!DEMO && !getKey()) { openSettings(); return showError('Ajoutez votre clé API ElevenLabs.'); }

  const name = (mode === 'file' ? file.name : url).slice(0, 120);
  const langs = [...selected];
  const btn = $('#submitBtn');
  btn.disabled = true;
  try {
    for (const [i, lang] of langs.entries()) {
      const label = `${LANGUAGES[lang]} (${i + 1}/${langs.length})`;
      const job = { lang, name, created: Date.now(), status: 'dubbing' };
      if (DEMO) {
        btn.textContent = `Envoi ${label}…`;
        await new Promise((r) => setTimeout(r, 400));
        job.id = 'demo_' + Math.random().toString(36).slice(2, 10);
        job.expected = 8;
        demoJobs.set(job.id, { start: Date.now(), src: file ? URL.createObjectURL(file) : '' });
      } else {
        const fd = new FormData();
        if (mode === 'file') fd.append('file', file, file.name);
        else fd.append('source_url', url);
        fd.append('name', `${name} — ${LANGUAGES[lang]}`);
        fd.append('source_lang', $('#source').value);
        fd.append('target_lang', lang);
        fd.append('num_speakers', $('#speakers').value);
        fd.append('watermark', 'false');
        fd.append('drop_background_audio', String(!$('#keepBg').checked));
        fd.append('disable_voice_cloning', String(!$('#cloneVoice').checked));
        // Compte gratuit : ElevenLabs exige le filigrane → on réessaie automatiquement avec.
        let data;
        for (let attempt = 0; ; attempt++) {
          try {
            data = await createDubbing(fd, (p) => (btn.textContent = `Envoi ${label}… ${Math.round(p * 100)} %`));
            break;
          } catch (err) {
            if (attempt < 2 && /watermark/i.test(err.message) && fd.get('watermark') === 'false') {
              fd.set('watermark', 'true');
              job.watermark = true;
            } else if (attempt < 2 && /resolution/i.test(err.message) && fd.has('highest_resolution')) {
              fd.delete('highest_resolution');
            } else throw err;
          }
        }
        job.id = data.dubbing_id;
        job.expected = data.expected_duration_sec;
      }
      store.set([job, ...store.get()]);
      renderJob(job);
    }
    $('#results').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Lancer le doublage';
  }
};

// ---------- Suivi des doublages ----------
function updateStored(id, patch) {
  store.set(store.get().map((j) => (j.id === id ? { ...j, ...patch } : j)));
}

function renderJob(job) {
  $('#results').hidden = false;
  const el = $('#jobTpl').content.firstElementChild.cloneNode(true);
  el.dataset.id = job.id;
  el.querySelector('.flag').textContent = job.lang;
  el.querySelector('.job-lang').textContent = LANGUAGES[job.lang] || job.lang;
  el.querySelector('.job-name').textContent = job.name;
  $('#jobs').prepend(el);
  if (job.status === 'dubbed') showDone(el, job);
  else if (job.status === 'failed') showFailed(el, job.error);
  else poll(el, job);
}

async function getStatus(id) {
  if (DEMO) return { status: Date.now() - demoJobs.get(id).start > 8000 ? 'dubbed' : 'dubbing' };
  return (await eleven(`/dubbing/${encodeURIComponent(id)}`)).json();
}

async function poll(el, job) {
  const badge = el.querySelector('.badge');
  const bar = el.querySelector('.bar i');
  const expected = Math.max(job.expected || 60, 10) * 1000;
  badge.textContent = 'Doublage en cours…';
  while (el.isConnected) {
    bar.style.width = Math.max(3, Math.min(0.95, (Date.now() - job.created) / expected) * 100) + '%';
    try {
      const s = await getStatus(job.id);
      if (s.status === 'dubbed') { updateStored(job.id, { status: 'dubbed' }); return showDone(el, job); }
      if (s.status === 'failed') { updateStored(job.id, { status: 'failed', error: s.error }); return showFailed(el, s.error); }
    } catch (err) {
      if (/\(404\)|\(401\)|refusée/.test(err.message)) { updateStored(job.id, { status: 'failed', error: err.message }); return showFailed(el, err.message); }
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
}

// La vidéo et les sous-titres demandent la clé : on les télécharge puis on les affiche localement.
async function showDone(el, job) {
  el.classList.add('done');
  const badge = el.querySelector('.badge');
  badge.textContent = 'Chargement…';
  const body = el.querySelector('.job-body');
  const id = encodeURIComponent(job.id);
  const lang = encodeURIComponent(job.lang);
  const base = (job.name || 'video').replace(/\.[^.]+$/, '').replace(/[^\w\- ]+/g, '').trim() || 'video';
  try {
    let videoUrl, ext = 'mp4', srt, vtt;
    if (DEMO) {
      videoUrl = demoJobs.get(job.id)?.src || '';
      srt = '1\n00:00:00,000 --> 00:00:04,000\n[Démo] Sous-titres traduits\n';
      vtt = 'WEBVTT\n\n00:00:00.000 --> 00:00:04.000\n[Démo] Sous-titres traduits\n';
    } else {
      const media = await (await eleven(`/dubbing/${id}/audio/${lang}`)).blob();
      if (media.type.includes('audio')) ext = 'mp3';
      videoUrl = URL.createObjectURL(media);
      [srt, vtt] = await Promise.all(['srt', 'webvtt'].map((f) =>
        eleven(`/dubbing/${id}/transcript/${lang}?format_type=${f}`).then((r) => r.text()).catch(() => '')));
    }
    const srtUrl = srt ? URL.createObjectURL(new Blob([srt], { type: 'text/plain' })) : '';
    const vttUrl = vtt ? URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' })) : '';
    body.innerHTML = `
      <video controls preload="metadata" playsinline src="${videoUrl}">
        ${vttUrl ? `<track kind="subtitles" srclang="${job.lang}" label="Sous-titres" src="${vttUrl}" />` : ''}
      </video>
      <div class="job-actions">
        <a class="ghost small" href="${videoUrl}" download="${base}-${job.lang}.${ext}">⬇ Vidéo doublée</a>
        ${srtUrl ? `<a class="ghost small" href="${srtUrl}" download="${base}-${job.lang}.srt">⬇ Sous-titres .srt</a>` : ''}
        <button class="ghost small" type="button" data-remove>Retirer</button>
      </div>
      ${job.watermark ? '<small class="note-dl">Compte ElevenLabs gratuit : la vidéo contient un filigrane. Il disparaît avec l’offre Starter.</small>' : ''}`;
    badge.textContent = 'Prêt ✓';
    badge.className = 'badge ok';
  } catch (err) {
    badge.textContent = 'Prêt ✓';
    badge.className = 'badge ok';
    body.innerHTML = '<p class="error"></p><div class="job-actions"><button class="ghost small" type="button" data-retry>Réessayer</button><button class="ghost small" type="button" data-remove>Retirer</button></div>';
    body.querySelector('.error').textContent = 'Doublage terminé, mais la vidéo n’a pas pu être chargée : ' + err.message;
    body.querySelector('[data-retry]').onclick = () => showDone(el, job);
  }
  body.querySelector('[data-remove]').onclick = () => removeJob(el, job.id);
}

function showFailed(el, msg) {
  el.classList.add('failed');
  const badge = el.querySelector('.badge');
  badge.textContent = 'Échec';
  badge.className = 'badge err';
  const body = el.querySelector('.job-body');
  body.innerHTML = '<p class="error"></p><div class="job-actions"><button class="ghost small" type="button" data-remove>Retirer</button></div>';
  body.querySelector('.error').textContent = msg || 'Le doublage a échoué.';
  body.querySelector('[data-remove]').onclick = () => removeJob(el, el.dataset.id);
}

function removeJob(el, id) {
  store.set(store.get().filter((j) => j.id !== id));
  el.remove();
  if (!$('#jobs').children.length) $('#results').hidden = true;
}

$('#clearAll').onclick = () => {
  if (!confirm('Effacer la liste des doublages ?')) return;
  store.set([]);
  $('#jobs').innerHTML = '';
  $('#results').hidden = true;
};

init();
