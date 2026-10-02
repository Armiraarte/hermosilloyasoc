<?php
declare(strict_types=1);

$uriPath = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$fullPath = __DIR__ . '/..' . $uriPath;

if ($uriPath !== '/' && is_file($fullPath)) {
    return false;
}

if (str_starts_with($uriPath, '/bd/') && is_file($fullPath)) {
    require $fullPath;
    return true;
}

http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'ok' => false,
    'message' => 'Ruta no encontrada en el servidor PHP local.',
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
