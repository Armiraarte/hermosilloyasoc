$projectRoot = Split-Path -Parent $PSScriptRoot
$phpProcess = Start-Process php -ArgumentList '-S', '127.0.0.1:8000', '-t', $projectRoot -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru

try {
    Set-Location $projectRoot
    & npm.cmd run dev
}
finally {
    if ($phpProcess -and !$phpProcess.HasExited) {
        Stop-Process -Id $phpProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
