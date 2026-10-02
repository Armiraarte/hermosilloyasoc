<?php
declare(strict_types=1);

function portalConfigEnv(string $key, mixed $default = null): mixed
{
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
    if ($value === false || $value === null || $value === '') {
        return $default;
    }

    return $value;
}

function portalDefaultProjectBaseUrl(): string
{
    $host = trim((string) ($_SERVER['HTTP_HOST'] ?? ''));
    if ($host === '') {
        return 'http://localhost';
    }

    $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $scheme = $isHttps ? 'https' : 'http';

    return $scheme . '://' . $host;
}

function portalDbConfig(): array
{
    $config = [
        'host' => (string) portalConfigEnv('PORTAL_DB_HOST', portalConfigEnv('DB_HOST', '2.25.84.101')),
        'port' => (int) portalConfigEnv('PORTAL_DB_PORT', portalConfigEnv('DB_PORT', 3306)),
        'database' => (string) portalConfigEnv('PORTAL_DB_DATABASE', portalConfigEnv('DB_NAME', 'administrador_expedientes')),
        'username' => (string) portalConfigEnv('PORTAL_DB_USERNAME', portalConfigEnv('DB_USER', 'hya_expedientes_app')),
        'password' => (string) portalConfigEnv('PORTAL_DB_PASSWORD', portalConfigEnv('DB_PASS', '')),
        'charset' => (string) portalConfigEnv('PORTAL_DB_CHARSET', 'utf8mb4'),
        'project_base_url' => (string) portalConfigEnv('PORTAL_PROJECT_BASE_URL', portalDefaultProjectBaseUrl()),
        'uploads_directory' => (string) portalConfigEnv(
            'PORTAL_UPLOADS_DIRECTORY',
            __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'expedientes'
        ),
        'uploads_public_prefix' => (string) portalConfigEnv('PORTAL_UPLOADS_PUBLIC_PREFIX', 'bd/uploads/expedientes'),
    ];

    $localConfigCandidates = array_filter([
        trim((string) portalConfigEnv('PORTAL_CONFIG_FILE', '')),
        __DIR__ . DIRECTORY_SEPARATOR . 'portal_config.local.php',
        __DIR__ . DIRECTORY_SEPARATOR . 'config.local.php',
        dirname(__DIR__) . DIRECTORY_SEPARATOR . 'administrator_sistema_expendientes' . DIRECTORY_SEPARATOR . 'bd' . DIRECTORY_SEPARATOR . 'config.local.php',
    ]);

    foreach (array_unique($localConfigCandidates) as $localConfigPath) {
        if (is_file($localConfigPath)) {
            $localConfig = require $localConfigPath;
            if (is_array($localConfig)) {
                $config = array_replace($config, $localConfig);
            }

            break;
        }
    }

    return $config;
}
