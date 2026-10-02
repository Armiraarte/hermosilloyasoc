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

    // URL publica principal del sistema de expedientes.
    // En desarrollo local puedes usar http://localhost:3001
    'project_base_url' => 'https://expedientes.hermosilloyasoc.com',

    // Si no cambias uploads, puedes dejar estas dos rutas tal cual.
    'uploads_directory' => __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'expedientes',
    'uploads_public_prefix' => 'bd/uploads/expedientes',
];
