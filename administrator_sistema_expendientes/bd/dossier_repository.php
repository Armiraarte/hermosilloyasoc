<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';

function portalDossierStatuses(): array
{
    return portalLegalControlStatuses();
}

function portalDossierStatusLabels(): array
{
    return portalLegalControlStatusLabels();
}

function portalLegalControlStatuses(): array
{
    return [
        'ESPERANDO_ACUERDO',
        'ESP_REG_PS_AG',
        'FINALIZADO',
        'ESP_TERMINO',
        'ESP_AL_CLIENTE',
        'PENDIENTE_SEGUIMIENTO',
        'AUD_DILIG_PROXIMA',
        'PENDIENTE',
        'REALIZADO',
    ];
}

function portalLegalControlStatusLabels(): array
{
    return [
        'ESPERANDO_ACUERDO' => 'Esperando Acuerdo',
        'ESP_REG_PS_AG' => 'Esp. Reg. PS/AG',
        'FINALIZADO' => 'Finalizado',
        'ESP_TERMINO' => 'Esp. Término',
        'ESP_AL_CLIENTE' => 'Esp. al cliente',
        'PENDIENTE_SEGUIMIENTO' => 'Pendiente/Seguimiento',
        'AUD_DILIG_PROXIMA' => 'Aud/Dilig Próxima',
        'PENDIENTE' => 'Pendiente',
        'REALIZADO' => 'Realizado',
    ];
}

function portalLegalControlDefaultStatus(): string
{
    return 'PENDIENTE_SEGUIMIENTO';
}

function portalDossierDefaultStatus(): string
{
    return portalLegalControlDefaultStatus();
}

function portalLegacyDossierStatusMap(): array
{
    return [
        'RECIBIDO' => portalDossierDefaultStatus(),
        'EN_REVISION' => portalDossierDefaultStatus(),
        'EN_PROCESO' => portalDossierDefaultStatus(),
        'RESUELTO' => 'FINALIZADO',
        'CERRADO' => 'FINALIZADO',
    ];
}

function portalResolvedLegalControlStatuses(): array
{
    return ['FINALIZADO', 'REALIZADO'];
}

function portalIsResolvedLegalControlStatus(string $legalStatus): bool
{
    return in_array($legalStatus, portalResolvedLegalControlStatuses(), true);
}

function portalIsResolvedDossierStatus(string $status): bool
{
    return in_array($status, ['RESUELTO', 'CERRADO'], true);
}

function portalMapLegalControlStatusToDossierStatus(string $legalStatus, ?string $currentStatus = null): string
{
    $normalizedLegalStatus = portalNormalizeLegalControlStatus($legalStatus);

    if (portalIsResolvedLegalControlStatus($normalizedLegalStatus)) {
        return $currentStatus === 'CERRADO' ? 'CERRADO' : 'RESUELTO';
    }

    return 'EN_PROCESO';
}

function portalMapDossierStatusToLegalControlStatus(string $status, ?string $currentLegalStatus = null): string
{
    $normalizedStatus = portalNormalizeDossierStatus($status);
    $normalizedCurrentLegalStatus = $currentLegalStatus !== null && trim($currentLegalStatus) !== ''
        ? portalNormalizeLegalControlStatus($currentLegalStatus)
        : null;

    if (portalIsResolvedDossierStatus($normalizedStatus)) {
        if ($normalizedCurrentLegalStatus !== null && portalIsResolvedLegalControlStatus($normalizedCurrentLegalStatus)) {
            return $normalizedCurrentLegalStatus;
        }

        return 'FINALIZADO';
    }

    if ($normalizedCurrentLegalStatus !== null && !portalIsResolvedLegalControlStatus($normalizedCurrentLegalStatus)) {
        return $normalizedCurrentLegalStatus;
    }

    return portalLegalControlDefaultStatus();
}

function portalResolveLinkedDossierStatuses(
    ?string $requestedStatus,
    ?string $requestedLegalStatus,
    ?string $currentStatus = null,
    ?string $currentLegalStatus = null
): array {
    if ($requestedLegalStatus !== null && trim($requestedLegalStatus) !== '') {
        $nextLinkedStatus = portalNormalizeLegalControlStatus($requestedLegalStatus);
    } elseif ($requestedStatus !== null && trim($requestedStatus) !== '') {
        $nextLinkedStatus = portalNormalizeDossierStatus($requestedStatus);
    } elseif ($currentLegalStatus !== null && trim($currentLegalStatus) !== '') {
        $nextLinkedStatus = portalNormalizeLegalControlStatus($currentLegalStatus);
    } elseif ($currentStatus !== null && trim($currentStatus) !== '') {
        $nextLinkedStatus = portalNormalizeDossierStatus($currentStatus);
    } else {
        $nextLinkedStatus = portalDossierDefaultStatus();
    }

    return [
        'status' => $nextLinkedStatus,
        'legalStatus' => $nextLinkedStatus,
    ];
}

function portalLegalControlEnumSql(): string
{
    return implode(', ', array_map(
        static fn(string $status): string => "'" . $status . "'",
        portalLegalControlStatuses()
    ));
}

function portalLegacyDossierEnumSql(): string
{
    return implode(', ', array_map(
        static fn(string $status): string => "'" . $status . "'",
        array_keys(portalLegacyDossierStatusMap())
    ));
}

function portalDossierMigrationEnumSql(): string
{
    $values = array_values(array_unique([
        ...array_keys(portalLegacyDossierStatusMap()),
        ...portalDossierStatuses(),
    ]));

    return implode(', ', array_map(
        static fn(string $status): string => "'" . $status . "'",
        $values
    ));
}

function portalCalendarEventTypes(): array
{
    return ['AUDIENCIA', 'VENCIMIENTO', 'CITA', 'RECORDATORIO'];
}

function portalNormalizeAsciiText(string $value): string
{
    $normalized = trim($value);
    if ($normalized === '') {
        return '';
    }

    $converted = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $normalized);
    if ($converted !== false) {
        $normalized = $converted;
    }

    return strtoupper($normalized);
}

function portalAlphaNumericToken(string $value): string
{
    $normalized = portalNormalizeAsciiText($value);
    return preg_replace('/[^A-Z0-9]+/', '', $normalized) ?? '';
}

function portalBuildCodeToken(string $value, int $length, string $fallback): string
{
    $token = portalAlphaNumericToken($value);
    if ($token === '') {
        $token = $fallback;
    }

    return substr(str_pad($token, $length, $fallback), 0, $length);
}

function portalBuildInitialsToken(string $value, int $length, string $fallback): string
{
    $normalized = portalNormalizeAsciiText($value);
    preg_match_all('/[A-Z0-9]+/', $normalized, $matches);
    $parts = $matches[0] ?? [];

    $token = '';
    foreach ($parts as $part) {
        $token .= substr($part, 0, 1);
        if (strlen($token) >= $length) {
            break;
        }
    }

    if ($token === '' && $parts !== []) {
        $token = substr((string) $parts[0], 0, $length);
    }

    if ($token === '') {
        $token = $fallback;
    }

    return substr(str_pad($token, $length, $fallback), 0, $length);
}

function portalFindFirstFilledValue(array $source, array $keys, string $fallback = ''): string
{
    foreach ($keys as $key) {
        $value = trim((string) ($source[$key] ?? ''));
        if ($value !== '') {
            return $value;
        }
    }

    return $fallback;
}

function portalDossierCodeSource(array $source): string
{
    return portalFindFirstFilledValue(
        $source,
        ['category', 'title', 'judicialDistrict', 'courtNumber', 'categoria', 'titulo_juicio', 'partido_judicial', 'juzgado'],
        'GENERAL'
    );
}

function portalAccessCodeSource(array $source): string
{
    return portalFindFirstFilledValue(
        $source,
        ['clientName', 'nombre_completo', 'title', 'titulo_juicio', 'clientEmail', 'correo'],
        'CLIENTE'
    );
}

function portalStorageSegment(string $value, string $fallback): string
{
    $normalized = strtolower(portalNormalizeAsciiText($value));
    $segment = preg_replace('/[^a-z0-9]+/', '-', $normalized) ?? '';
    $segment = trim($segment, '-');

    return $segment !== '' ? $segment : $fallback;
}

function portalNormalizeDossierCode(?string $value, bool $allowEmpty = false): string
{
    $normalized = strtoupper(trim((string) $value));
    if ($normalized === '') {
        if ($allowEmpty) {
            return '';
        }

        throw new InvalidArgumentException('Debes enviar el codigo del expediente.');
    }

    if (preg_match('/^[A-Z0-9-]{3,60}$/', $normalized) !== 1) {
        throw new InvalidArgumentException('El codigo del expediente solo puede contener letras, numeros y guiones.');
    }

    return $normalized;
}

function portalNormalizeAccessCode(?string $value): string
{
    $normalized = strtoupper(trim((string) $value));
    if (preg_match('/^[A-Z0-9]{7}$/', $normalized) !== 1) {
        throw new InvalidArgumentException('El codigo de acceso debe tener exactamente 7 caracteres alfanumericos.');
    }

    return $normalized;
}

