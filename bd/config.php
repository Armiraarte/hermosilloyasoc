<?php
// Evitar salida de errores PHP en el cuerpo de la respuesta (rompe el JSON)
ini_set('display_errors', 0);
error_reporting(E_ALL);

function getRequestId(): string {
    static $requestId = null;
    if ($requestId !== null) {
        return $requestId;
    }
    try {
        $requestId = bin2hex(random_bytes(8));
    } catch (Throwable $e) {
        $requestId = uniqid('req_', true);
    }
    return $requestId;
}
// ConfiguraciÃ³n de CORS y Headers
// Si defines CORS_ORIGINS en el servidor (comma-separated), se restringe el acceso.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOriginsEnv = getenv('CORS_ORIGINS') ?: '';
$allowedOrigins = array_filter(array_map('trim', explode(',', $allowedOriginsEnv)));

if (!empty($allowedOrigins)) {
    if ($origin && in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: {$origin}");
        header("Vary: Origin");
    } elseif ($origin) {
        http_response_code(403);
        header("Content-Type: application/json; charset=UTF-8");
        echo json_encode(["success" => false, "message" => "Origen no permitido"]);
        exit;
    }
} else {
    header("Access-Control-Allow-Origin: *");
}

header("X-Request-Id: " . getRequestId());
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-API-KEY");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de preflight OPTIONS
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ConfiguraciÃ³n de la Base de Datos
$dbConfig = [
    'host'    => getenv('DB_HOST') ?: '2.25.84.101',
    'port'    => getenv('DB_PORT') ?: '3306',
    'name'    => getenv('DB_NAME') ?: 'administrador_expedientes',
    'user'    => getenv('DB_USER') ?: 'hya_expedientes_app',
    'pass'    => getenv('DB_PASS') ?: '',
    'charset' => 'utf8mb4'
];

// Configuracion privada opcional, excluida de Git.
$legacyDbConfigFile = __DIR__ . '/legacy_config.local.php';
if (is_file($legacyDbConfigFile)) {
    $legacyDbConfig = require $legacyDbConfigFile;
    if (is_array($legacyDbConfig)) {
        $dbConfig = array_replace($dbConfig, $legacyDbConfig);
    }
}

// API Key (para proteger endpoints en producciÃ³n)
$apiKey = getenv('API_KEY') ?: '';

const SUPER_MASTER_ID = 1;
const BASIC_PROPERTY_LIMIT = 5;
const VERIFIED_BASIC_PROPERTY_LIMIT = 25;
const PROPERTY_UPLOADS_URL_PREFIX = '/uploads/propiedades/';

function getSuperMasterId(): int {
    return SUPER_MASTER_ID;
}

function isSuperMasterId(int $masterId): bool {
    return $masterId === getSuperMasterId();
}

function normalizeAgencyPlan($value): string {
    $normalized = strtolower(trim((string)$value));
    return $normalized === 'premium' ? 'premium' : 'basico';
}

function getAgencyPropertyLimit(bool $verified, string $plan): ?int {
    $normalizedPlan = normalizeAgencyPlan($plan);
    if ($normalizedPlan === 'premium') {
        return null;
    }
    return $verified ? VERIFIED_BASIC_PROPERTY_LIMIT : BASIC_PROPERTY_LIMIT;
}

function normalizePropertyImageRelativePath(string $value): string {
    $raw = trim($value);
    if ($raw === '') {
        return '';
    }

    $normalized = str_replace('\\', '/', $raw);
    $candidatePath = $normalized;

    if (preg_match('/^https?:\/\//i', $normalized) === 1) {
        $parsedPath = parse_url($normalized, PHP_URL_PATH);
        if (is_string($parsedPath) && $parsedPath !== '') {
            $candidatePath = $parsedPath;
        }
    }

    $prefix = strtolower(PROPERTY_UPLOADS_URL_PREFIX);
    $lowered = strtolower($candidatePath);
    $markerIndex = strpos($lowered, $prefix);
    if ($markerIndex !== false) {
        return ltrim(substr($candidatePath, $markerIndex + strlen($prefix)), '/');
    }

    $trimmedPath = ltrim($candidatePath, '/');
    $trimmedLowered = strtolower($trimmedPath);
    $prefixWithoutLeadingSlash = ltrim($prefix, '/');

    if (strpos($trimmedLowered, $prefixWithoutLeadingSlash) === 0) {
        return ltrim(substr($trimmedPath, strlen($prefixWithoutLeadingSlash)), '/');
    }

    if (preg_match('#^(?:master_[^/]+|m\d+|g)/(?:prop_[^/]+|p\d+)/[^/]+$#i', $trimmedPath) === 1) {
        return $trimmedPath;
    }

    if (preg_match('#^prop_[^/]+\.[a-z0-9]{2,5}$#i', $trimmedPath) === 1) {
        return $trimmedPath;
    }

    return '';
}

