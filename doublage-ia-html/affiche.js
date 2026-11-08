// Analyse d'affiche — décrit une affiche et identifie son public cible avec OpenAI.
// Le navigateur appelle directement l'API OpenAI (Responses API) avec la clé saisie par l'utilisateur
// (enregistrée uniquement dans ce navigateur). Ajoutez ?demo à l'adresse pour tester sans clé.
const API = 'https://api.openai.com/v1';
const KEY_STORE = 'doublage-ia-openai-key';
const MODEL_STORE = 'doublage-ia-openai-model';
const IS_DEMO = new URLSearchParams(location.search).has('demo');
const $ = (s) => document.querySelector(s);

function saved(name) {
  return {
    get() { try { return localStorage.getItem(name) || ''; } catch { return ''; } },
    set(v) { try { v ? localStorage.setItem(name, v) : localStorage.removeItem(name); } catch { /* stockage indisponible */ } },
  };
}
const store = saved(KEY_STORE);
const modelStore = saved(MODEL_STORE);

// ---------- Navigation entre les deux outils ----------
function showView() {
  const view = location.hash === '#affiche' ? 'affiche' : 'doublage';
  $('#view-doublage').hidden = view !== 'doublage';
  $('#view-affiche').hidden = view !== 'affiche';
  document.querySelectorAll('.view-link').forEach((a) => a.classList.toggle('active', a.dataset.view === view));
  $('#settingsBtn').textContent = view === 'affiche' ? '⚙ Clé OpenAI' : '⚙ Clé API';
  return view;
}
window.addEventListener('hashchange', showView);
const openElevenLabs = $('#settingsBtn').onclick;
$('#settingsBtn').onclick = () => (showView() === 'affiche' ? openAiSettings() : openElevenLabs());

// ---------- Clé et modèle OpenAI ----------
function openAiSettings() {
  $('#openaiKey').placeholder = store.get() ? '•••••••• (clé enregistrée)' : 'sk-…';
  $('#openaiModel').value = modelStore.get();
  $('#openaiSettings').showModal();
}
$('#saveOpenaiKey').onclick = (e) => {
  e.preventDefault();
  const key = $('#openaiKey').value.replace(/["'\s]/g, '');
  if (key) store.set(key);
  modelStore.set($('#openaiModel').value.trim());
  autoModel = null;
  $('#openaiKey').value = '';
  $('#openaiSettings').close();
};

// ---------- Choix de l'affiche ----------
let poster = null; // { data: base64 sans en-tête, mediaType }
const drop = $('#posterDrop');

function showError(msg) {
  const el = $('#posterError');
  el.textContent = msg || '';
  el.hidden = !msg;
}

// Réduit l'image (côté le plus long : 1568 px) pour un envoi rapide et sous la limite de 5 Mo.
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1568 / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      URL.revokeObjectURL(url);
      resolve({ dataUrl, data: dataUrl.split(',')[1], mediaType: 'image/jpeg' });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible. Essayez un fichier JPG ou PNG.')); };
    img.src = url;
  });
}

