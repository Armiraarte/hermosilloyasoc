# Modelo Base de Datos
## Objetivo

Esta base debe soportar tres frentes del proyecto:

1. Sitio principal del despacho.
2. Operacion interna de expedientes.
3. Portal de consulta para clientes.
Hoy el frontend del portal usa mocks y login simulado, asi que esta definicion busca dejar una base real sobre la que ya podamos montar API, autenticacion y persistencia.
## Modulos

### 1. Despacho y seguridad

- `despachos`: despacho dueno de la informacion.
- `roles`: roles internos por despacho.
- `usuarios`: usuarios internos del sistema.
- `sesiones_usuario`: sesiones activas o revocadas del panel interno.
- `bitacora_auditoria`: rastro de acciones importantes.

### 2. Captacion y contacto

- `areas_servicio`: catalogo comercial del sitio.
- `solicitudes_contacto`: solicitudes recibidas desde web, telefono, WhatsApp o correo.
- `clientes`: clientes ya dados de alta formalmente.

Regla: una solicitud de contacto no se convierte automaticamente en cliente. Primero entra como `solicitudes_contacto`; despues, si procede, se crea o vincula un `cliente`.

### 3. Operacion juridica

- `categorias_materia`: clasificacion juridica interna.
- `estados_expediente`: estados del expediente.
- `expedientes`: expediente principal.
- `partes_expediente`: actor, demandado, tercero, aval, etc.
- `eventos_expediente`: historial cronologico visible para cliente o interno.
- `documentos_expediente`: archivos del expediente.
- `notas_expediente`: notas privadas del equipo.

Regla: los archivos reales viven en storage; la base guarda solo metadatos y ruta.

### 4. Acceso cliente

- `tokens_portal_cliente`: acceso controlado para compartir expedientes con clientes.

Regla: el buscador abierto por actor o demandado sirve para demo, pero no es suficiente para produccion con datos sensibles. Para produccion hay que usar token seguro o cuenta autenticada de cliente.

## Reglas de diseno

- Todo dato de negocio cuelga de `firm_id` para no mezclar despachos.
- Usuarios, categorias y areas de servicio deben desactivarse, no borrarse, cuando ya tengan historial relacionado.
- `dossier_code` debe ser unico por despacho.
- `last_activity_at` debe actualizarse cuando se agregue evento, documento o cambio relevante.
- `solicitudes_contacto.status` debe manejar al menos: `NUEVO`, `EN_REVISION`, `CONTACTADO`, `CONVERTIDO`, `CERRADO`.
- `eventos_expediente.is_client_visible` y `documentos_expediente.is_client_visible` controlan lo que puede ver el cliente.

## Flujo recomendado

1. El formulario del sitio crea un `solicitudes_contacto`.
2. Un usuario interno revisa la solicitud.
3. Si el asunto procede, se crea `clientes`.
4. Al abrir el caso, se crea `expedientes`.
5. El seguimiento vive en `eventos_expediente`, `documentos_expediente` y `notas_expediente`.
6. Cuando el cliente necesita acceso, se genera `tokens_portal_cliente`.

## Lo siguiente para backend

- `POST /api/contact-requests`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/dossiers`
- `GET /api/dossiers/:code`
- `POST /api/dossiers`
- `POST /api/dossiers/:id/events`
- `POST /api/dossiers/:id/documents`
- `POST /api/client/access`

## Decisiones pendientes

- Si el portal cliente quedara por token magico o por cuenta y contrasena.
- Si el sistema sera solo para un despacho o multi-despacho desde el inicio.
- Si los documentos iran en disco local, S3 o algun storage compatible.
