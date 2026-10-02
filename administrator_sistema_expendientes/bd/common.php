<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function portalAllowCors(): void
{
    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin !== '') {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    } else {
        header('Access-Control-Allow-Origin: *');
    }

    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function portalStringContains(string $haystack, string $needle): bool
{
    if ($needle === '') {
        return true;
    }

    if (function_exists('str_contains')) {
        return str_contains($haystack, $needle);
    }

    return strpos($haystack, $needle) !== false;
}

function portalJsonResponse(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function portalReadJsonBody(): array
{
    $rawBody = file_get_contents('php://input');
    if ($rawBody === false || trim($rawBody) === '') {
        return [];
    }

    $decoded = json_decode($rawBody, true);
    if (!is_array($decoded)) {
        portalJsonResponse([
            'ok' => false,
            'message' => 'El cuerpo JSON no tiene un formato valido.',
        ], 400);
    }

    return $decoded;
}

function portalGetDbConnection(): PDO
{
    static $connection = null;

    if ($connection instanceof PDO) {
        return $connection;
    }

    $config = portalDbConfig();
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $config['host'],
        $config['port'],
        $config['database'],
        $config['charset']
    );

    try {
        $connection = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $exception) {
        portalJsonResponse([
            'ok' => false,
            'message' => 'No se pudo conectar a MySQL.',
            'details' => $exception->getMessage(),
        ], 500);
    }

    return $connection;
}

function portalNormalizeDateTime(?string $value): ?string
{
    if ($value === null) {
        return null;
    }

    $trimmed = trim($value);
    if ($trimmed === '') {
        return null;
    }

    $timestamp = strtotime($trimmed);
    if ($timestamp === false) {
        return null;
    }

    return date('Y-m-d H:i:s', $timestamp);
}

function portalIsoDateTime(?string $value): string
{
    if ($value === null || trim($value) === '') {
        return '';
    }

    $timestamp = strtotime($value);
    if ($timestamp === false) {
        return $value;
    }

    return date('Y-m-d\TH:i:s', $timestamp);
}

function portalGenerateReference(string $prefix): string
{
    return sprintf('%s-%s', $prefix, bin2hex(random_bytes(6)));
}

function portalBuildPublicFileUrl(string $storedRelativePath): string
{
    $config = portalDbConfig();
    return rtrim((string) $config['project_base_url'], '/') . '/' . ltrim(str_replace('\\', '/', $storedRelativePath), '/');
}

function portalBuildFileAccessUrl(string $fileReference, bool $download = false): string
{
    $config = portalDbConfig();
    $query = http_build_query([
        'ref' => $fileReference,
        'download' => $download ? '1' : null,
    ]);

    return rtrim((string) $config['project_base_url'], '/') . '/bd/archivo_expediente.php?' . $query;
}

function portalUploadsDirectory(): string
{
    $config = portalDbConfig();
    return (string) $config['uploads_directory'];
}

function portalUploadsPublicPrefix(): string
{
    $config = portalDbConfig();
    return trim(str_replace('\\', '/', (string) $config['uploads_public_prefix']), '/');
}

function portalEnsureDirectoryExists(string $directory, string $message): void
{
    if (!is_dir($directory) && !mkdir($directory, 0777, true) && !is_dir($directory)) {
        portalJsonResponse([
            'ok' => false,
            'message' => $message,
        ], 500);
    }
}

function portalEnsureUploadsDirectoryExists(): void
{
    portalEnsureDirectoryExists(portalUploadsDirectory(), 'No se pudo crear la carpeta de uploads.');
}

function portalNormalizeBoolean($value, bool $default = false): bool
{
    if ($value === null) {
        return $default;
    }

    if (is_bool($value)) {
        return $value;
    }

    if (is_int($value)) {
        return $value === 1;
    }

    $normalized = strtolower(trim((string) $value));
    return in_array($normalized, ['1', 'true', 'si', 'yes', 'on'], true);
}

function portalNormalizeUploadedFiles(array $filesInput, string $fieldName = 'files'): array
{
    if (!isset($filesInput[$fieldName])) {
        return [];
    }

    $field = $filesInput[$fieldName];
    if (!is_array($field['name'] ?? null)) {
        return [$field];
    }

    $normalized = [];
    foreach ($field['name'] as $index => $name) {
        $normalized[] = [
            'name' => $name,
            'type' => $field['type'][$index] ?? 'application/octet-stream',
            'tmp_name' => $field['tmp_name'][$index] ?? '',
            'error' => $field['error'][$index] ?? UPLOAD_ERR_NO_FILE,
            'size' => $field['size'][$index] ?? 0,
        ];
    }

    return $normalized;
}

function portalRequestAction(string $defaultAction = 'list'): string
{
    return (string) ($_GET['action'] ?? $_POST['action'] ?? $defaultAction);
}

function portalStartSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    if (defined('PHP_VERSION_ID') && PHP_VERSION_ID >= 70300) {
        session_set_cookie_params([
            'httponly' => true,
            'path' => '/',
            'samesite' => 'Lax',
        ]);
    } else {
        session_set_cookie_params(0, '/; samesite=Lax', '', false, true);
    }

    session_start();
}

function portalStoreAdminSession(array $admin): void
{
    portalStartSession();
    session_regenerate_id(true);
    $_SESSION['portal_admin'] = [
        'id' => (int) ($admin['id'] ?? 0),
        'username' => (string) ($admin['usuario'] ?? $admin['username'] ?? ''),
        'name' => (string) ($admin['nombre'] ?? $admin['name'] ?? ''),
        'type' => (string) ($admin['tipo_usuario'] ?? $admin['type'] ?? ''),
    ];
}

function portalCurrentAdminSession(): ?array
{
    portalStartSession();
    $admin = $_SESSION['portal_admin'] ?? null;
    if (!is_array($admin)) {
        return null;
    }

    return [
        'id' => (int) ($admin['id'] ?? 0),
        'username' => (string) ($admin['username'] ?? ''),
        'name' => (string) ($admin['name'] ?? ''),
        'type' => (string) ($admin['type'] ?? ''),
    ];
}

function portalRequireAdminAuth(): array
{
    $admin = portalCurrentAdminSession();
    if ($admin === null || (int) ($admin['id'] ?? 0) <= 0) {
        portalJsonResponse([
            'ok' => false,
            'message' => 'Debes iniciar sesion como administrador.',
        ], 401);
    }

    return $admin;
}

function portalDestroyAdminSession(): void
{
    portalStartSession();
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'] ?? '/',
            $params['domain'] ?? '',
            (bool) ($params['secure'] ?? false),
            (bool) ($params['httponly'] ?? true)
        );
    }

    session_destroy();
}
