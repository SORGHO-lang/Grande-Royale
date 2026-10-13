<?php
/**
 * ISP SAHEL — réception des formulaires (pré-inscription et contact).
 *
 *  - vérifie les champs (comme le site) et filtre les robots ;
 *  - envoie un e-mail à l'établissement ;
 *  - enregistre chaque demande dans donnees/*.csv (ouvrable dans Excel),
 *    dossier protégé et inaccessible depuis le web.
 *
 * Réglages : voir le bloc CONFIGURATION ci-dessous.
 */

// ─── CONFIGURATION ─────────────────────────────────────────────────────
$DESTINATAIRE = 'contact@ispsahel.com';          // qui reçoit les demandes
$EXPEDITEUR   = 'contact@ispsahel.com';          // adresse d'envoi : doit être une boîte mail de VOTRE domaine (créée dans Hostinger)
$TELEPHONE    = '+226 50 39 33 33';
$WHATSAPP     = '22650393333';
$LIMITE       = 5;                               // envois maximum…
$FENETRE      = 15 * 60;                         // …par 15 minutes et par connexion
// ───────────────────────────────────────────────────────────────────────

date_default_timezone_set('Africa/Ouagadougou');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$veutJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function repondre(bool $ok, string $message, array $erreurs = []): void {
    global $veutJson;
    if ($veutJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message, 'errors' => (object) $erreurs], JSON_UNESCAPED_UNICODE);
    } else {
        // Navigateur sans JavaScript : petite page de réponse.
        header('Content-Type: text/html; charset=utf-8');
        $titre = $ok ? 'Merci !' : 'Envoi impossible';
        $liste = '';
        foreach ($erreurs as $e) $liste .= '<li>' . htmlspecialchars($e) . '</li>';
        echo '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           . '<meta name="robots" content="noindex"><title>' . $titre . ' | ISP SAHEL</title><link rel="stylesheet" href="/assets/css/site.css"></head>'
           . '<body><main class="container-page py-16"><div class="card mx-auto max-w-xl p-8"><h1 class="text-2xl font-extrabold">' . $titre . '</h1>'
           . '<p class="mt-3">' . htmlspecialchars($message) . '</p>' . ($liste ? '<ul class="mt-3 list-disc pl-6">' . $liste . '</ul>' : '')
           . '<p class="mt-6"><a class="btn btn-primary" href="javascript:history.back()">Retour</a> <a class="btn btn-outline" href="/">Accueil</a></p></div></main></body></html>';
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    repondre(false, 'Méthode non autorisée.');
}

// Même site uniquement (protection contre l'envoi depuis un autre site).
$origine = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
$hote = $_SERVER['HTTP_HOST'] ?? '';
if ($origine !== '' && parse_url($origine, PHP_URL_HOST) !== preg_replace('/:\d+$/', '', $hote)) {
    http_response_code(403);
    repondre(false, 'Requête refusée.');
}

$champ = function (string $nom, int $max = 5000): string {
    $v = trim((string) ($_POST[$nom] ?? ''));
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    return mb_substr($v, 0, $max);
};

$type = $champ('formulaire', 20);
if (!in_array($type, ['preinscription', 'contact'], true)) repondre(false, 'Formulaire inconnu.');

// ─── Anti-robots : champ piège + délai minimal de 2 secondes ───────────
$debut = (int) $champ('_t', 20);
if ($champ('site_web') !== '' || ($debut > 0 && (microtime(true) * 1000 - $debut) < 2000)) {
    repondre(true, 'Merci ! Votre demande a bien été envoyée.'); // on fait semblant
}

// ─── Limitation de débit (empreinte de l'IP, jamais l'IP en clair) ─────
$dossier = __DIR__ . '/donnees';
if (!is_dir($dossier . '/limites')) @mkdir($dossier . '/limites', 0750, true);
$empreinte = substr(hash('sha256', 'isp-sahel:' . ($_SERVER['REMOTE_ADDR'] ?? '0')), 0, 32);
$fichierLimite = $dossier . '/limites/' . $empreinte;
$maintenant = time();
$envois = [];
if (is_file($fichierLimite)) {
    $envois = array_filter(array_map('intval', explode(',', (string) file_get_contents($fichierLimite))), fn ($t) => $maintenant - $t < $FENETRE);
}
if (count($envois) >= $LIMITE) {
    http_response_code(429);
    repondre(false, "Trop d'envois depuis votre connexion. Merci de réessayer dans quelques minutes ou de nous appeler au $TELEPHONE.");
}

