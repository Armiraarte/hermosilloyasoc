SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS administrador_expedientes
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE administrador_expedientes;

CREATE TABLE IF NOT EXISTS administradores (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario VARCHAR(80) NOT NULL,
  nombre VARCHAR(190) NOT NULL,
  tipo_usuario VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
  password_hash VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  mostrar_en_equipo_juridico TINYINT(1) NOT NULL DEFAULT 1,
  orden_equipo_juridico INT UNSIGNED NOT NULL DEFAULT 1,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_administradores_usuario (usuario),
  KEY idx_administradores_equipo_juridico (activo, mostrar_en_equipo_juridico, orden_equipo_juridico, nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clientes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre_completo VARCHAR(190) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  correo VARCHAR(190) NULL,
  codigo_acceso CHAR(7) NOT NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_codigo_acceso (codigo_acceso),
  KEY idx_clientes_nombre_codigo (nombre_completo, codigo_acceso),
  KEY idx_clientes_correo (correo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS expedientes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_expediente VARCHAR(60) NOT NULL,
  cliente_id BIGINT UNSIGNED NOT NULL,
  creado_por_admin_id BIGINT UNSIGNED NULL,
  asignado_admin_id BIGINT UNSIGNED NULL,
  titulo_juicio VARCHAR(190) NOT NULL,
  descripcion TEXT NULL,
  actor VARCHAR(190) NOT NULL,
  demandado VARCHAR(190) NOT NULL,
  juzgado VARCHAR(190) NULL,
  partido_judicial VARCHAR(190) NULL,
  categoria VARCHAR(120) NULL,
  estatus ENUM(
    'ESPERANDO_ACUERDO',
    'ESP_REG_PS_AG',
    'FINALIZADO',
    'ESP_TERMINO',
    'ESP_AL_CLIENTE',
    'PENDIENTE_SEGUIMIENTO',
    'AUD_DILIG_PROXIMA',
    'PENDIENTE',
    'REALIZADO'
  ) NOT NULL DEFAULT 'PENDIENTE_SEGUIMIENTO',
  estado_juridico ENUM(
    'ESPERANDO_ACUERDO',
    'ESP_REG_PS_AG',
    'FINALIZADO',
    'ESP_TERMINO',
    'ESP_AL_CLIENTE',
    'PENDIENTE_SEGUIMIENTO',
    'AUD_DILIG_PROXIMA',
    'PENDIENTE',
    'REALIZADO'
  ) NOT NULL DEFAULT 'PENDIENTE_SEGUIMIENTO',
  notas_pendientes TEXT NULL,
  fecha_apertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_expedientes_codigo (codigo_expediente),
  KEY idx_expedientes_cliente (cliente_id),
  KEY idx_expedientes_asignado (asignado_admin_id),
  KEY idx_expedientes_estatus_actualizacion (estatus, ultima_actualizacion),
  KEY idx_expedientes_estado_juridico (estado_juridico),
  KEY idx_expedientes_categoria (categoria),
  CONSTRAINT fk_expedientes_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_expedientes_creado_por
    FOREIGN KEY (creado_por_admin_id) REFERENCES administradores (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_expedientes_asignado
    FOREIGN KEY (asignado_admin_id) REFERENCES administradores (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS expediente_historial (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  expediente_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED NULL,
  referencia_fase VARCHAR(80) NOT NULL,
  titulo_movimiento VARCHAR(190) NOT NULL,
  descripcion_movimiento TEXT NULL,
  fecha_movimiento DATETIME NOT NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_historial_referencia_fase (referencia_fase),
  KEY idx_historial_expediente_fecha (expediente_id, fecha_movimiento),
  KEY idx_historial_expediente_referencia (expediente_id, referencia_fase),
  CONSTRAINT fk_historial_expediente
    FOREIGN KEY (expediente_id) REFERENCES expedientes (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_historial_admin
    FOREIGN KEY (admin_id) REFERENCES administradores (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS expediente_calendario (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  expediente_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED NULL,
  referencia_evento VARCHAR(80) NOT NULL,
  tipo_evento ENUM('AUDIENCIA', 'VENCIMIENTO', 'CITA', 'RECORDATORIO') NOT NULL DEFAULT 'AUDIENCIA',
  titulo_evento VARCHAR(190) NOT NULL,
  descripcion_evento TEXT NULL,
  fecha_evento DATETIME NOT NULL,
  ubicacion VARCHAR(190) NULL,
  visible_cliente TINYINT(1) NOT NULL DEFAULT 1,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_calendario_referencia_evento (referencia_evento),
  KEY idx_calendario_expediente_fecha (expediente_id, fecha_evento),
  KEY idx_calendario_expediente_visibilidad (expediente_id, visible_cliente, fecha_evento),
  CONSTRAINT fk_calendario_expediente
    FOREIGN KEY (expediente_id) REFERENCES expedientes (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_calendario_admin
    FOREIGN KEY (admin_id) REFERENCES administradores (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS expediente_archivos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  expediente_id BIGINT UNSIGNED NOT NULL,
  historial_id BIGINT UNSIGNED NULL,
  admin_id BIGINT UNSIGNED NULL,
  referencia_archivo VARCHAR(80) NOT NULL,
  nombre_original VARCHAR(255) NOT NULL,
  nombre_guardado VARCHAR(255) NOT NULL,
  ruta_archivo VARCHAR(500) NOT NULL,
  tamano_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  mime_type VARCHAR(120) NULL,
  visible_cliente TINYINT(1) NOT NULL DEFAULT 1,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_archivos_referencia_archivo (referencia_archivo),
  KEY idx_archivos_expediente_fecha (expediente_id, fecha_registro),
  KEY idx_archivos_historial (historial_id),
  KEY idx_archivos_expediente_historial (expediente_id, historial_id),
  CONSTRAINT fk_archivos_expediente
    FOREIGN KEY (expediente_id) REFERENCES expedientes (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_archivos_historial
    FOREIGN KEY (historial_id) REFERENCES expediente_historial (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_archivos_admin
    FOREIGN KEY (admin_id) REFERENCES administradores (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO administradores (usuario, nombre, tipo_usuario, password_hash, activo)
SELECT 'admin', 'Administrador General', 'ADMIN', '$2y$10$xEXeTcHSF0bBiI8as0Q9g.7TWyQYruf/Kp8X8CXtkcOUYrnQq52.G', 1
WHERE NOT EXISTS (
  SELECT 1
  FROM administradores
  WHERE usuario = 'admin'
);

-- USUARIO SEMILLA
-- usuario: admin
-- contrasena: admin
--
-- MODIFICA AQUI si quieres empezar con otro usuario:
-- UPDATE administradores SET usuario = 'tu_usuario' WHERE id = 1;
--
-- MODIFICA AQUI si quieres otro password:
-- genera otro hash con:
-- php -r "echo password_hash('tu_password', PASSWORD_DEFAULT), PHP_EOL;"
-- y luego actualiza password_hash en administradores.
