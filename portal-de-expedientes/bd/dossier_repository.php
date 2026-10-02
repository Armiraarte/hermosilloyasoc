<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';

function portalDossierStatuses(): array
{
    return ['RECIBIDO', 'EN_REVISION', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];
}

function portalCalendarEventTypes(): array
{
    return ['AUDIENCIA', 'VENCIMIENTO', 'CITA', 'RECORDATORIO'];
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

function portalNormalizeCalendarEventType(?string $value): string
{
    $type = strtoupper(trim((string) $value));
    if (!in_array($type, portalCalendarEventTypes(), true)) {
        throw new InvalidArgumentException('El tipo de evento de calendario no es valido.');
    }

    return $type;
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
        'clientAccessCode',
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

    portalNormalizeAccessCode((string) ($payload['clientAccessCode'] ?? ''));
    portalNormalizeOptionalEmail((string) ($payload['clientEmail'] ?? ''));
    portalNormalizeDossierStatus((string) ($payload['status'] ?? 'RECIBIDO'));
}

function portalFetchDossierRow(PDO $pdo, string $dossierCode): ?array
{
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
            e.fecha_apertura,
            e.ultima_actualizacion,
            c.nombre_completo,
            c.telefono,
            c.correo,
            c.codigo_acceso
        FROM expedientes e
        INNER JOIN clientes c ON c.id = e.cliente_id
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

function portalFetchDossiers(PDO $pdo, ?string $search = null, ?string $exactCode = null, ?int $clientId = null): array
{
    $whereParts = [];
    $params = [];

    if ($exactCode !== null && trim($exactCode) !== '') {
        $whereParts[] = 'e.codigo_expediente = :exactCode';
        $params['exactCode'] = portalNormalizeDossierCode($exactCode);
    }

    if ($clientId !== null && $clientId > 0) {
        $whereParts[] = 'e.cliente_id = :clientId';
        $params['clientId'] = $clientId;
    }

    if ($search !== null && trim($search) !== '') {
        $whereParts[] = '(
            e.codigo_expediente LIKE :search
            OR c.codigo_acceso LIKE :search
            OR c.nombre_completo LIKE :search
            OR e.titulo_juicio LIKE :search
            OR e.actor LIKE :search
            OR e.demandado LIKE :search
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
            e.fecha_registro,
            e.ultima_actualizacion,
            c.id AS cliente_db_id,
            c.nombre_completo,
            c.telefono,
            c.correo,
            c.codigo_acceso
        FROM expedientes e
        INNER JOIN clientes c ON c.id = e.cliente_id
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
            'status' => (string) $row['estatus'],
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
            h.fecha_movimiento
        FROM expediente_historial h
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
        $dossiersById[$expedienteId]['files'][] = [
            'id' => (string) $fileRow['referencia_archivo'],
            'name' => (string) $fileRow['nombre_original'],
            'date' => portalIsoDateTime((string) $fileRow['fecha_registro']),
            'size' => (int) $fileRow['tamano_bytes'],
            'phaseId' => $fileRow['referencia_fase'] !== null ? (string) $fileRow['referencia_fase'] : null,
            'isClientVisible' => (bool) $fileRow['visible_cliente'],
            'url' => portalBuildPublicFileUrl($storedPath),
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

function portalFetchDossiersByClientId(PDO $pdo, int $clientId): array
{
    if ($clientId <= 0) {
        return [];
    }

    return portalFetchDossiers($pdo, null, null, $clientId);
}

function portalPrepareDossierForClient(array $dossier): array
{
    $dossier['calendar'] = array_values(array_filter(
        $dossier['calendar'] ?? [],
        static fn (array $entry): bool => (bool) ($entry['isClientVisible'] ?? false)
    ));
    $dossier['files'] = array_values(array_filter(
        $dossier['files'] ?? [],
        static fn (array $file): bool => (bool) ($file['isClientVisible'] ?? false)
    ));

    return $dossier;
}

function portalFetchPublicDossiers(PDO $pdo, string $query): array
{
    $normalizedQuery = strtoupper(trim($query));
    if ($normalizedQuery === '') {
        return [];
    }

    $dossier = portalFetchSingleDossier($pdo, $normalizedQuery);
    if ($dossier !== null) {
        return [portalPrepareDossierForClient($dossier)];
    }

    if (preg_match('/^[A-Z0-9]{7}$/', $normalizedQuery) !== 1) {
        return [];
    }

    $clientId = portalFindClientIdByAccessCode($pdo, $normalizedQuery);
    if ($clientId === null) {
        return [];
    }

    return array_values(array_map(
        static fn (array $foundDossier): array => portalPrepareDossierForClient($foundDossier),
        portalFetchDossiersByClientId($pdo, $clientId)
    ));
}

function portalGenerateDossierCode(PDO $pdo): string
{
    $year = date('Y');
    $pattern = sprintf('EXP-%s-%%', $year);
    $statement = $pdo->prepare('SELECT codigo_expediente FROM expedientes WHERE codigo_expediente LIKE :pattern');
    $statement->execute(['pattern' => $pattern]);

    $highestNumber = 0;
    foreach ($statement->fetchAll(PDO::FETCH_COLUMN) as $code) {
        if (preg_match('/^EXP-\d{4}-(\d+)$/', (string) $code, $matches) === 1) {
            $highestNumber = max($highestNumber, (int) $matches[1]);
        }
    }

    return sprintf('EXP-%s-%03d', $year, $highestNumber + 1);
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
                (string) $currentDossierRow['estatus'],
                $nextStatus
            ),
        ];
    }

    return [
        'title' => 'Datos del expediente actualizados',
        'description' => 'Se actualizaron los siguientes campos: ' . implode(', ', $changeLabels) . '.',
    ];
}

function portalCreateDossier(PDO $pdo, array $payload): array
{
    portalValidateDossierPayload($payload);

    $dossierCode = portalNormalizeDossierCode((string) ($payload['id'] ?? ''), true);
    if ($dossierCode === '') {
        $dossierCode = portalGenerateDossierCode($pdo);
    }

    $existsStatement = $pdo->prepare('SELECT id FROM expedientes WHERE codigo_expediente = :codigo LIMIT 1');
    $existsStatement->execute(['codigo' => $dossierCode]);
    if ($existsStatement->fetchColumn() !== false) {
        throw new RuntimeException('Ya existe un expediente con ese codigo.');
    }

    $clientId = portalCreateOrUpdateClient($pdo, $payload);
    $status = portalNormalizeDossierStatus((string) ($payload['status'] ?? 'RECIBIDO'));
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
    portalValidateDossierPayload($payload);

    $currentCode = portalNormalizeDossierCode((string) ($payload['currentCode'] ?? ''));
    $currentRow = portalRequireDossierRow($pdo, $currentCode);
    $nextCode = portalNormalizeDossierCode((string) ($payload['id'] ?? $currentCode), true);
    if ($nextCode === '') {
        $nextCode = $currentCode;
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

    $status = portalNormalizeDossierStatus((string) ($payload['status'] ?? 'RECIBIDO'));
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
            estatus = :estatus
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

function portalDeleteDossier(PDO $pdo, string $dossierCode): void
{
    $row = portalRequireDossierRow($pdo, $dossierCode);
    $statement = $pdo->prepare('DELETE FROM expedientes WHERE id = :id');
    $statement->execute(['id' => (int) $row['dossier_id']]);
}

function portalAddHistoryEvent(PDO $pdo, array $payload): array
{
    $dossierCode = portalNormalizeDossierCode((string) ($payload['dossierCode'] ?? ''));
    $title = trim((string) ($payload['title'] ?? ''));
    $description = trim((string) ($payload['description'] ?? ''));
    $movementDate = portalNormalizeDateTime((string) ($payload['date'] ?? '')) ?? date('Y-m-d H:i:s');
    $adminId = (int) ($payload['adminId'] ?? 1);

    if ($title === '') {
        throw new InvalidArgumentException('Debes enviar dossierCode y title para registrar historial.');
    }

    $row = portalRequireDossierRow($pdo, $dossierCode);
    portalInsertHistoryRecord($pdo, (int) $row['dossier_id'], $adminId, $title, $description, $movementDate);

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

            $diskPath = $uploadsDirectory . DIRECTORY_SEPARATOR . $storedName;
            if (!move_uploaded_file($tmpName, $diskPath)) {
                throw new RuntimeException('No se pudo mover el archivo al directorio final.');
            }

            $storedDiskPaths[] = $diskPath;
            $storedRelativePath = $publicPrefix . '/' . $storedName;
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
