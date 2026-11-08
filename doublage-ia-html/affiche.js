// Analyse d'affiche — décrit une affiche et identifie son public cible avec Claude (Anthropic).
// Le navigateur appelle directement l'API Claude avec la clé saisie par l'utilisateur
// (enregistrée uniquement dans ce navigateur). Ajoutez ?demo à l'adresse pour tester sans clé.
import { Anthropic } from './anthropic-sdk.js?v=5';

const MODEL = 'claude-opus-5-5';
const KEY_STORE = 'doublage-ia-claude-key';
const IS_DEMO = new URLSearchParams(location.search).has('demo');
const $ = (s) => document.querySelector(s);

const store = {
  get() { try { return localStorage.getItem(KEY_STORE) || ''; } catch { return ''; } },
  set(v) { try { v ? localStorage.setItem(KEY_STORE, v) : localStorage.removeItem(KEY_STORE); } catch { /* stockage indisponible */ } },
};

// ---------- Navigation entre les deux outils ----------
function showView() {
  const view = location.hash === '#affiche' ? 'affiche' : 'doublage';
  $('#view-doublage').hidden = view !== 'doublage';
  $('#view-affiche').hidden = view !== 'affiche';
  document.querySelectorAll('.view-link').forEach((a) => a.classList.toggle('active', a.dataset.view === view));
  $('#settingsBtn').textContent = view === 'affiche' ? '⚙ Clé Claude' : '⚙ Clé API';
  return view;
}
window.addEventListener('hashchange', showView);
const openElevenLabs = $('#settingsBtn').onclick;
$('#settingsBtn').onclick = () => (showView() === 'affiche' ? openClaudeSettings() : openElevenLabs());

// ---------- Clé Claude ----------
function openClaudeSettings() {
  $('#claudeKey').placeholder = store.get() ? '•••••••• (clé enregistrée)' : 'sk-ant-…';
  $('#claudeSettings').showModal();
}
$('#saveClaudeKey').onclick = (e) => {
  e.preventDefault();
  store.set($('#claudeKey').value.replace(/["'\s]/g, ''));
  $('#claudeKey').value = '';
  $('#claudeSettings').close();
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
  },
  required: ['titre', 'type_affiche', 'description', 'message_principal', 'informations_cles', 'elements_visuels', 'ton', 'public_cible', 'conseils'],
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

Appuie-toi uniquement sur ce que montre l'affiche et sur le contexte fourni. Si un texte est illisible, dis-le plutôt que d'inventer.`;

// ---------- Appel à Claude ----------
async function analyse(context) {
  const client = new Anthropic({ apiKey: store.get(), dangerouslyAllowBrowser: true });
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM,
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: poster.mediaType, data: poster.data } },
        { type: 'text', text: context ? `Contexte donné par l'utilisateur : ${context}\n\nAnalyse cette affiche.` : 'Analyse cette affiche.' },
      ],
    }],
  });
  if (response.stop_reason === 'refusal') {
    throw new Error('Claude a refusé d’analyser cette affiche. Essayez avec une autre image.');
  }
  if (response.stop_reason === 'max_tokens') {
    throw new Error('La réponse a été coupée. Réessayez.');
  }
  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try { return JSON.parse(text); } catch { throw new Error('Réponse inattendue de Claude. Réessayez.'); }
}

