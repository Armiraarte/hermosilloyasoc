<?php
declare(strict_types=1);

require_once __DIR__ . '/legal_team_repository.php';

portalAllowCors();

$pdo = portalGetDbConnection();
$action = portalRequestAction('list');
$adminSession = portalRequireAdminAuth();
portalEnsureAdminMembersSchema($pdo);
portalEnsureLegalTeamSchema($pdo);

try {
    switch ($action) {
        case 'list':
            $board = portalFetchLegalTeamBoard($pdo);
            portalJsonResponse([
                'ok' => true,
                'members' => $board['members'],
                'statuses' => $board['statuses'],
                'activities' => $board['activities'],
            ]);
            break;

        case 'create_activity':
            $payload = portalReadJsonBody();
            $pdo->beginTransaction();
            $activity = portalCreateLegalTeamActivity($pdo, $payload, $adminSession);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Actividad creada correctamente.',
                'activity' => $activity,
            ], 201);
            break;

        case 'update_activity':
            $payload = portalReadJsonBody();
            $pdo->beginTransaction();
            $activity = portalUpdateLegalTeamActivity($pdo, $payload, $adminSession);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Actividad actualizada correctamente.',
                'activity' => $activity,
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
        'message' => 'Ocurrio un error interno al administrar actividades del equipo juridico.',
        'details' => $exception->getMessage(),
    ], 500);
}