function normalizePropertyImageStorageValue(?string $value): string {
    $raw = trim((string)$value);
    if ($raw === '') {
        return '';
    }

    $relativePath = normalizePropertyImageRelativePath($raw);
    return $relativePath !== '' ? $relativePath : $raw;
}

function buildPropertyImagePublicPath(string $relativePath): string {
    $cleaned = ltrim(str_replace('\\', '/', trim($relativePath)), '/');
    return PROPERTY_UPLOADS_URL_PREFIX . $cleaned;
}

function buildPropertyImageRelativeDirectory(?int $masterId, int $propertyId): string {
    $masterSegment = intval($masterId) > 0 ? 'm' . intval($masterId) : 'g';
    $propertySegment = 'p' . intval($propertyId);
    return $masterSegment . '/' . $propertySegment . '/';
}

function getPropertyUploadsBaseDir(): string {
    return rtrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, __DIR__ . '/../uploads/propiedades'), DIRECTORY_SEPARATOR);
}

function buildPropertyImageFilePathFromStoredValue(?string $value): ?string {
    $relativePath = normalizePropertyImageRelativePath((string)$value);
    if ($relativePath === '') {
        return null;
    }

    $segments = array_values(array_filter(explode('/', str_replace('\\', '/', $relativePath)), 'strlen'));
    foreach ($segments as $segment) {
        if ($segment === '.' || $segment === '..') {
            return null;
        }
    }

    $baseDir = getPropertyUploadsBaseDir();
    $relativeFilePath = implode(DIRECTORY_SEPARATOR, $segments);
    return $baseDir . DIRECTORY_SEPARATOR . $relativeFilePath;
}

function getPropertyImageStorageCandidates(?string $value): array {
    $raw = trim((string)$value);
    if ($raw === '') {
        return [];
    }

    $variants = [];
    $addVariant = static function (string $candidate) use (&$variants): void {
        $cleaned = trim($candidate);
        if ($cleaned !== '') {
            $variants[$cleaned] = true;
        }
    };

    $addVariant($raw);
    $relativePath = normalizePropertyImageRelativePath($raw);
    if ($relativePath !== '') {
        $addVariant($relativePath);
        $addVariant(buildPropertyImagePublicPath($relativePath));
        $addVariant(ltrim(buildPropertyImagePublicPath($relativePath), '/'));
    }

    return array_keys($variants);
}

/**
 * Obtiene la conexiÃ³n a la base de datos
 */
function getDbConnection(): PDO {
    global $dbConfig;

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        $dbConfig['host'],
        $dbConfig['port'],
        $dbConfig['name'],
        $dbConfig['charset']
    );

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_TIMEOUT            => 10, // Aumentado a 10s para conexiones remotas
    ];

    try {
        return new PDO($dsn, $dbConfig['user'], $dbConfig['pass'], $options);
    } catch (PDOException $e) {
        // Log del error real
        logApiError("Database Connection Error: " . $e->getMessage());
        
        // Lanzar de nuevo para que sea capturado por el script principal
        throw $e;
    }
}

// FunciÃ³n auxiliar para enviar respuesta JSON y salir
function isSafeSqlIdentifier(string $identifier): bool {
    return preg_match('/^[A-Za-z0-9_]+$/', $identifier) === 1;
}

