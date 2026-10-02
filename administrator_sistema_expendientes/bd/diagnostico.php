<?php

header('Content-Type: application/json; charset=utf-8');

$sessionSavePath = session_save_path();
$resolvedSessionPath = $sessionSavePath !== '' ? $sessionSavePath : sys_get_temp_dir();
$canWriteSessionPath = $resolvedSessionPath !== '' && is_dir($resolvedSessionPath) && is_writable($resolvedSessionPath);

echo json_encode([
    'ok' => true,
    'php_version' => PHP_VERSION,
    'php_sapi' => PHP_SAPI,
    'document_root' => isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] : null,
    'script_filename' => isset($_SERVER['SCRIPT_FILENAME']) ? $_SERVER['SCRIPT_FILENAME'] : __FILE__,
    'extensions' => [
        'pdo' => extension_loaded('pdo'),
        'pdo_mysql' => extension_loaded('pdo_mysql'),
        'mysqli' => extension_loaded('mysqli'),
        'mbstring' => extension_loaded('mbstring'),
        'iconv' => extension_loaded('iconv'),
        'json' => extension_loaded('json'),
    ],
    'session' => [
        'save_path' => $resolvedSessionPath,
        'save_path_writable' => $canWriteSessionPath,
    ],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
