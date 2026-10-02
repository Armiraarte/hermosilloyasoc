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

$payload = portalReadJsonBody();
$username = trim((string) ($payload['username'] ?? ''));
$password = (string) ($payload['password'] ?? '');

if ($username === '' || $password === '') {
    portalJsonResponse([
        'ok' => false,
        'message' => 'Debes enviar usuario y contrasena.',
    ], 400);
}

$pdo = portalGetDbConnection();
$statement = $pdo->prepare("
    SELECT id, usuario, nombre, tipo_usuario, password_hash, activo
    FROM administradores
    WHERE usuario = :usuario
    LIMIT 1
");
$statement->execute(['usuario' => $username]);
$admin = $statement->fetch();

if ($admin === false || (int) $admin['activo'] !== 1 || !password_verify($password, (string) $admin['password_hash'])) {
    portalJsonResponse([
        'ok' => false,
        'message' => 'Credenciales incorrectas.',
    ], 401);
}

portalStoreAdminSession($admin);

portalJsonResponse([
    'ok' => true,
    'message' => 'Acceso concedido.',
    'admin' => [
        'id' => (int) $admin['id'],
        'username' => (string) $admin['usuario'],
        'name' => (string) $admin['nombre'],
        'type' => (string) $admin['tipo_usuario'],
    ],
]);
