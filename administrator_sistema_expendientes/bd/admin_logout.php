<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';

portalAllowCors();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    portalJsonResponse([
        'ok' => false,
        'message' => 'Este endpoint solo acepta POST.',
    ], 405);
}

portalDestroyAdminSession();

portalJsonResponse([
    'ok' => true,
    'message' => 'Sesion cerrada correctamente.',
]);
