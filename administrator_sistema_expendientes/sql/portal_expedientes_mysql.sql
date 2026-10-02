SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS administrador_expedientes
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE administrador_expedientes;

CREATE TABLE despachos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  legal_name VARCHAR(190) NOT NULL,
  display_name VARCHAR(190) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  tax_id VARCHAR(50) NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(50) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_despachos_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firm_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_firm_code (firm_id, code),
  UNIQUE KEY uq_roles_firm_id (firm_id, id),
  KEY idx_roles_firm_id (firm_id, id),
  CONSTRAINT fk_roles_firm
    FOREIGN KEY (firm_id) REFERENCES despachos (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firm_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  full_name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_firm_email (firm_id, email),
  UNIQUE KEY uq_usuarios_firm_id (firm_id, id),
  KEY idx_usuarios_role (firm_id, role_id),
  KEY idx_usuarios_firm_id (firm_id, id),
  CONSTRAINT fk_usuarios_firm
    FOREIGN KEY (firm_id) REFERENCES despachos (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_usuarios_role
    FOREIGN KEY (firm_id, role_id) REFERENCES roles (firm_id, id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE sesiones_usuario (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  session_hash CHAR(64) NOT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  last_seen_at DATETIME NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sesiones_usuario_hash (session_hash),
  KEY idx_sesiones_usuario_user (user_id, expires_at),
  CONSTRAINT fk_sesiones_usuario_user
    FOREIGN KEY (user_id) REFERENCES usuarios (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE clientes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firm_id BIGINT UNSIGNED NOT NULL,
  client_code VARCHAR(40) NOT NULL,
  client_type VARCHAR(20) NOT NULL DEFAULT 'person',
  first_name VARCHAR(120) NULL,
  last_name VARCHAR(120) NULL,
  company_name VARCHAR(190) NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(50) NULL,
  tax_id VARCHAR(50) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_firm_code (firm_id, client_code),
  UNIQUE KEY uq_clientes_firm_id (firm_id, id),
  KEY idx_clientes_firm_id (firm_id, id),
  KEY idx_clientes_firm_name (firm_id, company_name, last_name, first_name),
  CONSTRAINT fk_clientes_firm
    FOREIGN KEY (firm_id) REFERENCES despachos (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE areas_servicio (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firm_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(60) NOT NULL,
  name VARCHAR(190) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_areas_servicio_firm_code (firm_id, code),
  UNIQUE KEY uq_areas_servicio_firm_slug (firm_id, slug),
  UNIQUE KEY uq_areas_servicio_firm_id (firm_id, id),
  KEY idx_areas_servicio_firm_id (firm_id, id),
  KEY idx_areas_servicio_firm_active (firm_id, is_active, sort_order),
  CONSTRAINT fk_areas_servicio_firm
    FOREIGN KEY (firm_id) REFERENCES despachos (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE solicitudes_contacto (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firm_id BIGINT UNSIGNED NOT NULL,
  service_area_id BIGINT UNSIGNED NULL,
  assigned_user_id BIGINT UNSIGNED NULL,
  converted_client_id BIGINT UNSIGNED NULL,
  source VARCHAR(40) NOT NULL DEFAULT 'website',
  status VARCHAR(40) NOT NULL DEFAULT 'NUEVO',
  full_name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(50) NOT NULL,
  service_label VARCHAR(190) NULL,
  message TEXT NOT NULL,
  preferred_contact_channel VARCHAR(30) NULL,
  handled_at DATETIME NULL,
  created_from_ip VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_solicitudes_contacto_firm_status (firm_id, status, created_at),
  KEY idx_solicitudes_contacto_firm_service_area (firm_id, service_area_id),
  KEY idx_solicitudes_contacto_firm_assigned_user (firm_id, assigned_user_id),
  KEY idx_solicitudes_contacto_firm_converted_client (firm_id, converted_client_id),
  CONSTRAINT fk_solicitudes_contacto_firm
    FOREIGN KEY (firm_id) REFERENCES despachos (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_solicitudes_contacto_service_area
    FOREIGN KEY (firm_id, service_area_id) REFERENCES areas_servicio (firm_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_solicitudes_contacto_assigned_user
    FOREIGN KEY (firm_id, assigned_user_id) REFERENCES usuarios (firm_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_solicitudes_contacto_converted_client
    FOREIGN KEY (firm_id, converted_client_id) REFERENCES clientes (firm_id, id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE categorias_materia (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firm_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(120) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categorias_materia_firm_code (firm_id, code),
  UNIQUE KEY uq_categorias_materia_firm_id (firm_id, id),
  KEY idx_categorias_materia_firm_id (firm_id, id),
  CONSTRAINT fk_categorias_materia_firm
    FOREIGN KEY (firm_id) REFERENCES despachos (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE estados_expediente (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firm_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(120) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_closed TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_estados_expediente_firm_code (firm_id, code),
  UNIQUE KEY uq_estados_expediente_firm_id (firm_id, id),
  KEY idx_estados_expediente_firm_id (firm_id, id),
  CONSTRAINT fk_estados_expediente_firm
    FOREIGN KEY (firm_id) REFERENCES despachos (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE expedientes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firm_id BIGINT UNSIGNED NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  assigned_user_id BIGINT UNSIGNED NULL,
  category_id BIGINT UNSIGNED NULL,
  status_id BIGINT UNSIGNED NOT NULL,
  dossier_code VARCHAR(60) NOT NULL,
  title VARCHAR(190) NOT NULL,
  description TEXT NULL,
  court_name VARCHAR(190) NULL,
  judicial_district VARCHAR(190) NULL,
  expediente_number VARCHAR(120) NULL,
  opened_at DATETIME NULL,
  closed_at DATETIME NULL,
  last_activity_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_expedientes_firm_code (firm_id, dossier_code),
  KEY idx_expedientes_firm_client (firm_id, client_id),
  KEY idx_expedientes_firm_assigned_user (firm_id, assigned_user_id),
  KEY idx_expedientes_firm_category (firm_id, category_id),
  KEY idx_expedientes_firm_status (firm_id, status_id),
  KEY idx_expedientes_last_activity (firm_id, last_activity_at),
  CONSTRAINT fk_expedientes_firm
    FOREIGN KEY (firm_id) REFERENCES despachos (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_expedientes_client
    FOREIGN KEY (firm_id, client_id) REFERENCES clientes (firm_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_expedientes_assigned_user
    FOREIGN KEY (firm_id, assigned_user_id) REFERENCES usuarios (firm_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_expedientes_category
    FOREIGN KEY (firm_id, category_id) REFERENCES categorias_materia (firm_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_expedientes_status
    FOREIGN KEY (firm_id, status_id) REFERENCES estados_expediente (firm_id, id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE partes_expediente (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  dossier_id BIGINT UNSIGNED NOT NULL,
  party_role VARCHAR(40) NOT NULL,
  name VARCHAR(190) NOT NULL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_partes_expediente_dossier (dossier_id, party_role),
  CONSTRAINT fk_partes_expediente_dossier
    FOREIGN KEY (dossier_id) REFERENCES expedientes (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE eventos_expediente (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  dossier_id BIGINT UNSIGNED NOT NULL,
  created_by_user_id BIGINT UNSIGNED NULL,
  event_type VARCHAR(50) NOT NULL DEFAULT 'update',
  title VARCHAR(190) NOT NULL,
  description TEXT NULL,
  event_date DATETIME NOT NULL,
  is_client_visible TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_eventos_expediente_dossier_date (dossier_id, event_date DESC),
  CONSTRAINT fk_eventos_expediente_dossier
    FOREIGN KEY (dossier_id) REFERENCES expedientes (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_eventos_expediente_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES usuarios (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE documentos_expediente (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  dossier_id BIGINT UNSIGNED NOT NULL,
  uploaded_by_user_id BIGINT UNSIGNED NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NULL,
  storage_disk VARCHAR(50) NOT NULL DEFAULT 'local',
  storage_path VARCHAR(500) NOT NULL,
  file_size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  checksum_sha256 CHAR(64) NULL,
  is_client_visible TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_documentos_expediente_dossier (dossier_id, created_at DESC),
  CONSTRAINT fk_documentos_expediente_dossier
    FOREIGN KEY (dossier_id) REFERENCES expedientes (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_documentos_expediente_uploaded_by
    FOREIGN KEY (uploaded_by_user_id) REFERENCES usuarios (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE notas_expediente (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  dossier_id BIGINT UNSIGNED NOT NULL,
  created_by_user_id BIGINT UNSIGNED NOT NULL,
  note_body TEXT NOT NULL,
  is_private TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notas_expediente_dossier (dossier_id, created_at DESC),
  CONSTRAINT fk_notas_expediente_dossier
    FOREIGN KEY (dossier_id) REFERENCES expedientes (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_notas_expediente_user
    FOREIGN KEY (created_by_user_id) REFERENCES usuarios (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE tokens_portal_cliente (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  dossier_id BIGINT UNSIGNED NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  token CHAR(64) NOT NULL,
  expires_at DATETIME NULL,
  last_used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tokens_portal_cliente_token (token),
  KEY idx_tokens_portal_cliente_dossier (dossier_id),
  CONSTRAINT fk_tokens_portal_cliente_dossier
    FOREIGN KEY (dossier_id) REFERENCES expedientes (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_tokens_portal_cliente_client
    FOREIGN KEY (client_id) REFERENCES clientes (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE bitacora_auditoria (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firm_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  metadata_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bitacora_auditoria_firm_date (firm_id, created_at DESC),
  KEY idx_bitacora_auditoria_entity (entity_type, entity_id),
  KEY idx_bitacora_auditoria_firm_user (firm_id, user_id),
  CONSTRAINT fk_bitacora_auditoria_firm
    FOREIGN KEY (firm_id) REFERENCES despachos (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_bitacora_auditoria_user
    FOREIGN KEY (firm_id, user_id) REFERENCES usuarios (firm_id, id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

INSERT INTO despachos (legal_name, display_name, slug, email, phone)
VALUES ('Hermosillo y Asociados', 'Hermosillo y Asociados', 'hermosillo-y-asociados', 'contacto@hermosilloyasoc.com', '+523323841469');

INSERT INTO roles (firm_id, code, name)
VALUES
  (1, 'owner', 'Socio administrador'),
  (1, 'lawyer', 'Abogado'),
  (1, 'assistant', 'Asistente'),
  (1, 'client', 'Cliente');

INSERT INTO areas_servicio (firm_id, code, name, slug, sort_order)
VALUES
  (1, 'NOTARIA_CORREDURIA', 'Tramites ante Notaria y Correduria', 'tramites-notaria-correduria', 10),
  (1, 'CIVIL_FAMILIAR_MERCANTIL', 'Juicio Civil Familiar Mercantil', 'juicio-civil-familiar-mercantil', 20),
  (1, 'CONVENIOS_IJA', 'Convenios de Validacion IJA', 'convenios-validacion-ija', 30),
  (1, 'REGISTRO_CIVIL', 'Registro Civil', 'registro-civil', 40),
  (1, 'AMPARO', 'Juicios de Amparo', 'juicios-amparo', 50),
  (1, 'REGISTRO_PROPIEDAD', 'Registro Publico de la Propiedad', 'registro-publico-propiedad', 60),
  (1, 'RRHH_LABORAL', 'Recursos Humanos y Blindaje Laboral', 'rrhh-blindaje-laboral', 70),
  (1, 'LICENCIAS_AYUNTAMIENTO', 'Licencias y Permisos Ayuntamiento', 'licencias-permisos-ayuntamiento', 80),
  (1, 'MOVILIDAD', 'Secretaria de Movilidad', 'secretaria-movilidad', 90),
  (1, 'ADUANAS', 'Comercio Exterior y Aduanas', 'comercio-exterior-aduanas', 100),
  (1, 'MARCAS_IMPI', 'Registro de Marca IMPI', 'registro-marca-impi', 110),
  (1, 'OTRO', 'Otro Asunto', 'otro-asunto', 120);

INSERT INTO estados_expediente (firm_id, code, name, sort_order, is_closed)
VALUES
  (1, 'RECIBIDO', 'Recibido', 10, 0),
  (1, 'EN_REVISION', 'En revision', 20, 0),
  (1, 'EN_PROCESO', 'En proceso', 30, 0),
  (1, 'RESUELTO', 'Resuelto', 40, 1),
  (1, 'CERRADO', 'Cerrado', 50, 1);

INSERT INTO categorias_materia (firm_id, code, name)
VALUES
  (1, 'CIVIL', 'Materia Civil'),
  (1, 'FAMILIAR', 'Materia Familiar'),
  (1, 'MERCANTIL', 'Materia Mercantil'),
  (1, 'LABORAL', 'Materia Laboral'),
  (1, 'AMPARO', 'Amparo');
