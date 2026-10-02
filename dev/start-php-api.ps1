$projectRoot = Split-Path -Parent $PSScriptRoot
$phpExe = 'C:\xampp\php\php.exe'
$phpPort = 8081
$router = Join-Path $PSScriptRoot 'php-router.php'
$logDir = Join-Path $projectRoot '.codex'
$stdoutLog = Join-Path $logDir 'php-api.stdout.log'
$stderrLog = Join-Path $logDir 'php-api.stderr.log'

if (-not (Test-Path $phpExe)) {
    throw "No se encontro PHP en $phpExe"
}

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

$existingConnection = Get-NetTCPConnection -State Listen -LocalPort $phpPort -ErrorAction SilentlyContinue |
    Select-Object -First 1

if ($existingConnection) {
    Write-Output "PHP API ya esta escuchando en el puerto $phpPort."
    exit 0
}

$arguments = @(
    '-S',
    "127.0.0.1:$phpPort",
    '-t',
    $projectRoot,
    $router
)

Start-Process -FilePath $phpExe `
    -ArgumentList $arguments `
    -WorkingDirectory $projectRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutLog `
    -RedirectStandardError $stderrLog

Write-Output "PHP API iniciada en http://127.0.0.1:$phpPort"
