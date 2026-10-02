USE administrador_expedientes;

SET @schema_name := DATABASE();

SET @has_visibility_column := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'administradores'
      AND COLUMN_NAME = 'mostrar_en_equipo_juridico'
);

SET @sql_visibility := IF(
    @has_visibility_column = 0,
    'ALTER TABLE administradores ADD COLUMN mostrar_en_equipo_juridico TINYINT(1) NOT NULL DEFAULT 1 AFTER activo',
    'SELECT 1'
);
PREPARE stmt_visibility FROM @sql_visibility;
EXECUTE stmt_visibility;
DEALLOCATE PREPARE stmt_visibility;

SET @has_order_column := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'administradores'
      AND COLUMN_NAME = 'orden_equipo_juridico'
);

SET @sql_order := IF(
    @has_order_column = 0,
    'ALTER TABLE administradores ADD COLUMN orden_equipo_juridico INT UNSIGNED NOT NULL DEFAULT 0 AFTER mostrar_en_equipo_juridico',
    'SELECT 1'
);
PREPARE stmt_order FROM @sql_order;
EXECUTE stmt_order;
DEALLOCATE PREPARE stmt_order;

SET @has_legal_team_index := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'administradores'
      AND INDEX_NAME = 'idx_administradores_equipo_juridico'
);

SET @sql_index := IF(
    @has_legal_team_index = 0,
    'CREATE INDEX idx_administradores_equipo_juridico ON administradores (activo, mostrar_en_equipo_juridico, orden_equipo_juridico, nombre)',
    'SELECT 1'
);
PREPARE stmt_index FROM @sql_index;
EXECUTE stmt_index;
DEALLOCATE PREPARE stmt_index;

SET @portal_admin_member_order := 0;

UPDATE administradores a
INNER JOIN (
    SELECT
        id,
        (@portal_admin_member_order := @portal_admin_member_order + 1) AS next_order
    FROM administradores
    ORDER BY activo DESC, nombre ASC, id ASC
) sequence_map ON sequence_map.id = a.id
SET a.orden_equipo_juridico = sequence_map.next_order
WHERE a.orden_equipo_juridico IS NULL
   OR a.orden_equipo_juridico = 0;
