<?php
declare(strict_types=1);

require_once __DIR__ . '/dossier_repository.php';

portalAllowCors();

$pdo = portalGetDbConnection();
$action = portalRequestAction('list');
$adminOnlyActions = [
    'list',
    'create',
    'update',
    'update_legal_control',
    'update_codes',
    'delete',
    'add_history_event',
    'delete_history_event',
    'add_calendar_event',
    'delete_calendar_event',
];
$currentAdminSession = portalCurrentAdminSession();
$adminSession = in_array($action, $adminOnlyActions, true) ? portalRequireAdminAuth() : $currentAdminSession;

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
            $accessCode = trim((string) ($_GET['accessCode'] ?? ''));
            portalJsonResponse([
                'ok' => true,
                'dossiers' => $query !== '' ? portalFetchPublicDossiers($pdo, $query, $accessCode) : [],
            ]);
            break;

        case 'fetch':
            $code = trim((string) ($_GET['code'] ?? ''));
            $accessCode = trim((string) ($_GET['accessCode'] ?? ''));
            if ($code === '') {
                portalJsonResponse([
                    'ok' => false,
                    'message' => 'Debes enviar el codigo del expediente.',
                ], 400);
            }

            if ($adminSession !== null) {
                $dossier = portalFetchSingleDossier($pdo, $code);
            } else {
                if ($accessCode === '') {
                    portalJsonResponse([
                        'ok' => false,
                        'message' => 'Debes enviar tambien el codigo de acceso del expediente.',
                    ], 400);
                }

                $dossier = portalFetchPublicDossierByCodes($pdo, $code, $accessCode);
            }
            if ($dossier === null) {
                portalJsonResponse([
                    'ok' => false,
                    'message' => 'No se encontro el expediente solicitado.',
                ], 404);
            }

            portalJsonResponse([
                'ok' => true,
                'dossier' => $adminSession !== null ? $dossier : portalPrepareDossierForClient($dossier),
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

        case 'update_legal_control':
            $payload = portalReadJsonBody();
            $payload['adminId'] = (int) ($adminSession['id'] ?? 0);
            $pdo->beginTransaction();
            $updatedDossier = portalUpdateLegalControl($pdo, $payload);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Control juridico actualizado correctamente.',
                'dossier' => $updatedDossier,
            ]);
            break;

        case 'update_codes':
            $payload = portalReadJsonBody();
            $payload['adminId'] = (int) ($adminSession['id'] ?? 0);
            $pdo->beginTransaction();
            $updatedDossier = portalUpdateDossierCodes($pdo, $payload);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Codigos del expediente actualizados correctamente.',
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
            $uploadedFiles = [];
            if (portalStringContains(strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? '')), 'multipart/form-data')) {
                $payload = $_POST;
                $uploadedFiles = portalNormalizeUploadedFiles($_FILES, 'movementFile');
            }

            $payload['adminId'] = (int) ($adminSession['id'] ?? 0);
            $pdo->beginTransaction();
            $updatedDossier = portalAddHistoryEvent($pdo, $payload, $uploadedFiles);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Movimiento agregado correctamente.',
                'dossier' => $updatedDossier,
            ]);
            break;

        case 'delete_history_event':
            $payload = portalReadJsonBody();
            $payload['adminId'] = (int) ($adminSession['id'] ?? 0);
            $pdo->beginTransaction();
            $updatedDossier = portalDeleteHistoryEvent($pdo, $payload);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Movimiento eliminado correctamente.',
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

        case 'delete_calendar_event':
            $payload = portalReadJsonBody();
            $payload['adminId'] = (int) ($adminSession['id'] ?? 0);
            $pdo->beginTransaction();
            $updatedDossier = portalDeleteCalendarEvent($pdo, $payload);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Evento de calendario eliminado correctamente.',
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