async function setPoster(file) {
  showError('');
  if (!file) {
    poster = null;
    $('#posterInput').value = '';
  } else if (!/^image\//.test(file.type)) {
    return showError('Ce fichier n’est pas une image. Choisissez un JPG, PNG ou WEBP.');
  } else {
    try {
      poster = await loadImage(file);
      $('#posterPreview').src = poster.dataUrl;
    } catch (err) {
      return showError(err.message);
    }
  }
  $('#posterEmpty').hidden = !!poster;
  $('#posterFile').hidden = !poster;
}
$('#posterInput').onchange = (e) => setPoster(e.target.files[0]);
$('#posterClear').onclick = (e) => { e.preventDefault(); setPoster(null); };
['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => e.dataTransfer.files[0] && setPoster(e.dataTransfer.files[0]));

// ---------- Format de la réponse ----------
const str = { type: 'string' };
const strList = { type: 'array', items: str };
const audience = {
  type: 'object',
  properties: { nom: str, profil: str, pourquoi: str },
  required: ['nom', 'profil', 'pourquoi'],
  additionalProperties: false,
};
const SCHEMA = {
  type: 'object',
  properties: {
    titre: str,
    type_affiche: str,
    description: str,
    message_principal: str,
    informations_cles: {
      type: 'array',
      items: { type: 'object', properties: { libelle: str, valeur: str }, required: ['libelle', 'valeur'], additionalProperties: false },
    },
    elements_visuels: strList,
    ton: str,
    public_cible: {
      type: 'object',
      properties: {
        resume: str,
        principal: audience,
        secondaires: { type: 'array', items: audience },
        tranche_age: str,
        centres_interet: strList,
        zone_geographique: str,
      },
      required: ['resume', 'principal', 'secondaires', 'tranche_age', 'centres_interet', 'zone_geographique'],
      additionalProperties: false,
    },
    conseils: strList,
    public_vise: {
      type: 'object',
      properties: { verdict: str, points_forts: strList, a_ameliorer: strList },
      required: ['verdict', 'points_forts', 'a_ameliorer'],
      additionalProperties: false,
    },
  },
  required: ['titre', 'type_affiche', 'description', 'message_principal', 'informations_cles', 'elements_visuels', 'ton', 'public_cible', 'conseils', 'public_vise'],
  additionalProperties: false,
};

const SYSTEM = `Tu es un expert en communication visuelle et en marketing. On te montre une affiche (événement, publicité, campagne, film, annonce…).
Réponds toujours en français, de façon claire et concrète, pour quelqu'un qui n'est pas spécialiste.

- titre : le titre ou le nom principal lisible sur l'affiche (ou un titre court qui la résume s'il n'y en a pas).
- type_affiche : la nature de l'affiche (ex. concert, publicité produit, campagne de sensibilisation, film, formation…).
- description : 3 à 5 phrases qui décrivent ce qu'on voit et ce que l'affiche annonce.
- message_principal : l'idée que l'affiche veut faire passer, en une phrase.
- informations_cles : les informations pratiques lisibles (date, heure, lieu, prix, contact, site, organisateur…). Recopie le texte tel qu'il apparaît. Liste vide si aucune.
- elements_visuels : 3 à 6 éléments marquants (couleurs, personnages, typographie, mise en page, logos…).
- ton : le style et l'émotion dégagés (ex. festif, sérieux, haut de gamme, militant…).
- public_cible : à qui s'adresse l'affiche. Le public principal et 1 à 3 publics secondaires, chacun avec un profil concret et la raison tirée de l'affiche (indices visuels ou textuels). Ajoute la tranche d'âge, les centres d'intérêt et la zone géographique visée (« non précisée » si rien ne l'indique).
- conseils : 2 à 4 conseils concrets pour mieux toucher ce public.
- public_vise : seulement si l'utilisateur indique le public qu'il vise. verdict : une phrase qui dit si l'affiche convient à ce public (bien adaptée, en partie adaptée ou peu adaptée) et pourquoi ; points_forts : ce qui lui parle déjà ; a_ameliorer : ce qu'il faudrait changer pour mieux le toucher. Si aucun public visé n'est indiqué, renvoie un verdict vide et deux listes vides.

Appuie-toi uniquement sur ce que montre l'affiche et sur le texte descriptif fourni. Si un texte est illisible, dis-le plutôt que d'inventer.`;

// ---------- Appel à OpenAI ----------
class AiError extends Error {
  constructor(status, message, code) { super(message); this.status = status; this.code = code; }
}

async function openai(path, init = {}) {
  let res;
  try {
    res = await fetch(API + path, {
      ...init,
      headers: { Authorization: `Bearer ${store.get()}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
  } catch {
    throw new AiError(0, 'network');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AiError(res.status, data.error?.message || `Erreur ${res.status}`, data.error?.code || data.error?.type);
  return data;
}

// Choisit le modèle : celui des réglages, sinon le plus récent modèle « gpt-X » (non mini) disponible pour cette clé.
let autoModel = null;
async function pickModel() {
  if (modelStore.get()) return modelStore.get();
  if (autoModel) return autoModel;
  const version = (id) => {
    const m = id.match(/^gpt-(\d+(?:\.\d+)?)(o)?$/);
    return m ? parseFloat(m[1]) : null;
  };
  try {
    const { data = [] } = await openai('/models');
    const best = data.map((m) => m.id).filter((id) => (version(id) ?? 0) >= 4.1)
      .sort((x, y) => version(y) - version(x))[0];
    autoModel = best || 'gpt-4.1';
  } catch (err) {
    if (err.status === 401 || err.status === 0) throw err;
    autoModel = 'gpt-4.1';
  }
  return autoModel;
}

async function analyse(context, target) {
  const model = await pickModel();
  const response = await openai('/responses', {
    method: 'POST',
    body: JSON.stringify({
      model,
      instructions: SYSTEM,
      max_output_tokens: 16000,
      input: [{
        role: 'user',
        content: [
          { type: 'input_image', image_url: poster.dataUrl },
          { type: 'input_text', text: [
            context && `Texte descriptif fourni par l'utilisateur : ${context}`,
            target ? `Public visé par l'utilisateur : ${target}` : 'Aucun public visé indiqué.',
            'Analyse cette affiche.',
          ].filter(Boolean).join('\n\n') },
        ],
      }],
      text: { format: { type: 'json_schema', name: 'analyse_affiche', schema: SCHEMA, strict: true } },
    }),
  });
  if (response.status === 'incomplete') {
    throw new Error('La réponse a été coupée. Réessayez.');
  }
  const parts = (response.output || []).filter((o) => o.type === 'message').flatMap((o) => o.content || []);
  if (parts.some((c) => c.type === 'refusal')) {
    throw new Error('OpenAI a refusé d\u2019analyser cette affiche. Essayez avec une autre image.');
  }
  const text = parts.filter((c) => c.type === 'output_text').map((c) => c.text).join('');
  try { return JSON.parse(text); } catch { throw new Error('Réponse inattendue d\u2019OpenAI. Réessayez.'); }
}