function explain(err) {
  if (err instanceof Anthropic.AuthenticationError) return 'Clé Claude refusée. Vérifiez-la avec le bouton ⚙ Clé Claude.';
  if (err instanceof Anthropic.PermissionDeniedError) return 'Cette clé Claude n’a pas accès à ce modèle.';
  if (err instanceof Anthropic.RateLimitError) return 'Trop de demandes pour le moment. Patientez une minute puis réessayez.';
  if (err instanceof Anthropic.APIConnectionError) return 'Impossible de joindre Claude. Vérifiez votre connexion internet.';
  if (err instanceof Anthropic.APIError) {
    const msg = err.error?.error?.message || err.message;
    if (/credit balance/i.test(msg)) return 'Crédit Claude insuffisant. Ajoutez du crédit sur platform.claude.com (Billing).';
    return `Claude (${err.status ?? 'erreur'}) : ${msg}`;
  }
  return err.message || String(err);
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

function asText(r) {
  const p = r.public_cible;
  return [
    `${r.titre} (${r.type_affiche})`, '', r.description, '', `Message principal : ${r.message_principal}`,
    ...(r.informations_cles.length ? ['', 'Informations clés :', ...r.informations_cles.map((i) => `- ${i.libelle} : ${i.valeur}`)] : []),
    '', `Ton : ${r.ton}`, '', 'PUBLIC CIBLE', p.resume,
    `- Principal : ${p.principal.nom} — ${p.principal.profil}`,
    ...p.secondaires.map((s) => `- Secondaire : ${s.nom} — ${s.profil}`),
    `Âge : ${p.tranche_age}`, `Centres d'intérêt : ${p.centres_interet.join(', ')}`, `Zone : ${p.zone_geographique}`,
    '', 'Conseils :', ...r.conseils.map((c) => `- ${c}`),
  ].join('\n');
}

function render(r) {
  const out = $('#posterResult');
  out.replaceChildren();
  const p = r.public_cible;

  const head = block('', el('h2', '', r.titre), el('p', 'muted', `${r.type_affiche} · ton ${r.ton}`), el('p', '', r.description),
    el('p', '', '« ' + r.message_principal + ' »'));
  const audiences = el('div', 'audiences');
  audiences.append(audienceCard(p.principal, 'Public principal'), ...p.secondaires.map((s) => audienceCard(s, 'Public secondaire', 'secondary')));
  const facts = el('dl', 'facts');
  facts.append(el('dt', '', 'Âge'), el('dd', '', p.tranche_age), el('dt', '', 'Zone'), el('dd', '', p.zone_geographique));
  const interests = el('div', 'pills');
  p.centres_interet.forEach((c) => interests.append(el('span', '', c)));
  const target = block('Public cible', el('p', '', p.resume), audiences, facts, interests);

  let info = null;
  if (r.informations_cles.length) {
    const dl = el('dl', 'facts');
    r.informations_cles.forEach((i) => dl.append(el('dt', '', i.libelle), el('dd', '', i.valeur)));
    info = block('Informations clés', dl);
  }
  const visuals = block('Éléments visuels', list(r.elements_visuels));
  const tips = block('Conseils pour mieux toucher ce public', list(r.conseils));

  const actions = el('div', 'analysis-actions');
  const copy = el('button', 'ghost small', 'Copier l’analyse');
  copy.type = 'button';
  copy.onclick = async () => {
    try { await navigator.clipboard.writeText(asText(r)); copy.textContent = 'Copié ✓'; }
    catch { copy.textContent = 'Copie impossible'; }
    setTimeout(() => (copy.textContent = 'Copier l’analyse'), 2000);
  };
  actions.append(copy);

  out.append(...[head, target, info, visuals, tips, actions].filter(Boolean));
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
};

// ---------- Envoi ----------
$('#posterForm').onsubmit = async (e) => {
  e.preventDefault();
  showError('');
  if (!poster) return showError('Ajoutez d’abord une affiche.');
  if (!IS_DEMO && !store.get()) { openClaudeSettings(); return showError('Ajoutez votre clé API Claude.'); }

  const btn = $('#posterSubmit');
  const out = $('#posterResult');
  btn.disabled = true;
  btn.textContent = 'Analyse en cours…';
  const loading = el('div', 'block loading');
  loading.append(el('span', 'spinner'), el('span', '', 'Claude lit votre affiche… (10 à 40 secondes)'));
  out.replaceChildren(loading);
  out.hidden = false;
  try {
    const result = IS_DEMO
      ? await new Promise((r) => setTimeout(() => r(DEMO_RESULT), 1200))
      : await analyse($('#posterContext').value.trim());
    render(result);
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
