<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_once __DIR__ . '/admin_repository.php';

function portalEnsureLegalTeamSchema(PDO $pdo): void
{
    static $isEnsured = false;

    if ($isEnsured) {
        return;
    }

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS juridico_estatus_actividad (
          id TINYINT UNSIGNED NOT NULL,
          clave VARCHAR(40) NOT NULL,
          nombre VARCHAR(80) NOT NULL,
          color_hex VARCHAR(7) NOT NULL,
          orden_visual TINYINT UNSIGNED NOT NULL DEFAULT 1,
          es_realizado TINYINT(1) NOT NULL DEFAULT 0,
          activo TINYINT(1) NOT NULL DEFAULT 1,
          PRIMARY KEY (id),
          UNIQUE KEY uq_juridico_estatus_actividad_clave (clave),
          UNIQUE KEY uq_juridico_estatus_actividad_nombre (nombre)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $pdo->exec("
        INSERT INTO juridico_estatus_actividad (id, clave, nombre, color_hex, orden_visual, es_realizado, activo)
        VALUES
          (1, 'EN_PROCESO', 'En Proceso', '#F4B85A', 1, 0, 1),
          (2, 'URGENTE', 'Urgente', '#E4667A', 2, 0, 1),
          (3, 'EN_ESPERA', 'En espera', '#FF845D', 3, 0, 1),
          (4, 'CONCLUIDO', 'Concluido', '#40C78D', 4, 1, 1),
          (5, 'CONSTANTE_ACTUALIZACION', 'Constante Actualizacion', '#6CA6F4', 5, 0, 1),
          (6, 'AUDIENCIA_DILIGENCIA', 'Audiencia/Diligencia', '#7D63C9', 6, 0, 1),
          (7, 'REVISION', 'Revision', '#8C69D7', 7, 0, 1)
        ON DUPLICATE KEY UPDATE
          clave = VALUES(clave),
          nombre = VALUES(nombre),
          color_hex = VALUES(color_hex),
          orden_visual = VALUES(orden_visual),
          es_realizado = VALUES(es_realizado),
          activo = VALUES(activo)
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS equipo_juridico_actividades (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          referencia_actividad VARCHAR(80) NOT NULL,
          expediente_id BIGINT UNSIGNED NULL,
          admin_responsable_id BIGINT UNSIGNED NULL,
          admin_creador_id BIGINT UNSIGNED NULL,
          titulo_actividad VARCHAR(220) NOT NULL,
          fecha_entrada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          estatus_id TINYINT UNSIGNED NOT NULL,
          fecha_compromiso DATETIME NULL,
          nota_adicional TEXT NULL,
          fecha_realizado DATETIME NULL,
          es_externa TINYINT(1) NOT NULL DEFAULT 1,
          fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          ultima_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uq_equipo_juridico_actividad_ref (referencia_actividad),
          KEY idx_equipo_juridico_actividad_estatus (estatus_id, fecha_compromiso),
          KEY idx_equipo_juridico_actividad_responsable (admin_responsable_id, estatus_id),
          KEY idx_equipo_juridico_actividad_expediente (expediente_id),
          CONSTRAINT fk_equipo_juridico_actividad_estatus
            FOREIGN KEY (estatus_id) REFERENCES juridico_estatus_actividad (id)
            ON UPDATE CASCADE,
          CONSTRAINT fk_equipo_juridico_actividad_expediente
            FOREIGN KEY (expediente_id) REFERENCES expedientes (id)
            ON DELETE SET NULL,
          CONSTRAINT fk_equipo_juridico_actividad_responsable
            FOREIGN KEY (admin_responsable_id) REFERENCES administradores (id)
            ON DELETE SET NULL,
          CONSTRAINT fk_equipo_juridico_actividad_creador
            FOREIGN KEY (admin_creador_id) REFERENCES administradores (id)
            ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS equipo_juridico_actividad_avances (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          actividad_id BIGINT UNSIGNED NOT NULL,
          numero_actualizacion INT UNSIGNED NOT NULL,
          estatus_id TINYINT UNSIGNED NULL,
          titulo_avance VARCHAR(190) NOT NULL,
          descripcion_avance TEXT NULL,
          admin_id BIGINT UNSIGNED NULL,
          fecha_avance DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          visible_en_resumen TINYINT(1) NOT NULL DEFAULT 1,
          PRIMARY KEY (id),
          UNIQUE KEY uq_equipo_juridico_avance_numero (actividad_id, numero_actualizacion),
          KEY idx_equipo_juridico_avance_fecha (actividad_id, fecha_avance),
          CONSTRAINT fk_equipo_juridico_avance_actividad
            FOREIGN KEY (actividad_id) REFERENCES equipo_juridico_actividades (id)
            ON DELETE CASCADE,
          CONSTRAINT fk_equipo_juridico_avance_estatus
            FOREIGN KEY (estatus_id) REFERENCES juridico_estatus_actividad (id)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
          CONSTRAINT fk_equipo_juridico_avance_admin
            FOREIGN KEY (admin_id) REFERENCES administradores (id)
            ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $isEnsured = true;
}

function portalMapLegalTeamStatusRow(array $row): array
{
    return [
        'id' => (int) ($row['id'] ?? 0),
        'key' => (string) ($row['clave'] ?? ''),
        'name' => (string) ($row['nombre'] ?? ''),
        'colorHex' => (string) ($row['color_hex'] ?? '#A1A1AA'),
        'order' => (int) ($row['orden_visual'] ?? 0),
        'isCompleted' => (bool) ($row['es_realizado'] ?? false),
    ];
}

function portalFetchLegalTeamStatuses(PDO $pdo): array
{
    portalEnsureLegalTeamSchema($pdo);

    $statement = $pdo->query("
        SELECT id, clave, nombre, color_hex, orden_visual, es_realizado
        FROM juridico_estatus_actividad
        WHERE activo = 1
        ORDER BY orden_visual ASC, id ASC
    ");

    return array_map('portalMapLegalTeamStatusRow', $statement->fetchAll());
}

function portalNormalizeLegalTeamActivityId($value): int
{
    $id = (int) $value;
    if ($id <= 0) {
        throw new InvalidArgumentException('Debes enviar una actividad valida.');
    }

    return $id;
}

function portalNormalizeLegalTeamTitle(?string $value): string
{
    $title = trim((string) $value);
    if ($title === '') {
        throw new InvalidArgumentException('Debes indicar el cliente o actividad.');
    }

    if (mb_strlen($title, 'UTF-8') > 220) {
        throw new InvalidArgumentException('El titulo de la actividad es demasiado largo.');
    }

    return $title;
}

function portalNormalizeLegalTeamNote(?string $value): string
{
    $note = trim((string) $value);
    if (mb_strlen($note, 'UTF-8') > 10000) {
        throw new InvalidArgumentException('La nota adicional es demasiado larga.');
    }

    return $note;
}

function portalNormalizeLegalTeamMemberId(PDO $pdo, $value): int
{
    $memberId = portalNormalizeAdminMemberId($value);
    portalRequireAdminMemberRowById($pdo, $memberId);
    return $memberId;
}

function portalNormalizeLegalTeamStatusId(PDO $pdo, $value): array
{
    $statusId = (int) $value;
    if ($statusId <= 0) {
        throw new InvalidArgumentException('Debes indicar un estatus valido.');
    }

    portalEnsureLegalTeamSchema($pdo);
    $statement = $pdo->prepare("
        SELECT id, clave, nombre, color_hex, orden_visual, es_realizado, activo
        FROM juridico_estatus_actividad
        WHERE id = :id
        LIMIT 1
    ");
    $statement->execute(['id' => $statusId]);
    $row = $statement->fetch();

    if ($row === false || (int) ($row['activo'] ?? 0) !== 1) {
        throw new RuntimeException('El estatus seleccionado no existe o esta inactivo.');
    }

    return $row;
}

function portalNormalizeLegalTeamDate(?string $value, string $label, bool $required = false): ?string
{
    $raw = trim((string) $value);
    if ($raw === '') {
        if ($required) {
            throw new InvalidArgumentException(sprintf('Debes indicar %s.', $label));
        }

        return null;
    }

    $timestamp = strtotime($raw);
    if ($timestamp === false) {
        throw new InvalidArgumentException(sprintf('La fecha de %s no es valida.', $label));
    }

    return date('Y-m-d H:i:s', $timestamp);
}

function portalResolveOptionalLegalTeamDossierId(PDO $pdo, ?string $value): ?int
{
    $dossierCode = trim((string) $value);
    if ($dossierCode === '') {
        return null;
    }

    $statement = $pdo->prepare('SELECT id FROM expedientes WHERE codigo_expediente = :codigo LIMIT 1');
    $statement->execute(['codigo' => $dossierCode]);
    $dossierId = $statement->fetchColumn();
    if ($dossierId === false) {
        throw new RuntimeException('El expediente relacionado no existe.');
    }

    return (int) $dossierId;
}

function portalMapLegalTeamActivityRow(array $row): array
{
    return [
        'id' => (int) ($row['id'] ?? 0),
        'reference' => (string) ($row['referencia_actividad'] ?? ''),
        'title' => (string) ($row['titulo_actividad'] ?? ''),
        'memberId' => $row['admin_responsable_id'] !== null ? (int) $row['admin_responsable_id'] : null,
        'memberName' => (string) ($row['admin_responsable_nombre'] ?? ''),
        'statusId' => (int) ($row['estatus_id'] ?? 0),
        'statusName' => (string) ($row['estatus_nombre'] ?? ''),
        'statusColorHex' => (string) ($row['color_hex'] ?? '#A1A1AA'),
        'isCompleted' => (bool) ($row['es_realizado'] ?? false),
        'entryDate' => portalIsoDateTime((string) ($row['fecha_entrada'] ?? '')),
        'dueDate' => portalIsoDateTime($row['fecha_compromiso'] !== null ? (string) $row['fecha_compromiso'] : null),
        'note' => (string) ($row['nota_adicional'] ?? ''),
        'progressCount' => (int) ($row['total_actualizaciones'] ?? 0),
        'lastProgressAt' => portalIsoDateTime($row['ultima_actualizacion_avance'] !== null ? (string) $row['ultima_actualizacion_avance'] : null),
        'linkedDossierCode' => $row['codigo_expediente'] !== null ? (string) $row['codigo_expediente'] : '',
    ];
}

function portalFetchLegalTeamActivities(PDO $pdo): array
{
    portalEnsureLegalTeamSchema($pdo);

    $statement = $pdo->query("
        SELECT
            a.id,
            a.referencia_actividad,
            a.titulo_actividad,
            a.fecha_entrada,
            a.fecha_compromiso,
            a.nota_adicional,
            a.admin_responsable_id,
            a.estatus_id,
            s.nombre AS estatus_nombre,
            s.color_hex,
            s.es_realizado,
            ar.nombre AS admin_responsable_nombre,
            e.codigo_expediente,
            COUNT(av.id) AS total_actualizaciones,
            MAX(av.fecha_avance) AS ultima_actualizacion_avance
        FROM equipo_juridico_actividades a
        INNER JOIN juridico_estatus_actividad s ON s.id = a.estatus_id
        LEFT JOIN administradores ar ON ar.id = a.admin_responsable_id
        LEFT JOIN expedientes e ON e.id = a.expediente_id
        LEFT JOIN equipo_juridico_actividad_avances av ON av.actividad_id = a.id
        GROUP BY
            a.id,
            a.referencia_actividad,
            a.titulo_actividad,
            a.fecha_entrada,
            a.fecha_compromiso,
            a.nota_adicional,
            a.admin_responsable_id,
            a.estatus_id,
            s.nombre,
            s.color_hex,
            s.es_realizado,
            ar.nombre,
            e.codigo_expediente
        ORDER BY
            COALESCE(ar.nombre, 'ZZZ') ASC,
            s.es_realizado ASC,
            COALESCE(a.fecha_compromiso, a.fecha_entrada) ASC,
            a.id ASC
    ");

    return array_map('portalMapLegalTeamActivityRow', $statement->fetchAll());
}

function portalFetchLegalTeamBoard(PDO $pdo): array
{
    portalEnsureLegalTeamSchema($pdo);

    return [
        'members' => portalFetchActiveAdminMembers($pdo),
        'statuses' => portalFetchLegalTeamStatuses($pdo),
        'activities' => portalFetchLegalTeamActivities($pdo),
    ];
}

function portalFetchLegalTeamActivityRowById(PDO $pdo, int $activityId): ?array
{
    portalEnsureLegalTeamSchema($pdo);

    $statement = $pdo->prepare("
        SELECT
            a.id,
            a.referencia_actividad,
            a.titulo_actividad,
            a.fecha_entrada,
            a.fecha_compromiso,
            a.nota_adicional,
            a.admin_responsable_id,
            a.estatus_id,
            a.expediente_id,
            a.fecha_realizado,
            s.nombre AS estatus_nombre,
            s.color_hex,
            s.es_realizado,
            ar.nombre AS admin_responsable_nombre,
            e.codigo_expediente
        FROM equipo_juridico_actividades a
        INNER JOIN juridico_estatus_actividad s ON s.id = a.estatus_id
        LEFT JOIN administradores ar ON ar.id = a.admin_responsable_id
        LEFT JOIN expedientes e ON e.id = a.expediente_id
        WHERE a.id = :id
        LIMIT 1
    ");
    $statement->execute(['id' => $activityId]);
    $row = $statement->fetch();

    return $row === false ? null : $row;
}

function portalRequireLegalTeamActivityRowById(PDO $pdo, int $activityId): array
{
    $row = portalFetchLegalTeamActivityRowById($pdo, $activityId);
    if ($row === null) {
        throw new RuntimeException('La actividad solicitada no existe.');
    }

    return $row;
}

function portalFetchSingleLegalTeamActivity(PDO $pdo, int $activityId): array
{
    portalEnsureLegalTeamSchema($pdo);

    $statement = $pdo->prepare("
        SELECT
            a.id,
            a.referencia_actividad,
            a.titulo_actividad,
            a.fecha_entrada,
            a.fecha_compromiso,
            a.nota_adicional,
            a.admin_responsable_id,
            a.estatus_id,
            s.nombre AS estatus_nombre,
            s.color_hex,
            s.es_realizado,
            ar.nombre AS admin_responsable_nombre,
            e.codigo_expediente,
            COUNT(av.id) AS total_actualizaciones,
            MAX(av.fecha_avance) AS ultima_actualizacion_avance
        FROM equipo_juridico_actividades a
        INNER JOIN juridico_estatus_actividad s ON s.id = a.estatus_id
        LEFT JOIN administradores ar ON ar.id = a.admin_responsable_id
        LEFT JOIN expedientes e ON e.id = a.expediente_id
        LEFT JOIN equipo_juridico_actividad_avances av ON av.actividad_id = a.id
        WHERE a.id = :id
        GROUP BY
            a.id,
            a.referencia_actividad,
            a.titulo_actividad,
            a.fecha_entrada,
            a.fecha_compromiso,
            a.nota_adicional,
            a.admin_responsable_id,
            a.estatus_id,
            s.nombre,
            s.color_hex,
            s.es_realizado,
            ar.nombre,
            e.codigo_expediente
        LIMIT 1
    ");
    $statement->execute(['id' => $activityId]);
    $row = $statement->fetch();
    if ($row === false) {
        throw new RuntimeException('La actividad solicitada no existe.');
    }

    return portalMapLegalTeamActivityRow($row);
}

function portalInsertLegalTeamProgress(
    PDO $pdo,
    int $activityId,
    int $adminId,
    ?int $statusId,
    string $title,
    string $description
): void {
    $nextNumberStatement = $pdo->prepare("
        SELECT COALESCE(MAX(numero_actualizacion), 0) + 1
        FROM equipo_juridico_actividad_avances
        WHERE actividad_id = :actividad_id
    ");
    $nextNumberStatement->execute(['actividad_id' => $activityId]);
    $nextNumber = (int) $nextNumberStatement->fetchColumn();

    $insert = $pdo->prepare("
        INSERT INTO equipo_juridico_actividad_avances (
            actividad_id,
            numero_actualizacion,
            estatus_id,
            titulo_avance,
            descripcion_avance,
            admin_id,
            fecha_avance,
            visible_en_resumen
        ) VALUES (
            :actividad_id,
            :numero_actualizacion,
            :estatus_id,
            :titulo_avance,
            :descripcion_avance,
            :admin_id,
            NOW(),
            1
        )
    ");
    $insert->execute([
        'actividad_id' => $activityId,
        'numero_actualizacion' => max(1, $nextNumber),
        'estatus_id' => $statusId,
        'titulo_avance' => $title,
        'descripcion_avance' => $description,
        'admin_id' => $adminId,
    ]);
}

function portalBuildLegalTeamActivityChangeSummary(array $currentRow, array $payload, array $nextStatusRow, string $nextMemberName): ?array
{
    $changes = [];
    $nextTitle = portalNormalizeLegalTeamTitle((string) ($payload['title'] ?? $currentRow['titulo_actividad'] ?? ''));
    if (trim((string) ($currentRow['titulo_actividad'] ?? '')) !== $nextTitle) {
        $changes[] = 'cliente/actividad';
    }

    if ((int) ($currentRow['admin_responsable_id'] ?? 0) !== (int) ($payload['memberId'] ?? $currentRow['admin_responsable_id'] ?? 0)) {
        $changes[] = 'responsable';
    }

    if ((int) ($currentRow['estatus_id'] ?? 0) !== (int) ($nextStatusRow['id'] ?? 0)) {
        $changes[] = 'estatus';
    }

    $currentEntry = portalNormalizeLegalTeamDate((string) ($currentRow['fecha_entrada'] ?? ''), 'entrada', true);
    $nextEntry = portalNormalizeLegalTeamDate((string) ($payload['entryDate'] ?? $currentRow['fecha_entrada'] ?? ''), 'entrada', true);
    if ($currentEntry !== $nextEntry) {
        $changes[] = 'fecha de entrada';
    }

    $currentDue = portalNormalizeLegalTeamDate($currentRow['fecha_compromiso'] !== null ? (string) $currentRow['fecha_compromiso'] : '', 'compromiso');
    $nextDue = portalNormalizeLegalTeamDate((string) ($payload['dueDate'] ?? ($currentRow['fecha_compromiso'] ?? '')), 'compromiso');
    if ($currentDue !== $nextDue) {
        $changes[] = 'fecha compromiso';
    }

    $currentNote = portalNormalizeLegalTeamNote((string) ($currentRow['nota_adicional'] ?? ''));
    $nextNote = portalNormalizeLegalTeamNote((string) ($payload['note'] ?? $currentRow['nota_adicional'] ?? ''));
    if ($currentNote !== $nextNote) {
        $changes[] = 'nota adicional';
    }

    if ($changes === []) {
        return null;
    }

    return [
        'title' => 'Actividad actualizada',
        'description' => sprintf(
            'Se actualizaron %s. Responsable: %s. Estatus actual: %s.',
            implode(', ', $changes),
            $nextMemberName,
            (string) ($nextStatusRow['nombre'] ?? '')
        ),
    ];
}

function portalCreateLegalTeamActivity(PDO $pdo, array $payload, array $adminSession): array
{
    portalEnsureLegalTeamSchema($pdo);

    $title = portalNormalizeLegalTeamTitle((string) ($payload['title'] ?? ''));
    $memberId = portalNormalizeLegalTeamMemberId($pdo, $payload['memberId'] ?? 0);
    $statusRow = portalNormalizeLegalTeamStatusId($pdo, $payload['statusId'] ?? 0);
    $entryDate = portalNormalizeLegalTeamDate((string) ($payload['entryDate'] ?? ''), 'entrada', true) ?? date('Y-m-d H:i:s');
    $dueDate = portalNormalizeLegalTeamDate((string) ($payload['dueDate'] ?? ''), 'compromiso');
    $note = portalNormalizeLegalTeamNote((string) ($payload['note'] ?? ''));
    $dossierId = portalResolveOptionalLegalTeamDossierId($pdo, (string) ($payload['dossierCode'] ?? ''));
    $memberRow = portalRequireAdminMemberRowById($pdo, $memberId);
    $isCompleted = (int) ($statusRow['es_realizado'] ?? 0) === 1;

    $insert = $pdo->prepare("
        INSERT INTO equipo_juridico_actividades (
            referencia_actividad,
            expediente_id,
            admin_responsable_id,
            admin_creador_id,
            titulo_actividad,
            fecha_entrada,
            estatus_id,
            fecha_compromiso,
            nota_adicional,
            fecha_realizado,
            es_externa
        ) VALUES (
            :referencia_actividad,
            :expediente_id,
            :admin_responsable_id,
            :admin_creador_id,
            :titulo_actividad,
            :fecha_entrada,
            :estatus_id,
            :fecha_compromiso,
            :nota_adicional,
            :fecha_realizado,
            1
        )
    ");

    $insert->execute([
        'referencia_actividad' => portalGenerateReference('JACT'),
        'expediente_id' => $dossierId,
        'admin_responsable_id' => $memberId,
        'admin_creador_id' => (int) ($adminSession['id'] ?? 0),
        'titulo_actividad' => $title,
        'fecha_entrada' => $entryDate,
        'estatus_id' => (int) $statusRow['id'],
        'fecha_compromiso' => $dueDate,
        'nota_adicional' => $note !== '' ? $note : null,
        'fecha_realizado' => $isCompleted ? date('Y-m-d H:i:s') : null,
    ]);

    $activityId = (int) $pdo->lastInsertId();
    portalInsertLegalTeamProgress(
        $pdo,
        $activityId,
        (int) ($adminSession['id'] ?? 0),
        (int) $statusRow['id'],
        'Actividad creada',
        sprintf(
            'Se registro la actividad "%s" asignada a %s con estatus %s.',
            $title,
            (string) ($memberRow['nombre'] ?? ''),
            (string) ($statusRow['nombre'] ?? '')
        )
    );

    return portalFetchSingleLegalTeamActivity($pdo, $activityId);
}

function portalUpdateLegalTeamActivity(PDO $pdo, array $payload, array $adminSession): array
{
    portalEnsureLegalTeamSchema($pdo);

    $activityId = portalNormalizeLegalTeamActivityId($payload['activityId'] ?? $payload['id'] ?? 0);
    $currentRow = portalRequireLegalTeamActivityRowById($pdo, $activityId);

    $nextTitle = array_key_exists('title', $payload)
        ? portalNormalizeLegalTeamTitle((string) ($payload['title'] ?? ''))
        : (string) ($currentRow['titulo_actividad'] ?? '');
    $nextMemberId = array_key_exists('memberId', $payload)
        ? portalNormalizeLegalTeamMemberId($pdo, $payload['memberId'])
        : (int) ($currentRow['admin_responsable_id'] ?? 0);
    $nextStatusRow = array_key_exists('statusId', $payload)
        ? portalNormalizeLegalTeamStatusId($pdo, $payload['statusId'])
        : portalNormalizeLegalTeamStatusId($pdo, $currentRow['estatus_id'] ?? 0);
    $nextEntryDate = array_key_exists('entryDate', $payload)
        ? portalNormalizeLegalTeamDate((string) ($payload['entryDate'] ?? ''), 'entrada', true)
        : portalNormalizeLegalTeamDate((string) ($currentRow['fecha_entrada'] ?? ''), 'entrada', true);
    $nextDueDate = array_key_exists('dueDate', $payload)
        ? portalNormalizeLegalTeamDate((string) ($payload['dueDate'] ?? ''), 'compromiso')
        : portalNormalizeLegalTeamDate($currentRow['fecha_compromiso'] !== null ? (string) $currentRow['fecha_compromiso'] : '', 'compromiso');
    $nextNote = array_key_exists('note', $payload)
        ? portalNormalizeLegalTeamNote((string) ($payload['note'] ?? ''))
        : portalNormalizeLegalTeamNote((string) ($currentRow['nota_adicional'] ?? ''));
    $nextDossierId = array_key_exists('dossierCode', $payload)
        ? portalResolveOptionalLegalTeamDossierId($pdo, (string) ($payload['dossierCode'] ?? ''))
        : ($currentRow['expediente_id'] !== null ? (int) $currentRow['expediente_id'] : null);
    $nextMemberRow = portalRequireAdminMemberRowById($pdo, $nextMemberId);

    $summary = portalBuildLegalTeamActivityChangeSummary(
        $currentRow,
        [
            'title' => $nextTitle,
            'memberId' => $nextMemberId,
            'statusId' => (int) ($nextStatusRow['id'] ?? 0),
            'entryDate' => $nextEntryDate,
            'dueDate' => $nextDueDate,
            'note' => $nextNote,
        ],
        $nextStatusRow,
        (string) ($nextMemberRow['nombre'] ?? '')
    );

    if ($summary === null) {
        return portalFetchSingleLegalTeamActivity($pdo, $activityId);
    }

    $isCompleted = (int) ($nextStatusRow['es_realizado'] ?? 0) === 1;
    $update = $pdo->prepare("
        UPDATE equipo_juridico_actividades
        SET expediente_id = :expediente_id,
            admin_responsable_id = :admin_responsable_id,
            titulo_actividad = :titulo_actividad,
            fecha_entrada = :fecha_entrada,
            estatus_id = :estatus_id,
            fecha_compromiso = :fecha_compromiso,
            nota_adicional = :nota_adicional,
            fecha_realizado = :fecha_realizado
        WHERE id = :id
    ");
    $update->execute([
        'expediente_id' => $nextDossierId,
        'admin_responsable_id' => $nextMemberId,
        'titulo_actividad' => $nextTitle,
        'fecha_entrada' => $nextEntryDate,
        'estatus_id' => (int) $nextStatusRow['id'],
        'fecha_compromiso' => $nextDueDate,
        'nota_adicional' => $nextNote !== '' ? $nextNote : null,
        'fecha_realizado' => $isCompleted ? date('Y-m-d H:i:s') : null,
        'id' => $activityId,
    ]);

    portalInsertLegalTeamProgress(
        $pdo,
        $activityId,
        (int) ($adminSession['id'] ?? 0),
        (int) $nextStatusRow['id'],
        (string) $summary['title'],
        (string) $summary['description']
    );

    return portalFetchSingleLegalTeamActivity($pdo, $activityId);
}