function explain(err) {
  if (!(err instanceof AiError)) return err.message || String(err);
  if (err.status === 0) return 'Impossible de joindre OpenAI. Vérifiez votre connexion internet.';
  if (err.status === 401) return 'Clé OpenAI refusée. Vérifiez-la avec le bouton ⚙ Clé OpenAI.';
  if (err.code === 'insufficient_quota' || /quota|billing/i.test(err.message)) {
    return 'Crédit OpenAI insuffisant. Ajoutez du crédit sur platform.openai.com (Settings → Billing).';
  }
  if (err.status === 429) return 'Trop de demandes pour le moment. Patientez une minute puis réessayez.';
  if (err.status === 404 || err.code === 'model_not_found') {
    return `Modèle OpenAI introuvable pour cette clé. Videz le champ « Modèle » dans ⚙ Clé OpenAI, ou indiquez-en un autre. (${err.message})`;
  }
  return `OpenAI (${err.status}) : ${err.message}`;
}

// ---------- Affichage du résultat ----------
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}
function block(title, ...children) {
  const b = el('div', 'block');
  if (title) b.append(el('h3', '', title));
  b.append(...children.filter(Boolean));
  return b;
}
function list(items) {
  const ul = el('ul');
  items.forEach((t) => ul.append(el('li', '', t)));
  return ul;
}
function audienceCard(a, label, cls) {
  const c = el('div', 'audience' + (cls ? ' ' + cls : ''));
  c.append(el('span', 'tag', label), el('b', '', a.nom), el('p', '', a.profil), el('p', 'muted', 'Pourquoi : ' + a.pourquoi));
  return c;
}

function asText(r, target) {
  const p = r.public_cible;
  return [
    `${r.titre} (${r.type_affiche})`, '', 'TEXTE DESCRIPTIF', r.description, '', `Message principal : ${r.message_principal}`,
    ...(r.informations_cles.length ? ['', 'Informations clés :', ...r.informations_cles.map((i) => `- ${i.libelle} : ${i.valeur}`)] : []),
    '', `Ton : ${r.ton}`, '', 'PUBLIC CIBLE', p.resume,
    `- Principal : ${p.principal.nom} — ${p.principal.profil}`,
    ...p.secondaires.map((s) => `- Secondaire : ${s.nom} — ${s.profil}`),
    `Âge : ${p.tranche_age}`, `Centres d'intérêt : ${p.centres_interet.join(', ')}`, `Zone : ${p.zone_geographique}`,
    '', 'Conseils :', ...r.conseils.map((c) => `- ${c}`),
    ...(r.public_vise?.verdict ? ['', 'VOTRE PUBLIC CIBLE', `Public indiqué : ${target}`, r.public_vise.verdict,
      ...r.public_vise.points_forts.map((x) => `+ ${x}`), ...r.public_vise.a_ameliorer.map((x) => `- À améliorer : ${x}`)] : []),
  ].join('\n');
}

