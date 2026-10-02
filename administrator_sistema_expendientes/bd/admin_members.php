<?php
declare(strict_types=1);

require_once __DIR__ . '/admin_repository.php';

portalAllowCors();

$pdo = portalGetDbConnection();
$action = portalRequestAction('list');
$adminSession = portalRequireAdminAuth();
$canManageMembers = portalCanManageAdminMembers($adminSession);

try {
    portalEnsureAdminMembersSchema($pdo);

    switch ($action) {
        case 'list_for_legal_control':
            portalJsonResponse([
                'ok' => true,
                'members' => portalFetchActiveAdminMembers($pdo),
            ]);
            break;

        case 'list':
            if (!$canManageMembers) {
                portalJsonResponse([
                    'ok' => false,
                    'message' => 'Tu cuenta no tiene permisos para administrar miembros.',
                ], 403);
            }
            portalJsonResponse([
                'ok' => true,
                'members' => portalFetchAdminMembers($pdo),
            ]);
            break;

        case 'create':
            if (!$canManageMembers) {
                portalJsonResponse([
                    'ok' => false,
                    'message' => 'Tu cuenta no tiene permisos para administrar miembros.',
                ], 403);
            }
            $payload = portalReadJsonBody();
            $pdo->beginTransaction();
            $member = portalCreateAdminMember($pdo, $payload);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Miembro creado correctamente.',
                'member' => $member,
            ], 201);
            break;

        case 'set_active':
            if (!$canManageMembers) {
                portalJsonResponse([
                    'ok' => false,
                    'message' => 'Tu cuenta no tiene permisos para administrar miembros.',
                ], 403);
            }
            $payload = portalReadJsonBody();
            $pdo->beginTransaction();
            $member = portalUpdateAdminMemberActiveStatus($pdo, $payload, $adminSession);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Estado del miembro actualizado correctamente.',
                'member' => $member,
            ]);
            break;

        case 'set_legal_team_visibility':
            if (!$canManageMembers) {
                portalJsonResponse([
                    'ok' => false,
                    'message' => 'Tu cuenta no tiene permisos para administrar miembros.',
                ], 403);
            }
            $payload = portalReadJsonBody();
            $pdo->beginTransaction();
            $member = portalUpdateAdminMemberLegalTeamVisibility($pdo, $payload);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Visibilidad del miembro actualizada correctamente.',
                'member' => $member,
            ]);
            break;

        case 'move_legal_team_position':
            if (!$canManageMembers) {
                portalJsonResponse([
                    'ok' => false,
                    'message' => 'Tu cuenta no tiene permisos para administrar miembros.',
                ], 403);
            }
            $payload = portalReadJsonBody();
            $pdo->beginTransaction();
            portalMoveAdminMemberLegalTeamPosition($pdo, $payload);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Orden del equipo juridico actualizado correctamente.',
            ]);
            break;

        case 'update_password':
            if (!$canManageMembers) {
                portalJsonResponse([
                    'ok' => false,
                    'message' => 'Tu cuenta no tiene permisos para administrar miembros.',
                ], 403);
            }
            $payload = portalReadJsonBody();
            $pdo->beginTransaction();
            $member = portalUpdateAdminMemberPassword($pdo, $payload, $adminSession);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Contrasena actualizada correctamente.',
                'member' => $member,
            ]);
            break;

        case 'delete':
            if (!$canManageMembers) {
                portalJsonResponse([
                    'ok' => false,
                    'message' => 'Tu cuenta no tiene permisos para administrar miembros.',
                ], 403);
            }
            $payload = portalReadJsonBody();
            $pdo->beginTransaction();
            portalDeleteAdminMember($pdo, $payload, $adminSession);
            $pdo->commit();
            portalJsonResponse([
                'ok' => true,
                'message' => 'Cuenta eliminada correctamente.',
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
        'message' => 'Ocurrio un error interno al administrar miembros.',
        'details' => $exception->getMessage(),
    ], 500);
}