function dbTableExists(PDO $pdo, string $table): bool {
    if (!isSafeSqlIdentifier($table)) {
        return false;
    }

    try {
        $stmt = $pdo->prepare("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1");
        $stmt->execute([$table]);
        if ($stmt->fetchColumn() !== false) {
            return true;
        }
    } catch (Throwable $e) {
        logApiError("dbTableExists information_schema fallback ({$table}): " . $e->getMessage());
    }

    try {
        $sql = sprintf("SHOW TABLES LIKE '%s'", $table);
        $stmt = $pdo->query($sql);
        return (bool)$stmt->fetchColumn();
    } catch (Throwable $e) {
        logApiError("dbTableExists SHOW TABLES fallback ({$table}): " . $e->getMessage());
        return false;
    }
}

function dbColumnExists(PDO $pdo, string $table, string $column): bool {
    if (!isSafeSqlIdentifier($table) || !isSafeSqlIdentifier($column)) {
        return false;
    }

    try {
        $stmt = $pdo->prepare("SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ? LIMIT 1");
        $stmt->execute([$table, $column]);
        if ($stmt->fetchColumn() !== false) {
            return true;
        }
    } catch (Throwable $e) {
        logApiError("dbColumnExists information_schema fallback ({$table}.{$column}): " . $e->getMessage());
    }

    try {
        $sql = sprintf("SHOW COLUMNS FROM `%s` LIKE '%s'", $table, $column);
        $stmt = $pdo->query($sql);
        return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        logApiError("dbColumnExists SHOW COLUMNS fallback ({$table}.{$column}): " . $e->getMessage());
        return false;
    }
}

function logApiError(string $message, array $context = []): void {
    $payload = array_merge([
        'request_id' => getRequestId(),
        'method' => $_SERVER['REQUEST_METHOD'] ?? 'CLI',
        'uri' => $_SERVER['REQUEST_URI'] ?? '',
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    ], $context);

    $encoded = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($encoded === false) {
        $encoded = '{"request_id":"' . getRequestId() . '"}';
    }
    error_log('[HI_API] ' . $message . ' | ' . $encoded);
}

