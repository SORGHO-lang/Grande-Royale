// Doublage IA — logique de l'interface
const $ = (s) => document.querySelector(s);
const POPULAR = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ar', 'zh', 'ja', 'ko', 'hi', 'ru', 'tr', 'nl'];
const STORE = 'doublage-ia-jobs';
let config = { languages: {} };
let mode = 'file';
let file = null;
const selected = new Set();

const store = {
  get() { try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch { return []; } },
  set(v) { try { localStorage.setItem(STORE, JSON.stringify(v)); } catch { /* stockage indisponible */ } },
};

async function api(url, opts) {
  const r = await fetch(url, opts);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `Erreur ${r.status}`);
  return data;
}

// ---------- Initialisation ----------
async function init() {
  config = await api('/api/config');
  $('#demoBanner').hidden = !config.demo;
  $('#serverKeyNote').hidden = !config.serverKey;
  if (config.userKey) $('#apiKey').placeholder = '•••••••• (clé enregistrée)';

  const codes = Object.keys(config.languages);
  const ordered = [...POPULAR.filter((c) => codes.includes(c)), ...codes.filter((c) => !POPULAR.includes(c)).sort((a, b) => config.languages[a].localeCompare(config.languages[b], 'fr'))];
  for (const c of ordered) {
    $('#source').add(new Option(config.languages[c], c));
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.lang = c;
    b.setAttribute('aria-pressed', 'false');
    b.textContent = config.languages[c];
    b.onclick = () => toggleLang(c, b);
    $('#langs').append(b);
  }
  for (const c of ['en', 'es']) toggleLang(c, $(`.chip[data-lang="${c}"]`));
  syncSource();

  store.get().forEach(renderJob);

  if (!config.demo && !config.serverKey && !config.userKey) openSettings();
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
$('#saveKey').onclick = async (e) => {
  e.preventDefault();
  const key = $('#apiKey').value.trim();
  try {
    const r = await api('/api/key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
    config.userKey = r.hasKey;
    $('#apiKey').value = '';
    $('#apiKey').placeholder = r.hasKey ? '•••••••• (clé enregistrée)' : 'sk_…';
    $('#settings').close();
  } catch (err) { alert(err.message); }
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
  if (!config.demo && !config.serverKey && !config.userKey) { openSettings(); return showError('Ajoutez votre clé API ElevenLabs.'); }

  const fd = new FormData();
  if (mode === 'file') fd.append('video', file);
  else fd.append('sourceUrl', url);
  fd.append('targets', [...selected].join(','));
  fd.append('source', $('#source').value);
  fd.append('speakers', $('#speakers').value);
  fd.append('cloneVoice', String($('#cloneVoice').checked));
  fd.append('dropBackground', String(!$('#keepBg').checked));

  const btn = $('#submitBtn');
  btn.disabled = true;
  try {
    const { jobs } = await uploadWithProgress(fd, (p) => (btn.textContent = p < 1 ? `Envoi… ${Math.round(p * 100)} %` : 'Création des doublages…'));
    const now = Date.now();
    const list = jobs.map((j) => ({ ...j, created: now, status: 'dubbing' }));
    store.set([...list, ...store.get()]);
    list.reverse().forEach(renderJob);
    $('#results').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Lancer le doublage';
  }
};

function uploadWithProgress(fd, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/dub');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.upload.onload = () => onProgress(1);
    xhr.onload = () => {
      let data = {};
      try { data = JSON.parse(xhr.responseText); } catch { /* réponse vide */ }
      xhr.status < 300 ? resolve(data) : reject(new Error(data.error || `Erreur ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Connexion au serveur impossible.'));
    xhr.send(fd);
  });
}

// ---------- Suivi des doublages ----------
function updateStored(id, patch) {
  store.set(store.get().map((j) => (j.id === id ? { ...j, ...patch } : j)));
}

function renderJob(job) {
  $('#results').hidden = false;
  const el = $('#jobTpl').content.firstElementChild.cloneNode(true);
  el.dataset.id = job.id;
  el.querySelector('.flag').textContent = job.lang;
  el.querySelector('.job-lang').textContent = config.languages[job.lang] || job.lang;
  el.querySelector('.job-name').textContent = job.name;
  $('#jobs').prepend(el);
  if (job.status === 'dubbed') showDone(el, job);
  else if (job.status === 'failed') showFailed(el, job.error);
  else poll(el, job);
}

async function poll(el, job) {
  const badge = el.querySelector('.badge');
  const bar = el.querySelector('.bar i');
  const expected = Math.max(job.expected || 60, 10) * 1000;
  badge.textContent = 'Doublage en cours…';
  while (el.isConnected) {
    const p = Math.min(0.95, (Date.now() - job.created) / expected);
    bar.style.width = Math.max(3, p * 100) + '%';
    try {
      const s = await api(`/api/dub/${encodeURIComponent(job.id)}`);
      if (s.status === 'dubbed') { updateStored(job.id, { status: 'dubbed' }); return showDone(el, job); }
      if (s.status === 'failed') { updateStored(job.id, { status: 'failed', error: s.error }); return showFailed(el, s.error); }
    } catch (err) {
      if (/404|introuvable/i.test(err.message)) { updateStored(job.id, { status: 'failed', error: err.message }); return showFailed(el, err.message); }
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
}

function showDone(el, job) {
  el.classList.add('done');
  const badge = el.querySelector('.badge');
  badge.textContent = 'Prêt ✓';
  badge.className = 'badge ok';
  const base = `/api/dub/${encodeURIComponent(job.id)}`;
  const lang = encodeURIComponent(job.lang);
  el.querySelector('.job-body').innerHTML = `
    <video controls preload="metadata" playsinline src="${base}/media/${lang}">
      <track kind="subtitles" srclang="${job.lang}" label="Sous-titres" src="${base}/subtitles/${lang}?format=webvtt" />
    </video>
    <div class="job-actions">
      <a class="ghost small" href="${base}/media/${lang}?download=1">⬇ Vidéo doublée</a>
      <a class="ghost small" href="${base}/subtitles/${lang}?download=1">⬇ Sous-titres .srt</a>
      <button class="ghost small" type="button" data-remove>Retirer</button>
    </div>`;
  el.querySelector('[data-remove]').onclick = () => removeJob(el, job.id);
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

init().catch((e) => showError('Impossible de joindre le serveur : ' + e.message));