// ─── Validation ────────────────────────────────────────────────────────
$erreurs = [];
$telValide = function (string $t): bool {
    $n = strlen(preg_replace('/\D/', '', $t));
    return (bool) preg_match('/^[+(\d][\d\s()+.-]{6,24}$/', $t) && $n >= 8 && $n <= 15;
};
$d = ['nom' => $champ('nom', 120), 'telephone' => $champ('telephone', 30), 'email' => $champ('email', 200)];
if (mb_strlen($d['nom']) < 2) $erreurs['nom'] = $type === 'contact' ? 'Indiquez votre nom' : 'Indiquez votre nom complet';
if ($d['email'] !== '' && !filter_var($d['email'], FILTER_VALIDATE_EMAIL)) $erreurs['email'] = 'Adresse e-mail invalide';

if ($type === 'preinscription') {
    $d['filiere'] = $champ('filiere', 150);
    $d['niveau'] = $champ('niveau', 10);
    $d['message'] = $champ('message', 2000);
    if (!$telValide($d['telephone'])) $erreurs['telephone'] = 'Numéro de téléphone invalide';
    if (mb_strlen($d['filiere']) < 2) $erreurs['filiere'] = 'Choisissez une filière';
    if (!in_array($d['niveau'], ['Licence', 'Master'], true)) $erreurs['niveau'] = 'Choisissez un niveau';
} else {
    $d['sujet'] = $champ('sujet', 150);
    $d['message'] = $champ('message', 5000);
    if ($d['email'] === '') $erreurs['email'] = 'Adresse e-mail invalide';
    if ($d['telephone'] !== '' && !$telValide($d['telephone'])) $erreurs['telephone'] = 'Numéro de téléphone invalide';
    if (mb_strlen($d['message']) < 5) $erreurs['message'] = 'Votre message est trop court';
}
if ($erreurs) repondre(false, 'Merci de corriger les champs indiqués.', $erreurs);

$envois[] = $maintenant;
@file_put_contents($fichierLimite, implode(',', $envois), LOCK_EX);

// ─── Enregistrement CSV (séparateur « ; », compatible Excel) ───────────
$date = date('Y-m-d H:i');
$colonnes = $type === 'preinscription'
    ? ['Date' => $date, 'Nom' => $d['nom'], 'Téléphone' => $d['telephone'], 'E-mail' => $d['email'], 'Filière' => $d['filiere'], 'Niveau' => $d['niveau'], 'Message' => $d['message']]
    : ['Date' => $date, 'Nom' => $d['nom'], 'E-mail' => $d['email'], 'Téléphone' => $d['telephone'], 'Sujet' => $d['sujet'], 'Message' => $d['message']];
$csvCellule = function (string $v): string {
    if ($v !== '' && strpos('=+-@', $v[0]) !== false) $v = "'" . $v;   // pas de formule Excel
    return '"' . str_replace('"', '""', $v) . '"';
};
$fichierCsv = $dossier . '/' . ($type === 'preinscription' ? 'preinscriptions.csv' : 'messages.csv');
$nouveau = !is_file($fichierCsv);
$ligne = implode(';', array_map($csvCellule, array_values($colonnes))) . "\r\n";
$entete = $nouveau ? "\xEF\xBB\xBF" . implode(';', array_map($csvCellule, array_keys($colonnes))) . "\r\n" : '';
$enregistre = @file_put_contents($fichierCsv, $entete . $ligne, FILE_APPEND | LOCK_EX) !== false;

// ─── E-mail de notification ────────────────────────────────────────────
$sujetMail = $type === 'preinscription'
    ? "Nouvelle pré-inscription — {$d['nom']} ({$d['niveau']})"
    : 'Message du site — ' . ($d['sujet'] !== '' ? $d['sujet'] : $d['nom']);
$corps = '';
foreach ($colonnes as $k => $v) if ($v !== '') $corps .= "$k : $v\n";
$corps .= "\n— Envoyé depuis le site ispsahel.com";
$entetes = [
    'From: ISP SAHEL (site web) <' . $EXPEDITEUR . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];
if ($d['email'] !== '' && filter_var($d['email'], FILTER_VALIDATE_EMAIL)) $entetes[] = 'Reply-To: ' . $d['email'];
$envoye = @mail($DESTINATAIRE, '=?UTF-8?B?' . base64_encode($sujetMail) . '?=', $corps, implode("\r\n", $entetes));

if (!$enregistre && !$envoye) {
    repondre(false, "L'envoi n'a pas abouti. Écrivez-nous sur WhatsApp (+$WHATSAPP) ou appelez le $TELEPHONE.");
}
repondre(true, $type === 'preinscription'
    ? 'Merci ! Votre pré-inscription a bien été enregistrée. Notre scolarité vous rappellera très prochainement.'
    : 'Merci, votre message a bien été envoyé. Nous vous répondrons rapidement.');