function sendJson($data, $code = 200) {
    if ($code >= 400 && is_array($data) && !array_key_exists('request_id', $data)) {
        $data['request_id'] = getRequestId();
    }
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function getRequestHeaderValue(string $name): string {
    $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    return $_SERVER[$key] ?? '';
}

// Valida API KEY si estÃ¡ configurada (si no hay API_KEY, no bloquea)
function requireApiKey(): void {
    global $apiKey;
    if (!$apiKey) {
        return;
    }
    $headerKey = getRequestHeaderValue('X-API-KEY');
    $auth = getRequestHeaderValue('Authorization');
    $bearer = '';
    if ($auth && stripos($auth, 'Bearer ') === 0) {
        $bearer = trim(substr($auth, 7));
    }
    $provided = $headerKey ?: $bearer;
    if (!$provided || $provided !== $apiKey) {
        sendJson(["success" => false, "message" => "No autorizado"], 401);
    }
}

/**
 * Resuelve el actor autenticado desde datos de request.
 * - Master: auth_uid (+ auth_email opcional)
 * - Team: actor_team_id (+ auth_email opcional)
 *
 * Devuelve null si no se proporcionan credenciales de actor.
 */
function resolveActorContext(PDO $pdo, string $authUid = '', string $authEmail = '', int $actorTeamId = 0): ?array {
    $authUid = trim($authUid);
    $authEmail = trim($authEmail);
    $actorTeamId = intval($actorTeamId);

    if ($authUid === '' && $actorTeamId <= 0) {
        return null;
    }

    $actor = null;

    if ($actorTeamId > 0) {
        if ($authEmail === '') {
            sendJson(["success" => false, "message" => "auth_email requerido para actor de equipo"], 401);
        }
        $stmtTeamActor = $pdo->prepare("SELECT idMiembro, master_id, email, rol, activo FROM equipo WHERE idMiembro = ? LIMIT 1");
        $stmtTeamActor->execute([$actorTeamId]);
        $teamActor = $stmtTeamActor->fetch(PDO::FETCH_ASSOC);
        if (!$teamActor) {
            sendJson(["success" => false, "message" => "Actor de equipo invÃ¡lido"], 403);
        }
        if (intval($teamActor['activo'] ?? 0) !== 1) {
            sendJson(["success" => false, "message" => "Cuenta de equipo inactiva"], 403);
        }
        if ($authEmail !== '' && strcasecmp((string)($teamActor['email'] ?? ''), $authEmail) !== 0) {
            sendJson(["success" => false, "message" => "Actor de equipo no autorizado"], 403);
        }
        $actor = [
            'type' => 'team',
            'team_id' => intval($teamActor['idMiembro'] ?? 0),
            'master_id' => intval($teamActor['master_id'] ?? 0),
            'role' => (string)($teamActor['rol'] ?? 'agent'),
            'email' => (string)($teamActor['email'] ?? '')
        ];
    }

    if ($authUid !== '') {
        $stmtMasterActor = $pdo->prepare("SELECT idMaster, email FROM masters WHERE firebase_uid = ? LIMIT 1");
        $stmtMasterActor->execute([$authUid]);
        $masterActor = $stmtMasterActor->fetch(PDO::FETCH_ASSOC);
        if (!$masterActor) {
            sendJson(["success" => false, "message" => "Actor master invÃ¡lido"], 403);
        }
        if ($authEmail !== '' && strcasecmp((string)($masterActor['email'] ?? ''), $authEmail) !== 0) {
            sendJson(["success" => false, "message" => "Actor master no autorizado"], 403);
        }
        $masterId = intval($masterActor['idMaster'] ?? 0);
        if ($masterId <= 0) {
            sendJson(["success" => false, "message" => "Actor master invÃ¡lido"], 403);
        }
        if ($actor !== null && intval($actor['master_id'] ?? 0) !== $masterId) {
            sendJson(["success" => false, "message" => "Actor inconsistente"], 403);
        }
        if ($actor === null) {
            $actor = [
                'type' => 'master',
                'team_id' => null,
                'master_id' => $masterId,
                'role' => 'master',
                'email' => (string)($masterActor['email'] ?? '')
            ];
        }
    }

    return $actor;
}

function requireActorContext(PDO $pdo, string $authUid = '', string $authEmail = '', int $actorTeamId = 0): array {
    $actor = resolveActorContext($pdo, $authUid, $authEmail, $actorTeamId);
    if (!$actor) {
        sendJson(["success" => false, "message" => "Actor requerido"], 401);
    }
    return $actor;
}

function assertActorMasterScope(array $actor, int $masterId): void {
    if ($masterId <= 0) {
        sendJson(["success" => false, "message" => "master_id invÃ¡lido"], 400);
    }
    if (intval($actor['master_id'] ?? 0) !== intval($masterId)) {
        sendJson(["success" => false, "message" => "No autorizado para este master"], 403);
    }
}

function assertActorIsMaster(array $actor): void {
    if (($actor['type'] ?? '') !== 'master') {
        sendJson(["success" => false, "message" => "AcciÃ³n permitida solo para cuenta master"], 403);
    }
}

// FunciÃ³n para manejar errores fatales que no son capturados por try-catch
set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    logApiError('PHP runtime warning', [
        'severity' => $severity,
        'message' => $message,
        'file' => $file,
        'line' => $line
    ]);
    return false;
});

set_exception_handler(function (Throwable $e): void {
    logApiError('Uncaught exception', [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);

    if (!headers_sent()) {
        sendJson([
            "success" => false,
            "message" => "Error interno del servidor"
        ], 500);
    }
});

function fatalHandler() {
    $error = error_get_last();
    if ($error !== NULL && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        $message = "Error Fatal PHP: " . $error['message'];
        logApiError($message, [
            'file' => $error['file'] ?? '',
            'line' => $error['line'] ?? 0,
            'type' => $error['type'] ?? 0
        ]);
        if (!headers_sent()) {
            sendJson([
                "success" => false,
                "message" => "Error interno del servidor",
                "error" => $message
            ], 500);
        }
    }
}
register_shutdown_function('fatalHandler');
