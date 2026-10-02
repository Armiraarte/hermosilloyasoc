# Base de Datos V1 Simple

## Idea base

Hasta aqui va bien. Para arrancar simple, yo lo haria en 5 tablas:

1. `administradores`
2. `clientes`
3. `expedientes`
4. `expediente_historial`
5. `expediente_calendario`

Con eso ya puedes:

- registrar administradores internos,
- registrar clientes,
- darles un codigo de acceso,
- asociarles uno o varios expedientes,
- asignar cada expediente a un responsable,
- guardar el avance de cada expediente,
- y mostrar un calendario compartido al cliente y al despacho.

## 1. Tabla `administradores`

Aqui guardas los usuarios internos del despacho que daran de alta casos y registraran movimientos.

Campos recomendados:

- `id`
- `usuario`
- `nombre`
- `tipo_usuario`
- `password_hash`
- `activo`
- `fecha_registro`

### Comentarios

- `usuario` debe ser `UNIQUE`.
- `password_hash` debe guardar la contrasena encriptada, nunca texto plano.
- `tipo_usuario` puede vivir como texto en esta V1.
  - Ejemplo: `ADMIN`
  - Ejemplo: `ABOGADO`
  - Ejemplo: `ASISTENTE`
- `activo` te sirve para deshabilitar acceso sin borrar al usuario.

## 2. Tabla `clientes`

Aqui guardas a la persona que entrara al portal.

Campos recomendados:

- `id`
- `nombre_completo`
- `telefono`
- `correo`
- `codigo_acceso`
- `fecha_registro`

### Comentarios

- `codigo_acceso` debe ser `UNIQUE`.
- Si quieres 6 digitos y 1 letra, define un formato fijo.
  - Ejemplo: `A482913`
  - O ejemplo: `482913A`
- Yo te recomiendo `CHAR(7)`.
- `correo` puede ser nullable si no siempre lo tendras.
- `telefono` mejor obligatorio.

## 3. Tabla `expedientes`

Cada expediente pertenece a un cliente, lo crea un administrador y opcionalmente se asigna a un administrador responsable.

Campos recomendados:

- `id`
- `cliente_id`
- `creado_por_admin_id`
- `asignado_admin_id`
- `titulo_juicio`
- `descripcion`
- `actor`
- `demandado`
- `juzgado`
- `partido_judicial`
- `categoria`
- `estatus`
- `ultima_actualizacion`
- `fecha_registro`

### Comentarios

- `cliente_id` debe apuntar a `clientes.id`.
- `creado_por_admin_id` debe apuntar a `administradores.id`.
- `asignado_admin_id` debe apuntar a `administradores.id`.
- `creado_por_admin_id` te dice quien dio de alta el asunto.
- `asignado_admin_id` te dice quien lleva actualmente el expediente.
- `ultima_actualizacion` no deberia capturarse a mano cada vez.
  - Lo ideal es actualizarla cuando insertes algo en `expediente_historial` o `expediente_calendario`.
- `categoria` y `estatus` pueden vivir como texto en esta primera version.
- Mas adelante, si quieres, normalizamos `categoria` y `estatus` en catalogos aparte.

## 4. Tabla `expediente_historial`

Aqui guardas cada avance o movimiento del juicio.

Campos recomendados:

- `id`
- `expediente_id`
- `admin_id`
- `titulo_movimiento`
- `descripcion_movimiento`
- `fecha_movimiento`
- `documento_nombre`
- `documento_ruta`
- `fecha_registro`

### Comentarios

- `expediente_id` debe apuntar a `expedientes.id`.
- `admin_id` debe apuntar a `administradores.id`.
- `admin_id` te dice quien registro ese movimiento.
- Para arrancar, esta bien guardar un solo documento por movimiento.
- No guardes el archivo binario en la base.
  - Guarda solo `documento_nombre` y `documento_ruta`.
- Si luego quieres varios archivos por movimiento, se crea otra tabla:
  - `expediente_historial_documentos`

## 5. Tabla `expediente_calendario`

Aqui guardas las fechas importantes del expediente para mostrarlas al administrador y, si quieres, tambien al cliente.

Campos recomendados:

- `id`
- `expediente_id`
- `admin_id`
- `tipo_evento`
- `titulo_evento`
- `descripcion_evento`
- `fecha_evento`
- `ubicacion`
- `visible_cliente`
- `fecha_registro`

### Comentarios

- `expediente_id` debe apuntar a `expedientes.id`.
- `admin_id` debe apuntar a `administradores.id`.
- `tipo_evento` puede ser texto en esta V1.
  - Ejemplo: `AUDIENCIA`
  - Ejemplo: `VENCIMIENTO`
  - Ejemplo: `CITA`
  - Ejemplo: `RECORDATORIO`
- `visible_cliente` te sirve para decidir si esa fecha la vera tambien el cliente.
- `ubicacion` puede guardar el juzgado, sala o referencia del evento.

## Relacion entre tablas

