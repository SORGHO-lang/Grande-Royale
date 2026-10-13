<?php
// Liste les documents déposés dans documents/fichiers/ (pour activer les boutons « Télécharger »).
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache');
header('X-Content-Type-Options: nosniff');
$autorises = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'txt', 'zip'];
$fichiers = [];
foreach (glob(__DIR__ . '/fichiers/*') ?: [] as $chemin) {
    $ext = strtolower(pathinfo($chemin, PATHINFO_EXTENSION));
    $nom = pathinfo($chemin, PATHINFO_FILENAME);
    if (!is_file($chemin) || !in_array($ext, $autorises, true) || !preg_match('/^[a-z0-9-]+$/', $nom)) continue;
    $fichiers[$nom] = ['url' => '/documents/fichiers/' . rawurlencode(basename($chemin)), 'ext' => $ext, 'taille' => filesize($chemin)];
}
echo json_encode(['fichiers' => (object) $fichiers], JSON_UNESCAPED_SLASHES);
