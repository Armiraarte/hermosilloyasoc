<?php
declare(strict_types=1);

require_once __DIR__ . '/dossier_repository.php';

portalAllowCors();

$pdo = portalGetDbConnection();
$action = portalRequestAction('list');
$adminOnlyActions = ['list', 'create', 'update', 'delete', 'add_history_event', 'add_calendar_event'];
$adminSession = in_array($action, $adminOnlyActions, true) ? portalRequireAdminAuth() : null;

try {
    switch ($action) {
        case 'list':
            portalJsonResponse([
                'ok' => true,
                'dossiers' => portalFetchDossiers($pdo),
            ]);
            break;

        case 'search':
            $query = trim((string) ($_GET['query'] ?? ''));
            portalJsonResponse([
                'ok' => true,
                'dossiers' => $query !== '' ? portalFetchPublicDossiers($pdo, $query) : [],
            ]);
            break;

        case 'fetch':
            $code = trim((string) ($_GET['code'] ?? ''));
            if ($code === '') {
                portalJsonResponse([
                    'ok' => false,
                    'message' => 'Debes enviar el codigo del expediente.',
                ], 400);
            }

            $dossier = portalFetchSingleDossier($pdo, $code);
            if ($dossier === null) {
                portalJsonResponse([
                    'ok' => false,
                    'message' => 'No se encontro el expediente solicitado.',
                ], 404);
            }

            portalJsonResponse([
                'ok' => true,
                'dossier' => portalPrepareDossierForClient($dossier),
            ]);
            break;

        case 'create':
            $payload = portalReadJsonBody();
            $payload['adminId'] = (int) ($adminSession['id'] ?? 0);
            $pdo->beginTransaction();
            $createdDossier = portalCreateDossier($pdo, $payload);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Expediente creado correctamente.',
                'dossier' => $createdDossier,
            ], 201);
            break;

        case 'update':
            $payload = portalReadJsonBody();
            $payload['adminId'] = (int) ($adminSession['id'] ?? 0);
            $pdo->beginTransaction();
            $updatedDossier = portalUpdateDossier($pdo, $payload);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Expediente actualizado correctamente.',
                'dossier' => $updatedDossier,
            ]);
            break;

        case 'delete':
            $payload = portalReadJsonBody();
            $code = trim((string) ($payload['dossierCode'] ?? $payload['code'] ?? ''));
            if ($code === '') {
                portalJsonResponse([
                    'ok' => false,
                    'message' => 'Debes enviar el codigo del expediente a eliminar.',
                ], 400);
            }

            $pdo->beginTransaction();
            portalDeleteDossier($pdo, $code);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Expediente eliminado correctamente.',
            ]);
            break;

        case 'add_history_event':
            $payload = portalReadJsonBody();
            $payload['adminId'] = (int) ($adminSession['id'] ?? 0);
            $pdo->beginTransaction();
            $updatedDossier = portalAddHistoryEvent($pdo, $payload);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Movimiento agregado correctamente.',
                'dossier' => $updatedDossier,
            ]);
            break;

        case 'add_calendar_event':
            $payload = portalReadJsonBody();
            $payload['adminId'] = (int) ($adminSession['id'] ?? 0);
            $pdo->beginTransaction();
            $updatedDossier = portalAddCalendarEvent($pdo, $payload);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Evento de calendario agregado correctamente.',
                'dossier' => $updatedDossier,
            ]);
            break;

        default:
            portalJsonResponse([
                'ok' => false,
                'message' => 'La accion solicitada no existe.',
            ], 400);
    }
} catch (InvalidArgumentException $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    portalJsonResponse([
        'ok' => false,
        'message' => $exception->getMessage(),
    ], 400);
} catch (RuntimeException $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    portalJsonResponse([
        'ok' => false,
        'message' => $exception->getMessage(),
    ], 409);
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    portalJsonResponse([
        'ok' => false,
        'message' => 'Ocurrio un error interno al trabajar con expedientes.',
        'details' => $exception->getMessage(),
    ], 500);
}
