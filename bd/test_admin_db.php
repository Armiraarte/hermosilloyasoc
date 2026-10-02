<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';

portalAllowCors();

$config = portalDbConfig();
$pdo = portalGetDbConnection();

$tables = [
    'administradores',
    'clientes',
    'expedientes',
    'expediente_historial',
    'expediente_calendario',
    'expediente_archivos',
];

$counts = [];
foreach ($tables as $table) {
    $statement = $pdo->query(sprintf('SELECT COUNT(*) AS total FROM %s', $table));
    $counts[$table] = (int) $statement->fetchColumn();
}

portalJsonResponse([
    'ok' => true,
    'message' => 'Conexion del panel administrador correcta.',
    'database' => $config['database'],
    'host' => $config['host'],
    'port' => $config['port'],
    'username' => $config['username'],
    'projectBaseUrl' => $config['project_base_url'],
    'counts' => $counts,
]);
