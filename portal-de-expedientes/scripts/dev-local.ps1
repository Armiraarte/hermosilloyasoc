$projectRoot = Split-Path -Parent $PSScriptRoot
$phpPort = if ($env:PORTAL_PHP_PORT) { $env:PORTAL_PHP_PORT } else { '8081' }
$frontendPort = if ($env:PORTAL_FRONTEND_PORT) { $env:PORTAL_FRONTEND_PORT } else { '3000' }
$phpProcess = Start-Process php -ArgumentList '-S', "127.0.0.1:$phpPort", '-t', $projectRoot -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru

try {
    Set-Location $projectRoot
    $env:VITE_USE_LOCAL_PHP_PROXY = 'true'
    & npm.cmd run dev -- --port $frontendPort
}
finally {
    if ($phpProcess -and !$phpProcess.HasExited) {
        Stop-Process -Id $phpProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
