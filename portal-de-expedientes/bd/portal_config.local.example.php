<?php
declare(strict_types=1);

return [
    // Cambia estos valores por los del servidor real.
    'host' => 'TU_HOST_MYSQL',
    'port' => 3306,
    'database' => 'administrador_expedientes',
    'username' => 'hya_expedientes_app',
    'password' => 'TU_PASSWORD_MYSQL',
    'charset' => 'utf8mb4',

    // En desarrollo local puedes usar:
    // http://localhost:3000
    // En produccion cambia esto por la URL publica final del portal.
    'project_base_url' => 'http://localhost:3000',

    // Si no cambias uploads, puedes dejar estas dos rutas tal cual.
    'uploads_directory' => __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'expedientes',
    'uploads_public_prefix' => 'bd/uploads/expedientes',
];