// ---------- Téléchargement ----------
function fileName(r, ext) {
  const base = (r.titre || 'affiche').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase();
  return `analyse-${base || 'affiche'}.${ext}`;
}
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob(['\ufeff', content], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function asWord(r, target) {
  const p = r.public_cible, v = r.public_vise;
  const ul = (items) => (items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '');
  const aud = (a, label) => `<p><b>${label} : ${esc(a.nom)}</b><br>${esc(a.profil)}<br><i>Pourquoi : ${esc(a.pourquoi)}</i></p>`;
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(r.titre)}</title>
<style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.4}h1{font-size:20pt;color:#4b2fc9}h2{font-size:14pt;color:#4b2fc9;margin-top:18pt}</style></head><body>
<h1>${esc(r.titre)}</h1><p><i>${esc(r.type_affiche)} · ton ${esc(r.ton)}</i></p>
<h2>Texte descriptif</h2><p>${esc(r.description)}</p><p><b>Message principal :</b> ${esc(r.message_principal)}</p>
${r.informations_cles.length ? `<h2>Informations clés</h2><ul>${r.informations_cles.map((i) => `<li><b>${esc(i.libelle)} :</b> ${esc(i.valeur)}</li>`).join('')}</ul>` : ''}
<h2>Public cible</h2><p>${esc(p.resume)}</p>${aud(p.principal, 'Public principal')}${p.secondaires.map((x) => aud(x, 'Public secondaire')).join('')}
<p><b>Âge :</b> ${esc(p.tranche_age)}<br><b>Zone :</b> ${esc(p.zone_geographique)}<br><b>Centres d'intérêt :</b> ${esc(p.centres_interet.join(', '))}</p>
${v && v.verdict ? `<h2>Votre public cible</h2><p><i>Public indiqué : ${esc(target)}</i></p><p><b>${esc(v.verdict)}</b></p>${v.points_forts.length ? '<p>Ce qui lui parle déjà :</p>' + ul(v.points_forts) : ''}${v.a_ameliorer.length ? '<p>À améliorer :</p>' + ul(v.a_ameliorer) : ''}` : ''}
<h2>Éléments visuels</h2>${ul(r.elements_visuels)}
<h2>Conseils pour mieux toucher ce public</h2>${ul(r.conseils)}
</body></html>`;
}

function render(r, target) {
  const out = $('#posterResult');
  out.replaceChildren();
  const p = r.public_cible;

  const head = block('Texte descriptif', el('h2', '', r.titre), el('p', 'muted', `${r.type_affiche} · ton ${r.ton}`), el('p', '', r.description),
    el('p', '', '« ' + r.message_principal + ' »'));
  const audiences = el('div', 'audiences');
  audiences.append(audienceCard(p.principal, 'Public principal'), ...p.secondaires.map((s) => audienceCard(s, 'Public secondaire', 'secondary')));
  const facts = el('dl', 'facts');
  facts.append(el('dt', '', 'Âge'), el('dd', '', p.tranche_age), el('dt', '', 'Zone'), el('dd', '', p.zone_geographique));
  const interests = el('div', 'pills');
  p.centres_interet.forEach((c) => interests.append(el('span', '', c)));
  const audienceBlock = block('Public cible selon l\u2019IA', el('p', '', p.resume), audiences, facts, interests);

  let info = null;
  if (r.informations_cles.length) {
    const dl = el('dl', 'facts');
    r.informations_cles.forEach((i) => dl.append(el('dt', '', i.libelle), el('dd', '', i.valeur)));
    info = block('Informations clés', dl);
  }
  const visuals = block('Éléments visuels', list(r.elements_visuels));
  const tips = block('Conseils pour mieux toucher ce public', list(r.conseils));
  const v = r.public_vise;
  let fit = null;
  if (v && v.verdict) {
    fit = block('Votre public cible', el('p', 'muted', 'Public indiqué : ' + target), el('p', 'verdict', v.verdict),
      v.points_forts.length && el('b', '', 'Ce qui lui parle déjà'), v.points_forts.length && list(v.points_forts),
      v.a_ameliorer.length && el('b', '', 'À améliorer pour le toucher'), v.a_ameliorer.length && list(v.a_ameliorer));
  }

  const actions = el('div', 'analysis-actions');
  const copy = el('button', 'ghost small', 'Copier l’analyse');
  copy.type = 'button';
  copy.onclick = async () => {
    try { await navigator.clipboard.writeText(asText(r, target)); copy.textContent = 'Copié ✓'; }
    catch { copy.textContent = 'Copie impossible'; }
    setTimeout(() => (copy.textContent = 'Copier l’analyse'), 2000);
  };
  const txt = el('button', 'ghost small', '⬇ Télécharger (.txt)');
  txt.type = 'button';
  txt.onclick = () => download(fileName(r, 'txt'), asText(r, target), 'text/plain;charset=utf-8');
  const doc = el('button', 'ghost small', '⬇ Télécharger (Word)');
  doc.type = 'button';
  doc.onclick = () => download(fileName(r, 'doc'), asWord(r, target), 'application/msword');
  actions.append(txt, doc, copy);

  out.append(...[head, fit, audienceBlock, info, visuals, tips, actions].filter(Boolean));
}

const DEMO_RESULT = {
  titre: 'Festival Rythmes du Sahel', type_affiche: 'Concert / festival de musique',
  description: '[Démo] Affiche colorée annonçant un festival de musique en plein air. Un chanteur au micro occupe le centre, entouré de motifs graphiques inspirés des tissus traditionnels. Les dates et le lieu sont écrits en gros en bas de l’affiche.',
  message_principal: 'Venez vivre trois jours de musique et de fête en famille et entre amis.',
  informations_cles: [{ libelle: 'Dates', valeur: '12 – 14 décembre' }, { libelle: 'Lieu', valeur: 'Place de la Nation' }, { libelle: 'Entrée', valeur: '2 000 FCFA' }],
  elements_visuels: ['Couleurs chaudes : orange, jaune, rouge', 'Artiste au micro en gros plan', 'Motifs inspirés du pagne', 'Titre en lettres épaisses et arrondies'],
  ton: 'festif et chaleureux',
  public_cible: {
    resume: 'Surtout les jeunes adultes amateurs de musique urbaine et traditionnelle, et les familles de la ville.',
    principal: { nom: 'Jeunes adultes urbains', profil: '18-30 ans, étudiants et jeunes actifs, actifs sur les réseaux sociaux.', pourquoi: 'Artiste moderne, couleurs vives et ambiance de fête.' },
    secondaires: [{ nom: 'Familles', profil: 'Parents avec enfants cherchant une sortie le week-end.', pourquoi: 'Prix d’entrée bas et événement en plein air.' }],
    tranche_age: '18-35 ans', centres_interet: ['Musique', 'Sorties', 'Culture locale', 'Danse'], zone_geographique: 'Ville et alentours',
  },
  conseils: ['Ajouter le nom des artistes invités pour attirer leurs fans.', 'Publier une version carrée pour Instagram et Facebook.', 'Indiquer un numéro WhatsApp pour les réservations.'],
  public_vise: { verdict: '', points_forts: [], a_ameliorer: [] },
};
const DEMO_FIT = {
  verdict: '[Démo] En partie adaptée : l\u2019ambiance festive attire bien ce public, mais rien n\u2019indique qu\u2019il est le premier visé.',
  points_forts: ['Couleurs vives et artiste moderne, qui parlent aux jeunes.', 'Prix d\u2019entrée accessible.'],
  a_ameliorer: ['Ajouter un tarif étudiant bien visible.', 'Mentionner les artistes que ce public suit sur les réseaux.'],
};

// ---------- Envoi ----------
$('#posterForm').onsubmit = async (e) => {
  e.preventDefault();
  showError('');
  if (!poster) return showError('Ajoutez d’abord une affiche.');
  if (!IS_DEMO && !store.get()) { openAiSettings(); return showError('Ajoutez votre clé API OpenAI.'); }

  const btn = $('#posterSubmit');
  const out = $('#posterResult');
  btn.disabled = true;
  btn.textContent = 'Analyse en cours…';
  const loading = el('div', 'block loading');
  loading.append(el('span', 'spinner'), el('span', '', 'L’IA lit votre affiche… (10 à 40 secondes)'));
  out.replaceChildren(loading);
  out.hidden = false;
  try {
    const target = $('#posterTarget').value.trim();
    const result = IS_DEMO
      ? await new Promise((r) => setTimeout(() => r({ ...DEMO_RESULT, public_vise: target ? DEMO_FIT : DEMO_RESULT.public_vise }), 1200))
      : await analyse($('#posterContext').value.trim(), target);
    render(result, target);
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    out.hidden = true;
    showError(explain(err));
  } finally {
    btn.disabled = false;
    btn.textContent = 'Analyser l’affiche';
  }
};

showView();
