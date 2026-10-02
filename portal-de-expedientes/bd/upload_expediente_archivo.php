<?php
declare(strict_types=1);

require_once __DIR__ . '/dossier_repository.php';

portalAllowCors();

$adminSession = portalRequireAdminAuth();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    portalJsonResponse([
        'ok' => false,
        'message' => 'Este endpoint solo acepta POST.',
    ], 405);
}

$dossierCode = (string) ($_POST['dossierCode'] ?? '');
$phaseReference = isset($_POST['phaseId']) ? (string) $_POST['phaseId'] : null;
$adminId = (int) ($adminSession['id'] ?? 0);
$visibleToClient = portalNormalizeBoolean($_POST['isClientVisible'] ?? 1, true);
$files = portalNormalizeUploadedFiles($_FILES, 'files');

if ($files === []) {
    portalJsonResponse([
        'ok' => false,
        'message' => 'No llegaron archivos para subir.',
    ], 400);
}

$pdo = portalGetDbConnection();

try {
    $pdo->beginTransaction();
    $updatedDossier = portalAttachUploadedFiles($pdo, $dossierCode, $files, $phaseReference, $adminId, $visibleToClient);
    $pdo->commit();

    portalJsonResponse([
        'ok' => true,
        'message' => 'Archivos cargados correctamente.',
        'dossier' => $updatedDossier,
    ]);
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
        'message' => 'Ocurrio un error al subir archivos del expediente.',
        'details' => $exception->getMessage(),
    ], 500);
}
