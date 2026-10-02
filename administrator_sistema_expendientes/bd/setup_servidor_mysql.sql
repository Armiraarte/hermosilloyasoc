SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS administrador_expedientes
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'hya_expedientes_app'@'%' IDENTIFIED BY 'TU_PASSWORD_MYSQL';
ALTER USER 'hya_expedientes_app'@'%' IDENTIFIED BY 'TU_PASSWORD_MYSQL';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP
ON administrador_expedientes.*
TO 'hya_expedientes_app'@'%';

GRANT REFERENCES
ON administrador_expedientes.*
TO 'hya_expedientes_app'@'%';

FLUSH PRIVILEGES;

-- Luego ejecuta tambien:
-- administrator_sistema_expendientes/bd/portal_expedientes_v1.sql
--
-- Si solo quieres permitir acceso desde un host especifico,
-- cambia '%' por la IP o host autorizado.