function portalNormalizeOptionalEmail(?string $value): ?string
{
    $email = trim((string) $value);
    if ($email === '') {
        return null;
    }

    if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        throw new InvalidArgumentException('El correo del cliente no tiene un formato valido.');
    }

    return $email;
}

function portalNormalizeDossierStatus(?string $value): string
{
    $status = strtoupper(trim((string) $value));
    if (!in_array($status, portalDossierStatuses(), true)) {
        throw new InvalidArgumentException('El estatus del expediente no es valido.');
    }

    return $status;
}

function portalNormalizeLegalControlStatus(?string $value): string
{
    $status = strtoupper(trim((string) $value));
    if (!in_array($status, portalLegalControlStatuses(), true)) {
        throw new InvalidArgumentException('El estado juridico no es valido.');
    }

    return $status;
}

function portalNormalizePendingNotes(?string $value): ?string
{
    $normalized = trim((string) $value);
    return $normalized !== '' ? $normalized : null;
}

function portalNormalizeCalendarEventType(?string $value): string
{
    $type = strtoupper(trim((string) $value));
    if (!in_array($type, portalCalendarEventTypes(), true)) {
        throw new InvalidArgumentException('El tipo de evento de calendario no es valido.');
    }

    return $type;
}

function portalEnsureLegalControlSchema(PDO $pdo): void
{
    static $isEnsured = false;

    if ($isEnsured) {
        return;
    }

    $dossierStatusColumn = $pdo->query("SHOW COLUMNS FROM expedientes LIKE 'estatus'")->fetch(PDO::FETCH_ASSOC) ?: null;
    $legalStatusColumn = $pdo->query("SHOW COLUMNS FROM expedientes LIKE 'estado_juridico'")->fetch(PDO::FETCH_ASSOC) ?: null;
    $pendingNotesColumn = $pdo->query("SHOW COLUMNS FROM expedientes LIKE 'notas_pendientes'")->fetch(PDO::FETCH_ASSOC) ?: null;
    $hadLegalStatusColumn = $legalStatusColumn !== null;
    $hasLegalStatusColumn = $legalStatusColumn !== null;
    $hasPendingNotesColumn = $pendingNotesColumn !== null;

    if (!$hasLegalStatusColumn || !$hasPendingNotesColumn) {
        $alterParts = [];

        if (!$hasLegalStatusColumn) {
            $alterParts[] = sprintf(
                "ADD COLUMN estado_juridico ENUM(%s) NOT NULL DEFAULT '%s' AFTER estatus",
                portalLegalControlEnumSql(),
                portalLegalControlDefaultStatus()
            );
        }

        if (!$hasPendingNotesColumn) {
            $columnPosition = $hasLegalStatusColumn ? 'AFTER estado_juridico' : 'AFTER estatus';
            $alterParts[] = sprintf('ADD COLUMN notas_pendientes TEXT NULL %s', $columnPosition);
        }

        try {
            $pdo->exec('ALTER TABLE expedientes ' . implode(', ', $alterParts));
        } catch (Throwable $exception) {
            $hasLegalStatusColumn = $pdo->query("SHOW COLUMNS FROM expedientes LIKE 'estado_juridico'")->fetch() !== false;
            $hasPendingNotesColumn = $pdo->query("SHOW COLUMNS FROM expedientes LIKE 'notas_pendientes'")->fetch() !== false;

            if (!$hasLegalStatusColumn || !$hasPendingNotesColumn) {
                throw $exception;
            }
        }
    }

    $legacyStatuses = [
        'AUDIENCIA_DILIGENCIA_PROXIMA' => 'AUD_DILIG_PROXIMA',
        'ESPERANDO_AL_CLIENTE' => 'ESP_AL_CLIENTE',
        'CONCLUIDO' => 'FINALIZADO',
    ];
    $currentEnumType = strtoupper((string) ($legalStatusColumn['Type'] ?? ''));
    $requiresEnumMigration = !$hasLegalStatusColumn
        || !str_contains($currentEnumType, 'ESP_REG_PS_AG')
        || !str_contains($currentEnumType, 'REALIZADO')
        || str_contains($currentEnumType, 'AUDIENCIA_DILIGENCIA_PROXIMA')
        || str_contains($currentEnumType, 'CONCLUIDO');

    if ($requiresEnumMigration) {
        $cases = [];
        $params = [];
        $allowedValues = portalLegalControlStatuses();

        foreach ($legacyStatuses as $legacyStatus => $nextStatus) {
            $cases[] = sprintf("WHEN '%s' THEN '%s'", $legacyStatus, $nextStatus);
        }

        foreach ($allowedValues as $allowedValue) {
            $cases[] = sprintf("WHEN '%s' THEN '%s'", $allowedValue, $allowedValue);
        }

        $pdo->exec(sprintf(
            "
            UPDATE expedientes
            SET estado_juridico = CASE estado_juridico
                %s
                ELSE '%s'
            END
            ",
            implode("\n                ", $cases),
            portalLegalControlDefaultStatus()
        ));

        $pdo->exec(sprintf(
            "ALTER TABLE expedientes MODIFY COLUMN estado_juridico ENUM(%s) NOT NULL DEFAULT '%s'",
            portalLegalControlEnumSql(),
            portalLegalControlDefaultStatus()
        ));
    }

    $currentDossierEnumType = strtoupper((string) ($dossierStatusColumn['Type'] ?? ''));
    $requiresDossierEnumMigration = $dossierStatusColumn === null
        || !str_contains($currentDossierEnumType, 'ESP_REG_PS_AG')
        || !str_contains($currentDossierEnumType, 'REALIZADO')
        || str_contains($currentDossierEnumType, 'RECIBIDO')
        || str_contains($currentDossierEnumType, 'EN_REVISION')
        || str_contains($currentDossierEnumType, 'EN_PROCESO')
        || str_contains($currentDossierEnumType, 'RESUELTO')
        || str_contains($currentDossierEnumType, 'CERRADO');

    if ($requiresDossierEnumMigration) {
        $dossierStatusCases = [];

        $pdo->exec(sprintf(
            "ALTER TABLE expedientes MODIFY COLUMN estatus ENUM(%s) NOT NULL DEFAULT '%s'",
            portalDossierMigrationEnumSql(),
            portalDossierDefaultStatus()
        ));

        foreach (portalLegacyDossierStatusMap() as $legacyStatus => $nextStatus) {
            $dossierStatusCases[] = sprintf("WHEN '%s' THEN '%s'", $legacyStatus, $nextStatus);
        }

        foreach (portalDossierStatuses() as $allowedValue) {
            $dossierStatusCases[] = sprintf("WHEN '%s' THEN '%s'", $allowedValue, $allowedValue);
        }

        if ($hadLegalStatusColumn) {
            $pdo->exec(sprintf(
                "
                UPDATE expedientes
                SET estatus = CASE
                    WHEN estado_juridico IN (%s) THEN estado_juridico
                    ELSE CASE estatus
                        %s
                        ELSE '%s'
                    END
                END
                ",
                portalLegalControlEnumSql(),
                implode("\n                        ", $dossierStatusCases),
                portalDossierDefaultStatus()
            ));
        } else {
            $pdo->exec(sprintf(
                "
                UPDATE expedientes
                SET estatus = CASE estatus
                    %s
                    ELSE '%s'
                END
                ",
                implode("\n                    ", $dossierStatusCases),
                portalDossierDefaultStatus()
            ));
        }

        $pdo->exec(sprintf(
            "ALTER TABLE expedientes MODIFY COLUMN estatus ENUM(%s) NOT NULL DEFAULT '%s'",
            portalLegalControlEnumSql(),
            portalDossierDefaultStatus()
        ));
    }

    if ($hadLegalStatusColumn) {
        $pdo->exec("
            UPDATE expedientes
            SET estatus = estado_juridico
            WHERE estado_juridico IS NOT NULL
              AND estatus <> estado_juridico
        ");
    }

    $hasLegalStatusIndex = $pdo->query("SHOW INDEX FROM expedientes WHERE Key_name = 'idx_expedientes_estado_juridico'")->fetch() !== false;
    if (!$hasLegalStatusIndex) {
        $pdo->exec('ALTER TABLE expedientes ADD KEY idx_expedientes_estado_juridico (estado_juridico)');
    }

    $isEnsured = true;
}

function portalTouchDossier(PDO $pdo, int $dossierId): void
{
    $statement = $pdo->prepare('UPDATE expedientes SET ultima_actualizacion = NOW() WHERE id = :id');
    $statement->execute([
        'id' => $dossierId,
    ]);
}

function portalInsertHistoryRecord(
    PDO $pdo,
    int $dossierId,
    int $adminId,
    string $title,
    string $description = '',
    ?string $movementDate = null
): string {
    $normalizedDate = portalNormalizeDateTime($movementDate) ?? date('Y-m-d H:i:s');
    $reference = portalGenerateReference('ev');

    $statement = $pdo->prepare("
        INSERT INTO expediente_historial (
            expediente_id,
            admin_id,
            referencia_fase,
            titulo_movimiento,
            descripcion_movimiento,
            fecha_movimiento
        ) VALUES (
            :expediente_id,
            :admin_id,
            :referencia_fase,
            :titulo_movimiento,
            :descripcion_movimiento,
            :fecha_movimiento
        )
    ");
    $statement->execute([
        'expediente_id' => $dossierId,
        'admin_id' => $adminId,
        'referencia_fase' => $reference,
        'titulo_movimiento' => trim($title),
        'descripcion_movimiento' => trim($description) !== '' ? trim($description) : null,
        'fecha_movimiento' => $normalizedDate,
    ]);

    portalTouchDossier($pdo, $dossierId);

    return $reference;
}

function portalRequiredDossierFields(): array
{
    return [
        'clientName',
        'clientPhone',
        'title',
        'plaintiff',
        'defendant',
        'courtNumber',
        'judicialDistrict',
        'description',
        'category',
    ];
}

function portalValidateDossierPayload(array $payload): void
{
    foreach (portalRequiredDossierFields() as $field) {
        if (trim((string) ($payload[$field] ?? '')) === '') {
            throw new InvalidArgumentException(sprintf('Falta el campo requerido: %s', $field));
        }
    }

    if (trim((string) ($payload['clientAccessCode'] ?? '')) !== '') {
        portalNormalizeAccessCode((string) ($payload['clientAccessCode'] ?? ''));
    }
    portalNormalizeOptionalEmail((string) ($payload['clientEmail'] ?? ''));
    portalNormalizeDossierStatus((string) ($payload['status'] ?? portalDossierDefaultStatus()));

    if (trim((string) ($payload['legalStatus'] ?? '')) !== '') {
        portalNormalizeLegalControlStatus((string) ($payload['legalStatus'] ?? ''));
    }
}

function portalFetchDossierRow(PDO $pdo, string $dossierCode): ?array
{
    portalEnsureLegalControlSchema($pdo);

    $statement = $pdo->prepare("
        SELECT
            e.id AS dossier_id,
            e.codigo_expediente,
            e.cliente_id,
            e.titulo_juicio,
            e.descripcion,
            e.actor,
            e.demandado,
            e.juzgado,
            e.partido_judicial,
            e.categoria,
            e.estatus,
            e.estado_juridico,
            e.notas_pendientes,
            e.asignado_admin_id,
            e.fecha_apertura,
            e.ultima_actualizacion,
            c.nombre_completo,
            c.telefono,
            c.correo,
            c.codigo_acceso,
            a.nombre AS asignado_admin_nombre
        FROM expedientes e
        INNER JOIN clientes c ON c.id = e.cliente_id
        LEFT JOIN administradores a ON a.id = e.asignado_admin_id
        WHERE e.codigo_expediente = :codigo
        LIMIT 1
    ");
    $statement->execute(['codigo' => portalNormalizeDossierCode($dossierCode)]);
    $row = $statement->fetch();

    return $row === false ? null : $row;
}

function portalRequireDossierRow(PDO $pdo, string $dossierCode): array
{
    $row = portalFetchDossierRow($pdo, $dossierCode);
    if ($row === null) {
        throw new RuntimeException('No se encontro el expediente solicitado.');
    }

    return $row;
}

function portalFetchDossiers(PDO $pdo, ?string $search = null, ?string $exactCode = null): array
{
    portalEnsureLegalControlSchema($pdo);

    $whereParts = [];
    $params = [];

    if ($exactCode !== null && trim($exactCode) !== '') {
        $whereParts[] = 'e.codigo_expediente = :exactCode';
        $params['exactCode'] = portalNormalizeDossierCode($exactCode);
    }

    if ($search !== null && trim($search) !== '') {
        $whereParts[] = '(
            e.codigo_expediente LIKE :search
            OR c.codigo_acceso LIKE :search
            OR c.nombre_completo LIKE :search
            OR e.titulo_juicio LIKE :search
            OR e.juzgado LIKE :search
            OR e.actor LIKE :search
            OR e.demandado LIKE :search
            OR e.estado_juridico LIKE :search
            OR e.notas_pendientes LIKE :search
        )';
        $params['search'] = '%' . trim($search) . '%';
    }

    $whereSql = $whereParts !== [] ? implode(' AND ', $whereParts) : '1=1';

    $statement = $pdo->prepare("
        SELECT
            e.id AS expediente_db_id,
            e.codigo_expediente,
            e.titulo_juicio,
            e.descripcion,
            e.actor,
            e.demandado,
            e.juzgado,
            e.partido_judicial,
            e.categoria,
            e.estatus,
            e.estado_juridico,
            e.notas_pendientes,
            e.asignado_admin_id,
            e.fecha_registro,
            e.ultima_actualizacion,
            c.id AS cliente_db_id,
            c.nombre_completo,
            c.telefono,
            c.correo,
            c.codigo_acceso,
            a.nombre AS asignado_admin_nombre
        FROM expedientes e
        INNER JOIN clientes c ON c.id = e.cliente_id
        LEFT JOIN administradores a ON a.id = e.asignado_admin_id
        WHERE {$whereSql}
        ORDER BY e.ultima_actualizacion DESC, e.id DESC
    ");
    $statement->execute($params);
    $rows = $statement->fetchAll();

    if ($rows === []) {
        return [];
    }

    $dossiersById = [];
    $dossierIds = [];

    foreach ($rows as $row) {
        $dbId = (int) $row['expediente_db_id'];
        $dossierIds[] = $dbId;
        $dossiersById[$dbId] = [
            'dbId' => $dbId,
            'id' => (string) $row['codigo_expediente'],
            'clientName' => (string) $row['nombre_completo'],
            'clientPhone' => (string) $row['telefono'],
            'clientEmail' => (string) ($row['correo'] ?? ''),
            'clientAccessCode' => (string) $row['codigo_acceso'],
            'courtNumber' => (string) ($row['juzgado'] ?? ''),
            'judicialDistrict' => (string) ($row['partido_judicial'] ?? ''),
            'plaintiff' => (string) $row['actor'],
            'defendant' => (string) $row['demandado'],
            'createdAt' => portalIsoDateTime((string) $row['fecha_registro']),
            'updatedAt' => portalIsoDateTime((string) $row['ultima_actualizacion']),
            'assignedAdminId' => $row['asignado_admin_id'] !== null ? (int) $row['asignado_admin_id'] : null,
            'assignedAdminName' => (string) ($row['asignado_admin_nombre'] ?? ''),
            'status' => (string) $row['estatus'],
            'legalStatus' => (string) ($row['estado_juridico'] ?? portalLegalControlDefaultStatus()),
            'pendingNotes' => (string) ($row['notas_pendientes'] ?? ''),
            'title' => (string) $row['titulo_juicio'],
            'description' => (string) ($row['descripcion'] ?? ''),
            'category' => (string) ($row['categoria'] ?? ''),
            'calendar' => [],
            'history' => [],
            'files' => [],
        ];
    }

    $placeholders = implode(', ', array_fill(0, count($dossierIds), '?'));

    $historyStatement = $pdo->prepare("
        SELECT
            h.expediente_id,
            h.referencia_fase,
            h.titulo_movimiento,
            h.descripcion_movimiento,
            h.fecha_movimiento,
            a.nombre AS admin_nombre
        FROM expediente_historial h
        LEFT JOIN administradores a ON a.id = h.admin_id
        WHERE h.expediente_id IN ({$placeholders})
        ORDER BY h.fecha_movimiento ASC, h.id ASC
    ");
    $historyStatement->execute($dossierIds);
    foreach ($historyStatement->fetchAll() as $historyRow) {
        $expedienteId = (int) $historyRow['expediente_id'];
        $dossiersById[$expedienteId]['history'][] = [
            'id' => (string) $historyRow['referencia_fase'],
            'date' => portalIsoDateTime((string) $historyRow['fecha_movimiento']),
            'title' => (string) $historyRow['titulo_movimiento'],
            'description' => (string) ($historyRow['descripcion_movimiento'] ?? ''),
            'kind' => portalInferHistoryKind(
                (string) $historyRow['titulo_movimiento'],
                (string) ($historyRow['descripcion_movimiento'] ?? '')
            ),
            'adminName' => (string) ($historyRow['admin_nombre'] ?? ''),
        ];
    }

    $calendarStatement = $pdo->prepare("
        SELECT
            c.expediente_id,
            c.referencia_evento,
            c.tipo_evento,
            c.titulo_evento,
            c.descripcion_evento,
            c.fecha_evento,
            c.ubicacion,
            c.visible_cliente
        FROM expediente_calendario c
        WHERE c.expediente_id IN ({$placeholders})
        ORDER BY c.fecha_evento ASC, c.id ASC
    ");
    $calendarStatement->execute($dossierIds);
    foreach ($calendarStatement->fetchAll() as $calendarRow) {
        $expedienteId = (int) $calendarRow['expediente_id'];
        $dossiersById[$expedienteId]['calendar'][] = [
            'id' => (string) $calendarRow['referencia_evento'],
            'title' => (string) $calendarRow['titulo_evento'],
            'description' => (string) ($calendarRow['descripcion_evento'] ?? ''),
            'date' => portalIsoDateTime((string) $calendarRow['fecha_evento']),
            'type' => (string) $calendarRow['tipo_evento'],
            'location' => (string) ($calendarRow['ubicacion'] ?? ''),
            'isClientVisible' => (bool) $calendarRow['visible_cliente'],
        ];
    }

    $filesStatement = $pdo->prepare("
        SELECT
            a.expediente_id,
            a.referencia_archivo,
            a.nombre_original,
            a.ruta_archivo,
            a.tamano_bytes,
            a.fecha_registro,
            a.visible_cliente,
            h.referencia_fase
        FROM expediente_archivos a
        LEFT JOIN expediente_historial h ON h.id = a.historial_id
        WHERE a.expediente_id IN ({$placeholders})
        ORDER BY a.fecha_registro ASC, a.id ASC
    ");
    $filesStatement->execute($dossierIds);
    foreach ($filesStatement->fetchAll() as $fileRow) {
        $expedienteId = (int) $fileRow['expediente_id'];
        $storedPath = (string) $fileRow['ruta_archivo'];
        $diskPath = portalResolveStoredFileDiskPath($storedPath);
        $fileIsAvailable = $diskPath !== null && is_file($diskPath);
        $dossiersById[$expedienteId]['files'][] = [
            'id' => (string) $fileRow['referencia_archivo'],
            'name' => (string) $fileRow['nombre_original'],
            'date' => portalIsoDateTime((string) $fileRow['fecha_registro']),
            'size' => (int) $fileRow['tamano_bytes'],
            'phaseId' => $fileRow['referencia_fase'] !== null ? (string) $fileRow['referencia_fase'] : null,
            'isClientVisible' => (bool) $fileRow['visible_cliente'],
            'url' => $fileIsAvailable ? portalBuildPublicFileUrl($storedPath) : '',
            'isAvailable' => $fileIsAvailable,
        ];
    }

    return array_values(array_map(static function (array $dossier) {
        unset($dossier['dbId']);
        return $dossier;
    }, $dossiersById));
}

function portalFetchSingleDossier(PDO $pdo, string $code): ?array
{
    $dossiers = portalFetchDossiers($pdo, null, trim($code));
    return $dossiers[0] ?? null;
}

function portalPrepareDossierForClient(array $dossier): array
{
    $dossier['calendar'] = array_values(array_filter(
        $dossier['calendar'] ?? [],
        static function (array $entry): bool {
            return (bool) ($entry['isClientVisible'] ?? false);
        }
    ));
    $dossier['files'] = array_values(array_filter(
        $dossier['files'] ?? [],
        static function (array $file): bool {
            return (bool) ($file['isClientVisible'] ?? false);
        }
    ));

    return $dossier;
}

function portalFetchPublicDossierByCodes(PDO $pdo, string $dossierCode, string $accessCode): ?array
{
    $normalizedDossierCode = portalNormalizeDossierCode($dossierCode);
    $normalizedAccessCode = portalNormalizeAccessCode($accessCode);

    $statement = $pdo->prepare("
        SELECT e.codigo_expediente
        FROM expedientes e
        INNER JOIN clientes c ON c.id = e.cliente_id
        WHERE UPPER(e.codigo_expediente) = :codigo_expediente
          AND UPPER(c.codigo_acceso) = :codigo_acceso
        LIMIT 1
    ");
    $statement->execute([
        'codigo_expediente' => $normalizedDossierCode,
        'codigo_acceso' => $normalizedAccessCode,
    ]);

    $matchedDossierCode = $statement->fetchColumn();
    if ($matchedDossierCode === false) {
        return null;
    }

    $dossier = portalFetchSingleDossier($pdo, (string) $matchedDossierCode);
    return $dossier !== null ? portalPrepareDossierForClient($dossier) : null;
}

function portalFetchPublicDossiers(PDO $pdo, string $query, string $accessCode): array
{
    $normalizedQuery = strtoupper(trim($query));
    $normalizedAccessCode = strtoupper(trim($accessCode));
    if ($normalizedQuery === '' || $normalizedAccessCode === '') {
        return [];
    }

    $dossiers = [];
    $dossier = portalFetchPublicDossierByCodes($pdo, $normalizedQuery, $normalizedAccessCode);
    if ($dossier !== null) {
        $dossiers[] = $dossier;
    }

    return $dossiers;
}

function portalIncrementAlphaBlock(string $letters): string
{
    $characters = str_split($letters);

    for ($index = count($characters) - 1; $index >= 0; $index--) {
        $current = ord($characters[$index]);
        if ($current < ord('Z')) {
            $characters[$index] = chr($current + 1);

            for ($resetIndex = $index + 1, $length = count($characters); $resetIndex < $length; $resetIndex++) {
                $characters[$resetIndex] = 'A';
            }

            return implode('', $characters);
        }
    }

    throw new RuntimeException('Se alcanzo el limite de codigos de expediente disponibles.');
}

function portalIncrementSequentialDossierCode(string $currentCode): string
{
    if (preg_match('/^([A-Z]{6})(\d{4})$/', strtoupper(trim($currentCode)), $matches) !== 1) {
        return 'AAAAAA0001';
    }

    $letters = (string) $matches[1];
    $number = (int) $matches[2];

    if ($number < 9999) {
        return sprintf('%s%04d', $letters, $number + 1);
    }

    return sprintf('%s0001', portalIncrementAlphaBlock($letters));
}

function portalGenerateDossierCode(PDO $pdo, array $source = []): string
{
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $existsStatement = $pdo->prepare('SELECT id FROM expedientes WHERE codigo_expediente = :codigo LIMIT 1');

    for ($attempt = 0; $attempt < 40; $attempt++) {
        $code = '';
        for ($index = 0; $index < 10; $index++) {
            $code .= $characters[random_int(0, strlen($characters) - 1)];
        }

        $existsStatement->execute(['codigo' => $code]);
        if ($existsStatement->fetchColumn() === false) {
            return $code;
        }
    }

    throw new RuntimeException('No se pudo generar un codigo unico para el expediente.');
}

function portalGenerateAccessCode(PDO $pdo, array $source = []): string
{
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $existsStatement = $pdo->prepare('SELECT id FROM clientes WHERE codigo_acceso = :codigo LIMIT 1');

    for ($attempt = 0; $attempt < 40; $attempt++) {
        $code = '';
        for ($index = 0; $index < 7; $index++) {
            $code .= $characters[random_int(0, strlen($characters) - 1)];
        }

        $existsStatement->execute(['codigo' => $code]);
        if ($existsStatement->fetchColumn() === false) {
            return $code;
        }
    }

    throw new RuntimeException('No se pudo generar un codigo de acceso unico.');
}

function portalBuildClientPayloadFromDossierRow(array $row, ?string $accessCode = null): array
{
    return [
        'clientName' => (string) ($row['nombre_completo'] ?? ''),
        'clientPhone' => (string) ($row['telefono'] ?? ''),
        'clientEmail' => (string) ($row['correo'] ?? ''),
        'clientAccessCode' => $accessCode ?? (string) ($row['codigo_acceso'] ?? ''),
    ];
}

function portalFindClientIdByAccessCode(PDO $pdo, string $accessCode): ?int
{
    $statement = $pdo->prepare('SELECT id FROM clientes WHERE codigo_acceso = :codigo LIMIT 1');
    $statement->execute(['codigo' => portalNormalizeAccessCode($accessCode)]);
    $clientId = $statement->fetchColumn();

    return $clientId === false ? null : (int) $clientId;
}

function portalCreateOrUpdateClient(PDO $pdo, array $payload): int
{
    $accessCode = portalNormalizeAccessCode((string) ($payload['clientAccessCode'] ?? ''));
    $clientName = trim((string) ($payload['clientName'] ?? ''));
    $clientPhone = trim((string) ($payload['clientPhone'] ?? ''));
    $clientEmail = portalNormalizeOptionalEmail((string) ($payload['clientEmail'] ?? ''));

    $existingClientId = portalFindClientIdByAccessCode($pdo, $accessCode);
    if ($existingClientId !== null) {
        $update = $pdo->prepare("
            UPDATE clientes
            SET nombre_completo = :nombre,
                telefono = :telefono,
                correo = :correo,
                ultima_actualizacion = NOW()
            WHERE id = :id
        ");
        $update->execute([
            'id' => $existingClientId,
            'nombre' => $clientName,
            'telefono' => $clientPhone,
            'correo' => $clientEmail,
        ]);

        return $existingClientId;
    }

    $insert = $pdo->prepare("
        INSERT INTO clientes (nombre_completo, telefono, correo, codigo_acceso)
        VALUES (:nombre, :telefono, :correo, :codigo)
    ");
    $insert->execute([
        'nombre' => $clientName,
        'telefono' => $clientPhone,
        'correo' => $clientEmail,
        'codigo' => $accessCode,
    ]);

    return (int) $pdo->lastInsertId();
}

function portalUpdateExistingClient(PDO $pdo, int $clientId, array $payload): void
{
    $accessCode = portalNormalizeAccessCode((string) ($payload['clientAccessCode'] ?? ''));
    $clientName = trim((string) ($payload['clientName'] ?? ''));
    $clientPhone = trim((string) ($payload['clientPhone'] ?? ''));
    $clientEmail = portalNormalizeOptionalEmail((string) ($payload['clientEmail'] ?? ''));

    $conflict = $pdo->prepare('SELECT id FROM clientes WHERE codigo_acceso = :codigo AND id <> :id LIMIT 1');
    $conflict->execute([
        'codigo' => $accessCode,
        'id' => $clientId,
    ]);
    if ($conflict->fetchColumn() !== false) {
        throw new RuntimeException('Ya existe otro cliente con ese codigo de acceso.');
    }

    $update = $pdo->prepare("
        UPDATE clientes
        SET nombre_completo = :nombre,
            telefono = :telefono,
            correo = :correo,
            codigo_acceso = :codigo,
            ultima_actualizacion = NOW()
        WHERE id = :id
    ");
    $update->execute([
        'id' => $clientId,
        'nombre' => $clientName,
        'telefono' => $clientPhone,
        'correo' => $clientEmail,
        'codigo' => $accessCode,
    ]);
}

function portalBuildDossierUpdateSummary(array $currentDossierRow, array $payload, string $nextCode, string $nextStatus): ?array
{
    $changeLabels = [];
    $statusChanged = false;
    $statusLabels = portalDossierStatusLabels();

    $comparisons = [
        'codigo_expediente' => ['label' => 'codigo interno', 'next' => $nextCode],
        'nombre_completo' => ['label' => 'cliente', 'next' => trim((string) ($payload['clientName'] ?? ''))],
        'telefono' => ['label' => 'telefono del cliente', 'next' => trim((string) ($payload['clientPhone'] ?? ''))],
        'correo' => ['label' => 'correo del cliente', 'next' => portalNormalizeOptionalEmail((string) ($payload['clientEmail'] ?? '')) ?? ''],
        'codigo_acceso' => ['label' => 'codigo de acceso', 'next' => portalNormalizeAccessCode((string) ($payload['clientAccessCode'] ?? ''))],
        'titulo_juicio' => ['label' => 'titulo del juicio', 'next' => trim((string) ($payload['title'] ?? ''))],
        'descripcion' => ['label' => 'descripcion inicial', 'next' => trim((string) ($payload['description'] ?? ''))],
        'actor' => ['label' => 'actor', 'next' => trim((string) ($payload['plaintiff'] ?? ''))],
        'demandado' => ['label' => 'demandado', 'next' => trim((string) ($payload['defendant'] ?? ''))],
        'juzgado' => ['label' => 'juzgado', 'next' => trim((string) ($payload['courtNumber'] ?? ''))],
        'partido_judicial' => ['label' => 'partido judicial', 'next' => trim((string) ($payload['judicialDistrict'] ?? ''))],
        'categoria' => ['label' => 'categoria', 'next' => trim((string) ($payload['category'] ?? ''))],
        'estatus' => ['label' => 'estatus', 'next' => $nextStatus],
    ];

    foreach ($comparisons as $field => $comparison) {
        $currentValue = trim((string) ($currentDossierRow[$field] ?? ''));
        $nextValue = trim((string) $comparison['next']);
        if ($currentValue === $nextValue) {
            continue;
        }

        $changeLabels[] = (string) $comparison['label'];
        if ($field === 'estatus') {
            $statusChanged = true;
        }
    }

    if ($changeLabels === []) {
        return null;
    }

    if ($statusChanged && count($changeLabels) === 1) {
        return [
            'title' => 'Estatus actualizado',
            'description' => sprintf(
                'El estatus cambio de %s a %s.',
                $statusLabels[(string) ($currentDossierRow['estatus'] ?? '')] ?? (string) ($currentDossierRow['estatus'] ?? ''),
                $statusLabels[$nextStatus] ?? $nextStatus
            ),
        ];
    }

    return [
        'title' => 'Datos del expediente actualizados',
        'description' => 'Se actualizaron los siguientes campos: ' . implode(', ', $changeLabels) . '.',
    ];
}

function portalInferHistoryKind(string $title, string $description): string
{
    $haystack = strtoupper(trim($title . ' ' . $description));

    if (strpos($haystack, 'NOTAS DE PENDIENTES') !== false) {
        return 'LEGAL_NOTES';
    }

    if (strpos($haystack, 'ESTADO JURIDICO') !== false) {
        return 'LEGAL_STATUS';
    }

    if (strpos($haystack, 'CONTROL JURIDICO') !== false) {
        return 'LEGAL_CONTROL';
    }

    return 'GENERAL';
}

function portalBuildPendingNotesChangeDescription(string $currentPendingNotes, string $nextPendingNotes): string
{
    $before = trim($currentPendingNotes);
    $after = trim($nextPendingNotes);

    $formatValue = static function (string $value): string {
        if ($value === '') {
            return '[sin notas]';
        }

        $singleLine = preg_replace('/\s+/u', ' ', $value) ?? $value;
        if (mb_strlen($singleLine, 'UTF-8') <= 220) {
            return $singleLine;
        }

        return mb_substr($singleLine, 0, 220, 'UTF-8') . '...';
    };

    return sprintf('Antes: %s Ahora: %s', $formatValue($before), $formatValue($after));
}

function portalBuildLegalControlUpdateSummary(array $currentDossierRow, string $nextLegalStatus, ?string $nextPendingNotes): ?array
{
    $currentLegalStatus = (string) ($currentDossierRow['estado_juridico'] ?? portalLegalControlDefaultStatus());
    $currentPendingNotes = trim((string) ($currentDossierRow['notas_pendientes'] ?? ''));
    $normalizedPendingNotes = trim((string) ($nextPendingNotes ?? ''));
    $labels = portalLegalControlStatusLabels();
    $changes = [];

    if ($currentLegalStatus !== $nextLegalStatus) {
        $changes[] = sprintf(
            'El estado juridico cambio de %s a %s.',
            $labels[$currentLegalStatus] ?? $currentLegalStatus,
            $labels[$nextLegalStatus] ?? $nextLegalStatus
        );
    }

    if ($currentPendingNotes !== $normalizedPendingNotes) {
        $changes[] = portalBuildPendingNotesChangeDescription($currentPendingNotes, $normalizedPendingNotes);
    }

    if ($changes === []) {
        return null;
    }

    if (count($changes) === 1 && $currentLegalStatus !== $nextLegalStatus) {
        return [
            'title' => 'Estado juridico actualizado',
            'description' => $changes[0],
        ];
    }

    if (count($changes) === 1 && $currentPendingNotes !== $normalizedPendingNotes) {
        return [
            'title' => 'Notas de pendientes actualizadas',
            'description' => $changes[0],
        ];
    }

    return [
        'title' => 'Control juridico actualizado',
        'description' => implode(' ', $changes),
    ];
}

function portalCreateDossier(PDO $pdo, array $payload): array
{
    portalEnsureLegalControlSchema($pdo);

    $dossierCode = portalNormalizeDossierCode((string) ($payload['id'] ?? ''), true);
    if ($dossierCode === '') {
        $dossierCode = portalGenerateDossierCode($pdo, $payload);
    }

    $accessCode = trim((string) ($payload['clientAccessCode'] ?? ''));
    if ($accessCode === '') {
        $accessCode = portalGenerateAccessCode($pdo, $payload);
    } else {
        $accessCode = portalNormalizeAccessCode($accessCode);
    }

    $payload['id'] = $dossierCode;
    $payload['clientAccessCode'] = $accessCode;
    portalValidateDossierPayload($payload);

    $existsStatement = $pdo->prepare('SELECT id FROM expedientes WHERE codigo_expediente = :codigo LIMIT 1');
    $existsStatement->execute(['codigo' => $dossierCode]);
    if ($existsStatement->fetchColumn() !== false) {
        throw new RuntimeException('Ya existe un expediente con ese codigo.');
    }

    $clientId = portalCreateOrUpdateClient($pdo, $payload);
    $linkedStatuses = portalResolveLinkedDossierStatuses(
        (string) ($payload['status'] ?? portalDossierDefaultStatus()),
        array_key_exists('legalStatus', $payload) ? (string) ($payload['legalStatus'] ?? '') : null
    );
    $status = (string) $linkedStatuses['status'];
    $legalStatus = (string) $linkedStatuses['legalStatus'];
    $pendingNotes = portalNormalizePendingNotes((string) ($payload['pendingNotes'] ?? ''));
    $adminId = (int) ($payload['adminId'] ?? 1);
    $now = date('Y-m-d H:i:s');

    $insert = $pdo->prepare("
        INSERT INTO expedientes (
            codigo_expediente,
            cliente_id,
            creado_por_admin_id,
            asignado_admin_id,
            titulo_juicio,
            descripcion,
            actor,
            demandado,
            juzgado,
            partido_judicial,
            categoria,
            estatus,
            estado_juridico,
            notas_pendientes,
            fecha_apertura,
            ultima_actualizacion
        ) VALUES (
            :codigo_expediente,
            :cliente_id,
            :creado_por_admin_id,
            :asignado_admin_id,
            :titulo_juicio,
            :descripcion,
            :actor,
            :demandado,
            :juzgado,
            :partido_judicial,
            :categoria,
            :estatus,
            :estado_juridico,
            :notas_pendientes,
            :fecha_apertura,
            :ultima_actualizacion
        )
    ");
    $insert->execute([
        'codigo_expediente' => $dossierCode,
        'cliente_id' => $clientId,
        'creado_por_admin_id' => $adminId,
        'asignado_admin_id' => $adminId,
        'titulo_juicio' => trim((string) $payload['title']),
        'descripcion' => trim((string) $payload['description']),
        'actor' => trim((string) $payload['plaintiff']),
        'demandado' => trim((string) $payload['defendant']),
        'juzgado' => trim((string) $payload['courtNumber']),
        'partido_judicial' => trim((string) $payload['judicialDistrict']),
        'categoria' => trim((string) $payload['category']),
        'estatus' => $status,
        'estado_juridico' => $legalStatus,
        'notas_pendientes' => $pendingNotes,
        'fecha_apertura' => $now,
        'ultima_actualizacion' => $now,
    ]);

    $dossierId = (int) $pdo->lastInsertId();
    portalInsertHistoryRecord(
        $pdo,
        $dossierId,
        $adminId,
        'Expediente creado',
        'El expediente ha sido registrado en la base de datos.',
        $now
    );

    return portalFetchSingleDossier($pdo, $dossierCode) ?? [];
}

function portalUpdateDossier(PDO $pdo, array $payload): array
{
    $currentCode = portalNormalizeDossierCode((string) ($payload['currentCode'] ?? ''));
    $currentRow = portalRequireDossierRow($pdo, $currentCode);
    $nextCode = portalNormalizeDossierCode((string) ($payload['id'] ?? $currentCode), true);
    if ($nextCode === '') {
        $nextCode = $currentCode;
    }

    $nextAccessCode = trim((string) ($payload['clientAccessCode'] ?? ''));
    if ($nextAccessCode === '') {
        $nextAccessCode = (string) $currentRow['codigo_acceso'];
    } else {
        $nextAccessCode = portalNormalizeAccessCode($nextAccessCode);
    }

    $payload['id'] = $nextCode;
    $payload['clientAccessCode'] = $nextAccessCode;
    portalValidateDossierPayload($payload);

    if ($nextCode !== $currentCode) {
        $existsStatement = $pdo->prepare('SELECT id FROM expedientes WHERE codigo_expediente = :codigo AND id <> :id LIMIT 1');
        $existsStatement->execute([
            'codigo' => $nextCode,
            'id' => (int) $currentRow['dossier_id'],
        ]);
        if ($existsStatement->fetchColumn() !== false) {
            throw new RuntimeException('Ya existe otro expediente con ese codigo.');
        }
    }

    $linkedStatuses = portalResolveLinkedDossierStatuses(
        (string) ($payload['status'] ?? portalDossierDefaultStatus()),
        array_key_exists('legalStatus', $payload) ? (string) ($payload['legalStatus'] ?? '') : null,
        (string) ($currentRow['estatus'] ?? portalDossierDefaultStatus()),
        (string) ($currentRow['estado_juridico'] ?? portalLegalControlDefaultStatus())
    );
    $status = (string) $linkedStatuses['status'];
    $legalStatus = (string) $linkedStatuses['legalStatus'];
    $updateSummary = portalBuildDossierUpdateSummary($currentRow, $payload, $nextCode, $status);

    if ($updateSummary === null) {
        return portalFetchSingleDossier($pdo, $currentCode) ?? [];
    }

    portalUpdateExistingClient($pdo, (int) $currentRow['cliente_id'], $payload);

    $update = $pdo->prepare("
        UPDATE expedientes
        SET codigo_expediente = :codigo_expediente,
            titulo_juicio = :titulo_juicio,
            descripcion = :descripcion,
            actor = :actor,
            demandado = :demandado,
            juzgado = :juzgado,
            partido_judicial = :partido_judicial,
            categoria = :categoria,
            estatus = :estatus,
            estado_juridico = :estado_juridico
        WHERE id = :id
    ");
    $update->execute([
        'codigo_expediente' => $nextCode,
        'titulo_juicio' => trim((string) $payload['title']),
        'descripcion' => trim((string) $payload['description']),
        'actor' => trim((string) $payload['plaintiff']),
        'demandado' => trim((string) $payload['defendant']),
        'juzgado' => trim((string) $payload['courtNumber']),
        'partido_judicial' => trim((string) $payload['judicialDistrict']),
        'categoria' => trim((string) $payload['category']),
        'estatus' => $status,
        'estado_juridico' => $legalStatus,
        'id' => (int) $currentRow['dossier_id'],
    ]);

    portalInsertHistoryRecord(
        $pdo,
        (int) $currentRow['dossier_id'],
        (int) ($payload['adminId'] ?? 1),
        (string) $updateSummary['title'],
        (string) $updateSummary['description']
    );

    return portalFetchSingleDossier($pdo, $nextCode) ?? [];
}

function portalUpdateLegalControl(PDO $pdo, array $payload): array
{
    portalEnsureLegalControlSchema($pdo);

    $dossierCode = portalNormalizeDossierCode((string) ($payload['dossierCode'] ?? $payload['code'] ?? ''));
    $currentRow = portalRequireDossierRow($pdo, $dossierCode);
    $hasLegalStatus = array_key_exists('legalStatus', $payload);
    $hasPendingNotes = array_key_exists('pendingNotes', $payload);

    if (!$hasLegalStatus && !$hasPendingNotes) {
        throw new InvalidArgumentException('Debes enviar legalStatus, pendingNotes o ambos para actualizar el control juridico.');
    }

    $nextLegalStatus = $hasLegalStatus
        ? portalNormalizeLegalControlStatus((string) ($payload['legalStatus'] ?? ''))
        : (string) ($currentRow['estado_juridico'] ?? portalLegalControlDefaultStatus());
    $nextPendingNotes = $hasPendingNotes
        ? portalNormalizePendingNotes((string) ($payload['pendingNotes'] ?? ''))
        : portalNormalizePendingNotes((string) ($currentRow['notas_pendientes'] ?? ''));
    $nextStatus = $hasLegalStatus
        ? $nextLegalStatus
        : (string) ($currentRow['estatus'] ?? portalDossierDefaultStatus());

    $summary = portalBuildLegalControlUpdateSummary($currentRow, $nextLegalStatus, $nextPendingNotes);
    if ($summary === null) {
        return portalFetchSingleDossier($pdo, $dossierCode) ?? [];
    }

    $update = $pdo->prepare("
        UPDATE expedientes
        SET estado_juridico = :estado_juridico,
            notas_pendientes = :notas_pendientes,
            estatus = :estatus
        WHERE id = :id
    ");
    $update->execute([
        'estado_juridico' => $nextLegalStatus,
        'notas_pendientes' => $nextPendingNotes,
        'estatus' => $nextStatus,
        'id' => (int) $currentRow['dossier_id'],
    ]);

    portalInsertHistoryRecord(
        $pdo,
        (int) $currentRow['dossier_id'],
        (int) ($payload['adminId'] ?? 1),
        (string) $summary['title'],
        (string) $summary['description']
    );

    return portalFetchSingleDossier($pdo, $dossierCode) ?? [];
}

function portalUpdateDossierCodes(PDO $pdo, array $payload): array
{
    $currentCode = portalNormalizeDossierCode((string) ($payload['currentCode'] ?? ''));
    $currentRow = portalRequireDossierRow($pdo, $currentCode);
    $adminId = (int) ($payload['adminId'] ?? 1);

    $nextCode = portalNormalizeDossierCode((string) ($payload['id'] ?? ''), true);
    if ($nextCode === '') {
        $nextCode = portalGenerateDossierCode($pdo, $currentRow);
    }

    $nextAccessCode = trim((string) ($payload['clientAccessCode'] ?? ''));
    if ($nextAccessCode === '') {
        $nextAccessCode = portalGenerateAccessCode($pdo, $currentRow);
    } else {
        $nextAccessCode = portalNormalizeAccessCode($nextAccessCode);
    }

    if ($nextCode !== $currentCode) {
        $existsStatement = $pdo->prepare('SELECT id FROM expedientes WHERE codigo_expediente = :codigo AND id <> :id LIMIT 1');
        $existsStatement->execute([
            'codigo' => $nextCode,
            'id' => (int) $currentRow['dossier_id'],
        ]);
        if ($existsStatement->fetchColumn() !== false) {
            throw new RuntimeException('Ya existe otro expediente con ese codigo.');
        }
    }

    $currentAccessCode = (string) $currentRow['codigo_acceso'];
    if ($nextAccessCode !== $currentAccessCode) {
        $conflict = $pdo->prepare('SELECT id FROM clientes WHERE codigo_acceso = :codigo AND id <> :id LIMIT 1');
        $conflict->execute([
            'codigo' => $nextAccessCode,
            'id' => (int) $currentRow['cliente_id'],
        ]);
        if ($conflict->fetchColumn() !== false) {
            throw new RuntimeException('Ya existe otro cliente con ese codigo de acceso.');
        }
    }

    if ($nextCode === $currentCode && $nextAccessCode === $currentAccessCode) {
        return portalFetchSingleDossier($pdo, $currentCode) ?? [];
    }

    $clientPayload = portalBuildClientPayloadFromDossierRow($currentRow, $nextAccessCode);
    portalUpdateExistingClient($pdo, (int) $currentRow['cliente_id'], $clientPayload);

    if ($nextCode !== $currentCode) {
        $update = $pdo->prepare('UPDATE expedientes SET codigo_expediente = :codigo_expediente WHERE id = :id');
        $update->execute([
            'codigo_expediente' => $nextCode,
            'id' => (int) $currentRow['dossier_id'],
        ]);
    }

    $changes = [];
    if ($nextCode !== $currentCode) {
        $changes[] = sprintf('codigo interno %s -> %s', $currentCode, $nextCode);
    }
    if ($nextAccessCode !== $currentAccessCode) {
        $changes[] = sprintf('codigo de acceso %s -> %s', $currentAccessCode, $nextAccessCode);
    }

    portalInsertHistoryRecord(
        $pdo,
        (int) $currentRow['dossier_id'],
        $adminId,
        'Codigos del expediente actualizados',
        'Se actualizaron los siguientes valores: ' . implode(', ', $changes) . '.'
    );

    return portalFetchSingleDossier($pdo, $nextCode) ?? [];
}

function portalDeleteDossier(PDO $pdo, string $dossierCode): void
{
    $row = portalRequireDossierRow($pdo, $dossierCode);
    $statement = $pdo->prepare('DELETE FROM expedientes WHERE id = :id');
    $statement->execute(['id' => (int) $row['dossier_id']]);
}

function portalNormalizeRecordReference(?string $value, string $label): string
{
    $normalized = trim((string) $value);
    if ($normalized === '') {
        throw new InvalidArgumentException(sprintf('Debes enviar la referencia del %s.', $label));
    }

    return $normalized;
}

function portalEnsureFileContentStorageTable(PDO $pdo): void
{
    static $isEnsured = false;

    if ($isEnsured) {
        return;
    }

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS expediente_archivos_contenido (
            archivo_id BIGINT UNSIGNED NOT NULL,
            contenido LONGBLOB NOT NULL,
            fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (archivo_id),
            CONSTRAINT fk_archivos_contenido_archivo
                FOREIGN KEY (archivo_id) REFERENCES expediente_archivos (id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");

    $isEnsured = true;
}

function portalMoveUploadedFileToStorage(string $tmpName, string $diskPath): void
{
    if ($tmpName === '') {
        throw new RuntimeException('No se recibio el archivo temporal de la carga.');
    }

    $stored = false;

    if (is_uploaded_file($tmpName)) {
        $stored = move_uploaded_file($tmpName, $diskPath);
    }

    if (!$stored && is_file($tmpName)) {
        $stored = @rename($tmpName, $diskPath);
    }

    if (!$stored && is_file($tmpName)) {
        $stored = @copy($tmpName, $diskPath);
        if ($stored) {
            @unlink($tmpName);
        }
    }

    clearstatcache(true, $diskPath);

    if (!$stored || !is_file($diskPath)) {
        throw new RuntimeException('No se pudo guardar el archivo en el almacenamiento final.');
    }
}

function portalStoreFileContentSnapshot(PDO $pdo, int $fileId, string $diskPath): void
{
    portalEnsureFileContentStorageTable($pdo);

    $content = @file_get_contents($diskPath);
    if ($content === false) {
        throw new RuntimeException('No se pudo leer el archivo guardado para registrarlo en el servidor.');
    }

    $statement = $pdo->prepare("
        INSERT INTO expediente_archivos_contenido (archivo_id, contenido, fecha_registro)
        VALUES (:archivo_id, :contenido, NOW())
        ON DUPLICATE KEY UPDATE
            contenido = VALUES(contenido),
            fecha_registro = NOW()
    ");
    $statement->bindValue(':archivo_id', $fileId, PDO::PARAM_INT);
    $statement->bindValue(':contenido', $content, PDO::PARAM_LOB);
    $statement->execute();
}

function portalReadFileContentSnapshot(PDO $pdo, int $fileId): ?string
{
    portalEnsureFileContentStorageTable($pdo);

    $statement = $pdo->prepare('SELECT contenido FROM expediente_archivos_contenido WHERE archivo_id = :archivo_id LIMIT 1');
    $statement->bindValue(':archivo_id', $fileId, PDO::PARAM_INT);
    $statement->execute();
    $content = $statement->fetchColumn();

    if ($content === false || $content === null) {
        return null;
    }

    if (is_resource($content)) {
        $streamContent = stream_get_contents($content);
        return $streamContent === false ? null : $streamContent;
    }

    return (string) $content;
}

function portalFetchFileAssetByReference(PDO $pdo, string $fileReference): ?array
{
    portalEnsureFileContentStorageTable($pdo);

    $statement = $pdo->prepare("
        SELECT
            a.id AS file_db_id,
            a.referencia_archivo,
            a.nombre_original,
            a.mime_type,
            a.tamano_bytes,
            a.ruta_archivo,
            a.visible_cliente,
            e.codigo_expediente,
            c.codigo_acceso,
            CASE WHEN ac.archivo_id IS NULL THEN 0 ELSE 1 END AS has_content_snapshot
        FROM expediente_archivos a
        INNER JOIN expedientes e ON e.id = a.expediente_id
        INNER JOIN clientes c ON c.id = e.cliente_id
        LEFT JOIN expediente_archivos_contenido ac ON ac.archivo_id = a.id
        WHERE a.referencia_archivo = :referencia
        LIMIT 1
    ");
    $statement->execute([
        'referencia' => trim($fileReference),
    ]);
    $row = $statement->fetch();

    return $row === false ? null : $row;
}

function portalResolveStoredFileDiskPath(string $storedRelativePath): ?string
{
    $normalizedPath = ltrim(str_replace('\\', '/', trim($storedRelativePath)), '/');
    if ($normalizedPath === '') {
        return null;
    }

    $publicPrefix = trim(str_replace('\\', '/', portalUploadsPublicPrefix()), '/');
    $relativePath = $normalizedPath;

    if ($publicPrefix !== '') {
        if ($normalizedPath === $publicPrefix) {
            return null;
        }

        if (strpos($normalizedPath, $publicPrefix . '/') === 0) {
            $relativePath = substr($normalizedPath, strlen($publicPrefix) + 1);
        }
    }

    $relativePath = trim(str_replace('/', DIRECTORY_SEPARATOR, $relativePath), DIRECTORY_SEPARATOR);
    if ($relativePath === '') {
        return null;
    }

    return rtrim(portalUploadsDirectory(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $relativePath;
}

function portalDeleteHistoryAttachments(PDO $pdo, int $dossierId, int $historyId): void
{
    $pathsStatement = $pdo->prepare("
        SELECT ruta_archivo
        FROM expediente_archivos
        WHERE expediente_id = :expediente_id
          AND historial_id = :historial_id
    ");
    $pathsStatement->execute([
        'expediente_id' => $dossierId,
        'historial_id' => $historyId,
    ]);

    $storedPaths = $pathsStatement->fetchAll(PDO::FETCH_COLUMN);

    $deleteStatement = $pdo->prepare("
        DELETE FROM expediente_archivos
        WHERE expediente_id = :expediente_id
          AND historial_id = :historial_id
    ");
    $deleteStatement->execute([
        'expediente_id' => $dossierId,
        'historial_id' => $historyId,
    ]);

    foreach ($storedPaths as $storedPath) {
        $diskPath = portalResolveStoredFileDiskPath((string) $storedPath);
        if ($diskPath !== null && is_file($diskPath)) {
            @unlink($diskPath);
        }
    }
}

function portalDeleteHistoryEvent(PDO $pdo, array $payload): array
{
    $dossierCode = portalNormalizeDossierCode((string) ($payload['dossierCode'] ?? ''));
    $historyEventId = portalNormalizeRecordReference(
        (string) ($payload['historyEventId'] ?? $payload['eventId'] ?? ''),
        'movimiento'
    );
    $row = portalRequireDossierRow($pdo, $dossierCode);
    $dossierId = (int) $row['dossier_id'];

    $historyStatement = $pdo->prepare("
        SELECT id
        FROM expediente_historial
        WHERE expediente_id = :expediente_id
          AND referencia_fase = :referencia
        LIMIT 1
    ");
    $historyStatement->execute([
        'expediente_id' => $dossierId,
        'referencia' => $historyEventId,
    ]);
    $historyId = $historyStatement->fetchColumn();

    if ($historyId === false) {
        throw new RuntimeException('No se encontro el movimiento solicitado en este expediente.');
    }

    portalDeleteHistoryAttachments($pdo, $dossierId, (int) $historyId);

    $deleteStatement = $pdo->prepare("
        DELETE FROM expediente_historial
        WHERE id = :id
          AND expediente_id = :expediente_id
    ");
    $deleteStatement->execute([
        'id' => (int) $historyId,
        'expediente_id' => $dossierId,
    ]);

    portalTouchDossier($pdo, $dossierId);

    return portalFetchSingleDossier($pdo, $dossierCode) ?? [];
}

function portalDeleteCalendarEvent(PDO $pdo, array $payload): array
{
    $dossierCode = portalNormalizeDossierCode((string) ($payload['dossierCode'] ?? ''));
    $calendarEventId = portalNormalizeRecordReference(
        (string) ($payload['calendarEventId'] ?? $payload['eventId'] ?? ''),
        'evento de calendario'
    );
    $row = portalRequireDossierRow($pdo, $dossierCode);
    $dossierId = (int) $row['dossier_id'];

    $deleteStatement = $pdo->prepare("
        DELETE FROM expediente_calendario
        WHERE expediente_id = :expediente_id
          AND referencia_evento = :referencia
        LIMIT 1
    ");
    $deleteStatement->execute([
        'expediente_id' => $dossierId,
        'referencia' => $calendarEventId,
    ]);

    if ($deleteStatement->rowCount() === 0) {
        throw new RuntimeException('No se encontro el evento de calendario solicitado en este expediente.');
    }

    portalTouchDossier($pdo, $dossierId);

    return portalFetchSingleDossier($pdo, $dossierCode) ?? [];
}

function portalAddHistoryEvent(PDO $pdo, array $payload, array $uploadedFiles = []): array
{
    $dossierCode = portalNormalizeDossierCode((string) ($payload['dossierCode'] ?? ''));
    $title = trim((string) ($payload['title'] ?? ''));
    $description = trim((string) ($payload['description'] ?? ''));
    $movementDate = portalNormalizeDateTime((string) ($payload['date'] ?? '')) ?? date('Y-m-d H:i:s');
    $adminId = (int) ($payload['adminId'] ?? 1);
    $visibleToClient = portalNormalizeBoolean($payload['isClientVisible'] ?? true, true);

    if ($title === '') {
        throw new InvalidArgumentException('Debes enviar dossierCode y title para registrar historial.');
    }

    if (count($uploadedFiles) > 1) {
        throw new InvalidArgumentException('Cada movimiento solo puede tener un archivo adjunto.');
    }

    $row = portalRequireDossierRow($pdo, $dossierCode);
    $phaseReference = portalInsertHistoryRecord($pdo, (int) $row['dossier_id'], $adminId, $title, $description, $movementDate);

    if ($uploadedFiles !== []) {
        return portalAttachUploadedFiles($pdo, $dossierCode, $uploadedFiles, $phaseReference, $adminId, $visibleToClient);
    }

    return portalFetchSingleDossier($pdo, $dossierCode) ?? [];
}

function portalAddCalendarEvent(PDO $pdo, array $payload): array
{
    $dossierCode = portalNormalizeDossierCode((string) ($payload['dossierCode'] ?? ''));
    $title = trim((string) ($payload['title'] ?? ''));
    $type = portalNormalizeCalendarEventType((string) ($payload['type'] ?? 'AUDIENCIA'));
    $eventDate = portalNormalizeDateTime((string) ($payload['date'] ?? ''));
    $adminId = (int) ($payload['adminId'] ?? 1);

    if ($title === '' || $eventDate === null) {
        throw new InvalidArgumentException('Debes enviar dossierCode, title y date para registrar calendario.');
    }

    $row = portalRequireDossierRow($pdo, $dossierCode);

    $insert = $pdo->prepare("
        INSERT INTO expediente_calendario (
            expediente_id,
            admin_id,
            referencia_evento,
            tipo_evento,
            titulo_evento,
            descripcion_evento,
            fecha_evento,
            ubicacion,
            visible_cliente
        ) VALUES (
            :expediente_id,
            :admin_id,
            :referencia_evento,
            :tipo_evento,
            :titulo_evento,
            :descripcion_evento,
            :fecha_evento,
            :ubicacion,
            :visible_cliente
        )
    ");
    $insert->execute([
        'expediente_id' => (int) $row['dossier_id'],
        'admin_id' => $adminId,
        'referencia_evento' => portalGenerateReference('cal'),
        'tipo_evento' => $type,
        'titulo_evento' => $title,
        'descripcion_evento' => trim((string) ($payload['description'] ?? '')) ?: null,
        'fecha_evento' => $eventDate,
        'ubicacion' => trim((string) ($payload['location'] ?? '')) ?: null,
        'visible_cliente' => portalNormalizeBoolean($payload['isClientVisible'] ?? true, true) ? 1 : 0,
    ]);

    portalTouchDossier($pdo, (int) $row['dossier_id']);

    return portalFetchSingleDossier($pdo, $dossierCode) ?? [];
}

function portalAttachUploadedFiles(
    PDO $pdo,
    string $dossierCode,
    array $uploadedFiles,
    ?string $phaseReference,
    int $adminId = 1,
    bool $visibleToClient = true
): array {
    $normalizedCode = portalNormalizeDossierCode($dossierCode);
    $row = portalRequireDossierRow($pdo, $normalizedCode);
    $dossierId = (int) $row['dossier_id'];

    $historyId = null;
    if ($phaseReference !== null && trim($phaseReference) !== '') {
        $historyStatement = $pdo->prepare("
            SELECT id
            FROM expediente_historial
            WHERE referencia_fase = :referencia
              AND expediente_id = :expediente_id
            LIMIT 1
        ");
        $historyStatement->execute([
            'referencia' => trim($phaseReference),
            'expediente_id' => $dossierId,
        ]);
        $historyId = $historyStatement->fetchColumn();
        if ($historyId === false) {
            throw new RuntimeException('La fase del expediente no existe dentro del expediente seleccionado.');
        }
        $historyId = (int) $historyId;
    }

    portalEnsureUploadsDirectoryExists();
    $uploadsDirectory = portalUploadsDirectory();
    $publicPrefix = portalUploadsPublicPrefix();
    $dossierDirectoryName = portalStorageSegment($normalizedCode, 'expediente');
    $dossierDirectory = $uploadsDirectory . DIRECTORY_SEPARATOR . $dossierDirectoryName;
    $dossierPublicPrefix = $publicPrefix . '/' . $dossierDirectoryName;
    portalEnsureDirectoryExists($dossierDirectory, 'No se pudo crear la carpeta del expediente para uploads.');

    if ($historyId !== null && $phaseReference !== null && trim($phaseReference) !== '') {
        $phaseDirectoryName = 'avance-' . portalStorageSegment($phaseReference, 'general');
        $targetDirectory = $dossierDirectory . DIRECTORY_SEPARATOR . 'avances' . DIRECTORY_SEPARATOR . $phaseDirectoryName;
        $targetPublicPrefix = $dossierPublicPrefix . '/avances/' . $phaseDirectoryName;
    } else {
        $targetDirectory = $dossierDirectory . DIRECTORY_SEPARATOR . 'documentos';
        $targetPublicPrefix = $dossierPublicPrefix . '/documentos';
    }

    portalEnsureDirectoryExists($targetDirectory, 'No se pudo crear la carpeta destino de los archivos.');

    $insert = $pdo->prepare("
        INSERT INTO expediente_archivos (
            expediente_id,
            historial_id,
            admin_id,
            referencia_archivo,
            nombre_original,
            nombre_guardado,
            ruta_archivo,
            tamano_bytes,
            mime_type,
            visible_cliente
        ) VALUES (
            :expediente_id,
            :historial_id,
            :admin_id,
            :referencia_archivo,
            :nombre_original,
            :nombre_guardado,
            :ruta_archivo,
            :tamano_bytes,
            :mime_type,
            :visible_cliente
        )
    ");

    $storedDiskPaths = [];

    try {
        foreach ($uploadedFiles as $uploadedFile) {
            if (($uploadedFile['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
                throw new RuntimeException('Uno de los archivos no se pudo subir correctamente.');
            }

            $originalName = (string) ($uploadedFile['name'] ?? 'archivo');
            $tmpName = (string) ($uploadedFile['tmp_name'] ?? '');
            $size = (int) ($uploadedFile['size'] ?? 0);
            $mimeType = (string) (($uploadedFile['type'] ?? '') ?: 'application/octet-stream');

            $extension = pathinfo($originalName, PATHINFO_EXTENSION);
            $safeBaseName = preg_replace('/[^A-Za-z0-9_-]/', '-', pathinfo($originalName, PATHINFO_FILENAME)) ?: 'archivo';
            $storedName = sprintf(
                '%s-%s-%s%s',
                strtolower($normalizedCode),
                $safeBaseName,
                substr(bin2hex(random_bytes(5)), 0, 10),
                $extension !== '' ? '.' . strtolower($extension) : ''
            );

            $diskPath = $targetDirectory . DIRECTORY_SEPARATOR . $storedName;
            if (!move_uploaded_file($tmpName, $diskPath)) {
                throw new RuntimeException('No se pudo mover el archivo al directorio final.');
            }

            $storedDiskPaths[] = $diskPath;
            $storedRelativePath = $targetPublicPrefix . '/' . $storedName;
            $insert->execute([
                'expediente_id' => $dossierId,
                'historial_id' => $historyId,
                'admin_id' => $adminId,
                'referencia_archivo' => portalGenerateReference('file'),
                'nombre_original' => $originalName,
                'nombre_guardado' => $storedName,
                'ruta_archivo' => $storedRelativePath,
                'tamano_bytes' => $size,
                'mime_type' => $mimeType,
                'visible_cliente' => $visibleToClient ? 1 : 0,
            ]);
        }
    } catch (Throwable $exception) {
        foreach ($storedDiskPaths as $storedDiskPath) {
            if (is_file($storedDiskPath)) {
                @unlink($storedDiskPath);
            }
        }

        throw $exception;
    }

    portalTouchDossier($pdo, $dossierId);

    return portalFetchSingleDossier($pdo, $normalizedCode) ?? [];
}
