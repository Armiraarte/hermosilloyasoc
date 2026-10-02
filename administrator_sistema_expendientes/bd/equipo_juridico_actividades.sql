USE administrador_expedientes;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  activo = VALUES(activo);

CREATE TABLE IF NOT EXISTS equipo_juridico_actividades (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  referencia_actividad VARCHAR(80) NOT NULL,
  expediente_id BIGINT UNSIGNED NULL,
  cliente_id BIGINT UNSIGNED NULL,
  admin_responsable_id BIGINT UNSIGNED NULL,
  admin_creador_id BIGINT UNSIGNED NULL,
  titulo_actividad VARCHAR(220) NOT NULL,
  cliente_referencia VARCHAR(190) NULL,
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
  KEY idx_equipo_juridico_actividad_cliente (cliente_id),
  CONSTRAINT fk_equipo_juridico_actividad_estatus
    FOREIGN KEY (estatus_id) REFERENCES juridico_estatus_actividad (id)
    ON UPDATE CASCADE,
  CONSTRAINT fk_equipo_juridico_actividad_expediente
    FOREIGN KEY (expediente_id) REFERENCES expedientes (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_equipo_juridico_actividad_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_equipo_juridico_actividad_responsable
    FOREIGN KEY (admin_responsable_id) REFERENCES administradores (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_equipo_juridico_actividad_creador
    FOREIGN KEY (admin_creador_id) REFERENCES administradores (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  KEY idx_equipo_juridico_avance_estatus (estatus_id),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS equipo_juridico_actividad_archivos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actividad_id BIGINT UNSIGNED NOT NULL,
  avance_id BIGINT UNSIGNED NULL,
  admin_id BIGINT UNSIGNED NULL,
  referencia_archivo VARCHAR(80) NOT NULL,
  nombre_original VARCHAR(255) NOT NULL,
  nombre_guardado VARCHAR(255) NOT NULL,
  ruta_archivo VARCHAR(500) NOT NULL,
  tamano_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  mime_type VARCHAR(120) NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_equipo_juridico_archivo_ref (referencia_archivo),
  KEY idx_equipo_juridico_archivo_actividad (actividad_id),
  KEY idx_equipo_juridico_archivo_avance (avance_id),
  CONSTRAINT fk_equipo_juridico_archivo_actividad
    FOREIGN KEY (actividad_id) REFERENCES equipo_juridico_actividades (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_equipo_juridico_archivo_avance
    FOREIGN KEY (avance_id) REFERENCES equipo_juridico_actividad_avances (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_equipo_juridico_archivo_admin
    FOREIGN KEY (admin_id) REFERENCES administradores (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS trg_equipo_juridico_avance_numero;
DELIMITER $$
CREATE TRIGGER trg_equipo_juridico_avance_numero
BEFORE INSERT ON equipo_juridico_actividad_avances
FOR EACH ROW
BEGIN
  DECLARE siguiente_numero INT UNSIGNED;

  IF NEW.numero_actualizacion IS NULL OR NEW.numero_actualizacion = 0 THEN
    SELECT COALESCE(MAX(numero_actualizacion), 0) + 1
      INTO siguiente_numero
    FROM equipo_juridico_actividad_avances
    WHERE actividad_id = NEW.actividad_id;

    SET NEW.numero_actualizacion = siguiente_numero;
  END IF;
END$$
DELIMITER ;

CREATE OR REPLACE VIEW vw_equipo_juridico_tablero AS
SELECT
  a.id,
  a.referencia_actividad,
  COALESCE(a.cliente_referencia, c.nombre_completo, e.titulo_juicio) AS cliente,
  a.titulo_actividad,
  a.fecha_entrada,
  s.id AS estatus_id,
  s.nombre AS estado,
  s.color_hex,
  a.fecha_compromiso,
  a.nota_adicional,
  a.fecha_realizado,
  a.es_externa,
  ar.nombre AS responsable,
  COUNT(av.id) AS total_actualizaciones,
  MAX(av.fecha_avance) AS ultima_actualizacion_avance
FROM equipo_juridico_actividades a
INNER JOIN juridico_estatus_actividad s ON s.id = a.estatus_id
LEFT JOIN expedientes e ON e.id = a.expediente_id
LEFT JOIN clientes c ON c.id = a.cliente_id
LEFT JOIN administradores ar ON ar.id = a.admin_responsable_id
LEFT JOIN equipo_juridico_actividad_avances av ON av.actividad_id = a.id
GROUP BY
  a.id,
  a.referencia_actividad,
  cliente,
  a.titulo_actividad,
  a.fecha_entrada,
  s.id,
  s.nombre,
  s.color_hex,
  a.fecha_compromiso,
  a.nota_adicional,
  a.fecha_realizado,
  a.es_externa,
  ar.nombre;

CREATE OR REPLACE VIEW vw_equipo_juridico_actividades_realizadas AS
SELECT
  t.*
FROM vw_equipo_juridico_tablero t
INNER JOIN juridico_estatus_actividad s ON s.id = t.estatus_id
WHERE s.es_realizado = 1;
