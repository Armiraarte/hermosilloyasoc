<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';

function portalAdminMembersColumnExists(PDO $pdo, string $columnName): bool
{
    $statement = $pdo->prepare("SHOW COLUMNS FROM administradores LIKE :column_name");
    $statement->execute([
        'column_name' => $columnName,
    ]);

    return $statement->fetch() !== false;
}

function portalAdminMembersIndexExists(PDO $pdo, string $indexName): bool
{
    $statement = $pdo->prepare("SHOW INDEX FROM administradores WHERE Key_name = :index_name");
    $statement->execute([
        'index_name' => $indexName,
    ]);

    return $statement->fetch() !== false;
}

function portalAdminMembersMigrationMessage(string $details = ''): string
{
    $message = 'La base de datos no tiene actualizada la estructura del apartado de miembros. Ejecuta bd/admin_members_patch.sql en produccion con un usuario que tenga permisos ALTER e INDEX.';

    if ($details !== '') {
        $message .= ' Detalle: ' . $details;
    }

    return $message;
}

function portalEnsureAdminMembersSchema(PDO $pdo): void
{
    static $isEnsured = false;

    if ($isEnsured) {
        return;
    }

    $hasLegalTeamVisibilityColumn = portalAdminMembersColumnExists($pdo, 'mostrar_en_equipo_juridico');
    if (!$hasLegalTeamVisibilityColumn) {
        try {
            $pdo->exec("
                ALTER TABLE administradores
                ADD COLUMN mostrar_en_equipo_juridico TINYINT(1) NOT NULL DEFAULT 1
                AFTER activo
            ");
        } catch (PDOException $exception) {
            if (!portalAdminMembersColumnExists($pdo, 'mostrar_en_equipo_juridico')) {
                throw new RuntimeException(portalAdminMembersMigrationMessage($exception->getMessage()));
            }
        }
    }

    $hasLegalTeamOrderColumn = portalAdminMembersColumnExists($pdo, 'orden_equipo_juridico');
    if (!$hasLegalTeamOrderColumn) {
        try {
            $pdo->exec("
                ALTER TABLE administradores
                ADD COLUMN orden_equipo_juridico INT UNSIGNED NOT NULL DEFAULT 0
                AFTER mostrar_en_equipo_juridico
            ");
        } catch (PDOException $exception) {
            if (!portalAdminMembersColumnExists($pdo, 'orden_equipo_juridico')) {
                throw new RuntimeException(portalAdminMembersMigrationMessage($exception->getMessage()));
            }
        }
    }

    if (!portalAdminMembersColumnExists($pdo, 'mostrar_en_equipo_juridico') || !portalAdminMembersColumnExists($pdo, 'orden_equipo_juridico')) {
        throw new RuntimeException(portalAdminMembersMigrationMessage());
    }

    $hasLegalTeamIndex = portalAdminMembersIndexExists($pdo, 'idx_administradores_equipo_juridico');
    if (!$hasLegalTeamIndex) {
        try {
            $pdo->exec("
                CREATE INDEX idx_administradores_equipo_juridico
                ON administradores (activo, mostrar_en_equipo_juridico, orden_equipo_juridico, nombre)
            ");
        } catch (PDOException $exception) {
            if (!portalAdminMembersIndexExists($pdo, 'idx_administradores_equipo_juridico')) {
                error_log('[admin_members] No se pudo crear idx_administradores_equipo_juridico: ' . $exception->getMessage());
            }
        }
    }

    $membersMissingOrder = (int) $pdo
        ->query('SELECT COUNT(*) FROM administradores WHERE orden_equipo_juridico IS NULL OR orden_equipo_juridico = 0')
        ->fetchColumn();

    if ($membersMissingOrder > 0) {
        $pdo->exec('SET @portal_admin_member_order := 0');
        $pdo->exec("
            UPDATE administradores a
            INNER JOIN (
                SELECT
                    id,
                    (@portal_admin_member_order := @portal_admin_member_order + 1) AS next_order
                FROM administradores
                ORDER BY activo DESC, nombre ASC, id ASC
            ) sequence_map ON sequence_map.id = a.id
            SET a.orden_equipo_juridico = sequence_map.next_order
        ");
    }

    $isEnsured = true;
}

function portalNormalizeAdminMemberId($value): int
{
    $id = (int) $value;
    if ($id <= 0) {
        throw new InvalidArgumentException('Debes enviar un identificador de miembro valido.');
    }

    return $id;
}

function portalNormalizeAdminUsername(?string $value): string
{
    $username = strtolower(trim((string) $value));
    if ($username === '') {
        throw new InvalidArgumentException('Debes enviar el usuario del miembro.');
    }

    if (preg_match('/^[a-z0-9._-]{3,80}$/', $username) !== 1) {
        throw new InvalidArgumentException('El usuario solo puede contener letras, numeros, puntos, guiones y guion bajo.');
    }

    return $username;
}

function portalNormalizeAdminName(?string $value): string
{
    $name = trim((string) $value);
    if ($name === '') {
        throw new InvalidArgumentException('Debes enviar el nombre del miembro.');
    }

    if (mb_strlen($name, 'UTF-8') > 190) {
        throw new InvalidArgumentException('El nombre del miembro es demasiado largo.');
    }

    return $name;
}

function portalNormalizeAdminType(?string $value): string
{
    $type = strtoupper(trim((string) $value));
    if ($type === '') {
        throw new InvalidArgumentException('Debes enviar el tipo de usuario.');
    }

    if (preg_match('/^[A-Z0-9_-]{3,50}$/', $type) !== 1) {
        throw new InvalidArgumentException('El tipo de usuario solo puede contener letras, numeros, guiones y guion bajo.');
    }

    return $type;
}

function portalNormalizeAdminRoleToken(?string $value): string
{
    $normalized = mb_strtoupper(trim((string) $value), 'UTF-8');
    if ($normalized === '') {
        return '';
    }

    $normalized = strtr($normalized, [
        'Á' => 'A',
        'É' => 'E',
        'Í' => 'I',
        'Ó' => 'O',
        'Ú' => 'U',
        'Ü' => 'U',
        'Ñ' => 'N',
    ]);

    $normalized = preg_replace('/[^A-Z0-9]+/', '', $normalized);

    return is_string($normalized) ? $normalized : '';
}

function portalNormalizeAdminPassword(?string $value): string
{
    $password = trim((string) $value);
    if ($password === '') {
        throw new InvalidArgumentException('Debes asignar una contrasena al nuevo miembro.');
    }

    if (strlen($password) < 6) {
        throw new InvalidArgumentException('La contrasena debe tener al menos 6 caracteres.');
    }

    return $password;
}

function portalNormalizeAdminMemberLegalTeamVisibility($value): bool
{
    return portalNormalizeBoolean($value, true);
}

function portalNormalizeAdminMemberMoveDirection(?string $value): string
{
    $direction = strtolower(trim((string) $value));
    if (!in_array($direction, ['up', 'down'], true)) {
        throw new InvalidArgumentException('La direccion de reordenamiento no es valida.');
    }

    return $direction;
}

function portalCanManageAdminMembers(array $adminSession): bool
{
    $type = portalNormalizeAdminRoleToken((string) ($adminSession['type'] ?? ''));

    if ($type === '') {
        return false;
    }

    return strpos($type, 'ADMIN') !== false || $type === 'OWNER' || strpos($type, 'SOCIO') !== false;
}

function portalRequireAdminMemberManager(): array
{
    $adminSession = portalRequireAdminAuth();

    if (!portalCanManageAdminMembers($adminSession)) {
        portalJsonResponse([
            'ok' => false,
            'message' => 'Tu cuenta no tiene permisos para administrar miembros.',
        ], 403);
    }

    return $adminSession;
}

function portalMapAdminMemberRow(array $row): array
{
    return [
        'id' => (int) ($row['id'] ?? 0),
        'username' => (string) ($row['usuario'] ?? ''),
        'name' => (string) ($row['nombre'] ?? ''),
        'type' => (string) ($row['tipo_usuario'] ?? ''),
        'active' => (bool) ($row['activo'] ?? false),
        'showInLegalTeam' => (bool) ($row['mostrar_en_equipo_juridico'] ?? true),
        'legalTeamOrder' => (int) ($row['orden_equipo_juridico'] ?? 0),
        'createdAt' => portalIsoDateTime((string) ($row['fecha_registro'] ?? '')),
    ];
}

function portalFetchAdminMembers(PDO $pdo): array
{
    portalEnsureAdminMembersSchema($pdo);

    $statement = $pdo->query("
        SELECT id, usuario, nombre, tipo_usuario, activo, mostrar_en_equipo_juridico, orden_equipo_juridico, fecha_registro
        FROM administradores
        ORDER BY activo DESC, orden_equipo_juridico ASC, nombre ASC, id ASC
    ");

    return array_map('portalMapAdminMemberRow', $statement->fetchAll());
}

function portalFetchActiveAdminMembers(PDO $pdo): array
{
    portalEnsureAdminMembersSchema($pdo);

    $statement = $pdo->query("
        SELECT id, usuario, nombre, tipo_usuario, activo, mostrar_en_equipo_juridico, orden_equipo_juridico, fecha_registro
        FROM administradores
        WHERE activo = 1
          AND mostrar_en_equipo_juridico = 1
        ORDER BY orden_equipo_juridico ASC, nombre ASC, id ASC
    ");

    return array_map('portalMapAdminMemberRow', $statement->fetchAll());
}

function portalFetchAdminMemberRowById(PDO $pdo, int $memberId): ?array
{
    portalEnsureAdminMembersSchema($pdo);

    $statement = $pdo->prepare("
        SELECT id, usuario, nombre, tipo_usuario, activo, mostrar_en_equipo_juridico, orden_equipo_juridico, fecha_registro
        FROM administradores
        WHERE id = :id
        LIMIT 1
    ");
    $statement->execute([
        'id' => $memberId,
    ]);

    $row = $statement->fetch();
    return $row === false ? null : $row;
}

function portalRequireAdminMemberRowById(PDO $pdo, int $memberId): array
{
    $row = portalFetchAdminMemberRowById($pdo, $memberId);
    if ($row === null) {
        throw new RuntimeException('No se encontro la cuenta solicitada.');
    }

    return $row;
}

function portalCountActiveAdminMembers(PDO $pdo): int
{
    $statement = $pdo->query('SELECT COUNT(*) FROM administradores WHERE activo = 1');
    return (int) $statement->fetchColumn();
}

function portalNextAdminMemberLegalTeamOrder(PDO $pdo): int
{
    portalEnsureAdminMembersSchema($pdo);

    $statement = $pdo->query('SELECT COALESCE(MAX(orden_equipo_juridico), 0) + 1 FROM administradores');
    return (int) $statement->fetchColumn();
}

function portalCreateAdminMember(PDO $pdo, array $payload): array
{
    portalEnsureAdminMembersSchema($pdo);

    $username = portalNormalizeAdminUsername((string) ($payload['username'] ?? ''));
    $name = portalNormalizeAdminName((string) ($payload['name'] ?? $payload['nombre'] ?? ''));
    $type = portalNormalizeAdminType((string) ($payload['type'] ?? $payload['tipo'] ?? 'PASANTE'));
    $password = portalNormalizeAdminPassword((string) ($payload['password'] ?? ''));
    $active = portalNormalizeBoolean($payload['active'] ?? true, true);
    $showInLegalTeam = portalNormalizeAdminMemberLegalTeamVisibility($payload['showInLegalTeam'] ?? true);
    $legalTeamOrder = portalNextAdminMemberLegalTeamOrder($pdo);

    $exists = $pdo->prepare('SELECT id FROM administradores WHERE usuario = :usuario LIMIT 1');
    $exists->execute([
        'usuario' => $username,
    ]);
    if ($exists->fetchColumn() !== false) {
        throw new RuntimeException('Ya existe una cuenta con ese usuario.');
    }

    $insert = $pdo->prepare("
        INSERT INTO administradores (
            usuario,
            nombre,
            tipo_usuario,
            password_hash,
            activo,
            mostrar_en_equipo_juridico,
            orden_equipo_juridico
        ) VALUES (
            :usuario,
            :nombre,
            :tipo_usuario,
            :password_hash,
            :activo,
            :mostrar_en_equipo_juridico,
            :orden_equipo_juridico
        )
    ");
    $insert->execute([
        'usuario' => $username,
        'nombre' => $name,
        'tipo_usuario' => $type,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'activo' => $active ? 1 : 0,
        'mostrar_en_equipo_juridico' => $showInLegalTeam ? 1 : 0,
        'orden_equipo_juridico' => $legalTeamOrder,
    ]);

    return portalMapAdminMemberRow(portalRequireAdminMemberRowById($pdo, (int) $pdo->lastInsertId()));
}

function portalUpdateAdminMemberActiveStatus(PDO $pdo, array $payload, array $currentAdmin): array
{
    portalEnsureAdminMembersSchema($pdo);

    $memberId = portalNormalizeAdminMemberId($payload['memberId'] ?? $payload['adminId'] ?? 0);
    $nextActive = portalNormalizeBoolean($payload['active'] ?? null, true);
    $currentRow = portalRequireAdminMemberRowById($pdo, $memberId);
    $currentActive = (int) ($currentRow['activo'] ?? 0) === 1;

    if ($memberId === (int) ($currentAdmin['id'] ?? 0) && !$nextActive) {
        throw new RuntimeException('No puedes desactivar tu propia cuenta desde este panel.');
    }

    if ($currentActive && !$nextActive && portalCountActiveAdminMembers($pdo) <= 1) {
        throw new RuntimeException('Debe permanecer al menos una cuenta activa en el sistema.');
    }

    if ($currentActive === $nextActive) {
        return portalMapAdminMemberRow($currentRow);
    }

    $update = $pdo->prepare('UPDATE administradores SET activo = :activo WHERE id = :id');
    $update->execute([
        'activo' => $nextActive ? 1 : 0,
        'id' => $memberId,
    ]);

    return portalMapAdminMemberRow(portalRequireAdminMemberRowById($pdo, $memberId));
}

function portalUpdateAdminMemberLegalTeamVisibility(PDO $pdo, array $payload): array
{
    portalEnsureAdminMembersSchema($pdo);

    $memberId = portalNormalizeAdminMemberId($payload['memberId'] ?? $payload['adminId'] ?? 0);
    $showInLegalTeam = portalNormalizeAdminMemberLegalTeamVisibility(
        $payload['showInLegalTeam'] ?? $payload['visible'] ?? $payload['mostrarEnEquipoJuridico'] ?? true
    );
    $currentRow = portalRequireAdminMemberRowById($pdo, $memberId);
    $currentVisibility = (int) ($currentRow['mostrar_en_equipo_juridico'] ?? 1) === 1;

    if ($currentVisibility === $showInLegalTeam) {
        return portalMapAdminMemberRow($currentRow);
    }

    $update = $pdo->prepare('UPDATE administradores SET mostrar_en_equipo_juridico = :visible WHERE id = :id');
    $update->execute([
        'visible' => $showInLegalTeam ? 1 : 0,
        'id' => $memberId,
    ]);

    return portalMapAdminMemberRow(portalRequireAdminMemberRowById($pdo, $memberId));
}

function portalUpdateAdminMemberPassword(PDO $pdo, array $payload, array $currentAdmin): array
{
    portalEnsureAdminMembersSchema($pdo);

    $memberId = portalNormalizeAdminMemberId($payload['memberId'] ?? $payload['adminId'] ?? 0);
    $password = portalNormalizeAdminPassword((string) ($payload['password'] ?? ''));
    portalRequireAdminMemberRowById($pdo, $memberId);

    $update = $pdo->prepare('UPDATE administradores SET password_hash = :password_hash WHERE id = :id');
    $update->execute([
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'id' => $memberId,
    ]);

    if ($memberId === (int) ($currentAdmin['id'] ?? 0)) {
        $_SESSION['portal_admin_authenticated'] = true;
    }

    return portalMapAdminMemberRow(portalRequireAdminMemberRowById($pdo, $memberId));
}

function portalMoveAdminMemberLegalTeamPosition(PDO $pdo, array $payload): void
{
    portalEnsureAdminMembersSchema($pdo);

    $memberId = portalNormalizeAdminMemberId($payload['memberId'] ?? $payload['adminId'] ?? 0);
    $direction = portalNormalizeAdminMemberMoveDirection((string) ($payload['direction'] ?? ''));
    $currentRow = portalRequireAdminMemberRowById($pdo, $memberId);
    $currentOrder = (int) ($currentRow['orden_equipo_juridico'] ?? 0);
    $currentActive = (int) ($currentRow['activo'] ?? 0);

    $neighborQuery = $direction === 'up'
        ? "
            SELECT id, orden_equipo_juridico
            FROM administradores
            WHERE activo = :activo
              AND (
                orden_equipo_juridico < :orden
                OR (orden_equipo_juridico = :orden AND id < :id)
              )
            ORDER BY orden_equipo_juridico DESC, id DESC
            LIMIT 1
        "
        : "
            SELECT id, orden_equipo_juridico
            FROM administradores
            WHERE activo = :activo
              AND (
                orden_equipo_juridico > :orden
                OR (orden_equipo_juridico = :orden AND id > :id)
              )
            ORDER BY orden_equipo_juridico ASC, id ASC
            LIMIT 1
        ";

    $neighborStatement = $pdo->prepare($neighborQuery);
    $neighborStatement->execute([
        'activo' => $currentActive,
        'orden' => $currentOrder,
        'id' => $memberId,
    ]);
    $neighborRow = $neighborStatement->fetch();

    if ($neighborRow === false) {
        return;
    }

    $neighborId = (int) ($neighborRow['id'] ?? 0);
    $neighborOrder = (int) ($neighborRow['orden_equipo_juridico'] ?? 0);

    $temporaryOrder = max($currentOrder, $neighborOrder) + 1000000;

    $moveCurrentToTemporary = $pdo->prepare('UPDATE administradores SET orden_equipo_juridico = :orden WHERE id = :id');
    $moveCurrentToTemporary->execute([
        'orden' => $temporaryOrder,
        'id' => $memberId,
    ]);

    $moveNeighbor = $pdo->prepare('UPDATE administradores SET orden_equipo_juridico = :orden WHERE id = :id');
    $moveNeighbor->execute([
        'orden' => $currentOrder,
        'id' => $neighborId,
    ]);

    $moveCurrent = $pdo->prepare('UPDATE administradores SET orden_equipo_juridico = :orden WHERE id = :id');
    $moveCurrent->execute([
        'orden' => $neighborOrder,
        'id' => $memberId,
    ]);
}

function portalDeleteAdminMember(PDO $pdo, array $payload, array $currentAdmin): void
{
    portalEnsureAdminMembersSchema($pdo);

    $memberId = portalNormalizeAdminMemberId($payload['memberId'] ?? $payload['adminId'] ?? 0);
    $currentRow = portalRequireAdminMemberRowById($pdo, $memberId);

    if ($memberId === (int) ($currentAdmin['id'] ?? 0)) {
        throw new RuntimeException('No puedes eliminar tu propia cuenta desde este panel.');
    }

    if ((int) ($currentRow['activo'] ?? 0) === 1 && portalCountActiveAdminMembers($pdo) <= 1) {
        throw new RuntimeException('No puedes eliminar la ultima cuenta activa del sistema.');
    }

    $delete = $pdo->prepare('DELETE FROM administradores WHERE id = :id');
    $delete->execute([
        'id' => $memberId,
    ]);

    if ($delete->rowCount() === 0) {
        throw new RuntimeException('No se pudo eliminar la cuenta solicitada.');
    }
}
