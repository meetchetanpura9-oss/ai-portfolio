# Stop stuck processes on port 8000, then start FastAPI cleanly.
$ErrorActionPreference = "SilentlyContinue"

Write-Host "Checking port 8000..."
$connections = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
foreach ($conn in $connections) {
    $pid = $conn.OwningProcess
    if ($pid) {
        Write-Host "Stopping process on port 8000 (PID $pid)..."
        Stop-Process -Id $pid -Force
    }
}
Start-Sleep -Seconds 1

Set-Location $PSScriptRoot
if (-not (Test-Path ".\venv\Scripts\python.exe")) {
    Write-Host "ERROR: venv not found. Run: python -m venv venv" -ForegroundColor Red
    exit 1
}

Write-Host "Starting API at http://127.0.0.1:8000"
Write-Host "Open http://127.0.0.1:8000/docs for API documentation"
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