- Un `administrador` puede crear muchos `expedientes`.
- Un `administrador` puede tener asignados muchos `expedientes`.
- Un `administrador` puede registrar muchos `movimientos`.
- Un `administrador` puede registrar muchos eventos de `calendario`.
- Un `cliente` puede tener muchos `expedientes`.
- Un `expediente` puede tener muchos `movimientos` en `expediente_historial`.
- Un `expediente` puede tener muchas fechas en `expediente_calendario`.

## Recomendacion importante

Tu idea de poner `actor`, `demandado`, `juzgado`, `partido_judicial`, `categoria` y `estatus` dentro de `expedientes` esta bien para la version 1.

No lo complicaria aun con tablas extra de partes procesales, porque ahorita lo importante es:

- registrar rapido,
- consultar rapido,
- asignar responsable,
- mostrar el avance,
- y compartir fechas clave en el calendario.

## SQL sugerido

```sql
CREATE TABLE administradores (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario VARCHAR(80) NOT NULL,
  nombre VARCHAR(190) NOT NULL,
  tipo_usuario VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_administradores_usuario (usuario)
);

CREATE TABLE clientes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre_completo VARCHAR(190) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  correo VARCHAR(190) NULL,
  codigo_acceso CHAR(7) NOT NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_codigo_acceso (codigo_acceso)
);

CREATE TABLE expedientes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cliente_id BIGINT UNSIGNED NOT NULL,
  creado_por_admin_id BIGINT UNSIGNED NOT NULL,
  asignado_admin_id BIGINT UNSIGNED NULL,
  titulo_juicio VARCHAR(190) NOT NULL,
  descripcion TEXT NULL,
  actor VARCHAR(190) NOT NULL,
  demandado VARCHAR(190) NOT NULL,
  juzgado VARCHAR(190) NULL,
  partido_judicial VARCHAR(190) NULL,
  categoria VARCHAR(120) NULL,
  estatus VARCHAR(80) NOT NULL,
  ultima_actualizacion DATETIME NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_expedientes_cliente (cliente_id),
  KEY idx_expedientes_creado_por_admin (creado_por_admin_id),
  KEY idx_expedientes_asignado_admin (asignado_admin_id),
  CONSTRAINT fk_expedientes_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_expedientes_creado_por_admin
    FOREIGN KEY (creado_por_admin_id) REFERENCES administradores (id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_expedientes_asignado_admin
    FOREIGN KEY (asignado_admin_id) REFERENCES administradores (id)
    ON DELETE SET NULL
);

CREATE TABLE expediente_historial (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  expediente_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED NULL,
  titulo_movimiento VARCHAR(190) NOT NULL,
  descripcion_movimiento TEXT NULL,
  fecha_movimiento DATETIME NOT NULL,
  documento_nombre VARCHAR(255) NULL,
  documento_ruta VARCHAR(500) NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_historial_expediente_fecha (expediente_id, fecha_movimiento DESC),
  KEY idx_historial_admin (admin_id),
  CONSTRAINT fk_historial_expediente
    FOREIGN KEY (expediente_id) REFERENCES expedientes (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_historial_admin
    FOREIGN KEY (admin_id) REFERENCES administradores (id)
    ON DELETE SET NULL
);

CREATE TABLE expediente_calendario (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  expediente_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED NULL,
  tipo_evento VARCHAR(50) NOT NULL,
  titulo_evento VARCHAR(190) NOT NULL,
  descripcion_evento TEXT NULL,
  fecha_evento DATETIME NOT NULL,
  ubicacion VARCHAR(190) NULL,
  visible_cliente TINYINT(1) NOT NULL DEFAULT 1,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_calendario_expediente_fecha (expediente_id, fecha_evento),
  KEY idx_calendario_admin (admin_id),
  CONSTRAINT fk_calendario_expediente
    FOREIGN KEY (expediente_id) REFERENCES expedientes (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_calendario_admin
    FOREIGN KEY (admin_id) REFERENCES administradores (id)
    ON DELETE SET NULL
);
```

## Flujo simple de uso

1. Creas al `administrador`.
2. Registras al `cliente`.
3. Das de alta el `expediente`.
4. Indicas quien lo creo con `creado_por_admin_id`.
5. Si ya sabes quien lo llevara, lo asignas con `asignado_admin_id`.
6. Cada avance nuevo se guarda en `expediente_historial` con el `admin_id` de quien lo capturo.
7. Cada audiencia, vencimiento o cita se guarda en `expediente_calendario`.
8. Si la fecha debe verla el cliente, marcas `visible_cliente = 1`.

## Lo que yo haria enseguida

Paso 1:
- crear `administradores`

Paso 2:
- crear `clientes`

Paso 3:
- crear `expedientes`

Paso 4:
- crear `expediente_historial`

Paso 5:
- crear `expediente_calendario`

Paso 6:
- probar con 1 administrador, 1 cliente, 2 expedientes, 3 movimientos y 2 fechas de calendario

Paso 7:
- conectar el portal para que entre con `codigo_acceso`

## Siguiente mejora despues de esta V1

Las mejoras naturales despues de esto serian:

- una tabla `expediente_documentos` separada,
- un catalogo para `categoria`,
- un catalogo para `estatus`,
- y alertas o recordatorios automaticos a partir de `expediente_calendario`.
