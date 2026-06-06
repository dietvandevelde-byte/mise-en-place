# Start de Mise en Place backend
# Gebruik: .\start.ps1

$ErrorActionPreference = "Stop"

# Ga naar de backend map
Set-Location $PSScriptRoot

# Controleer of .env bestaat
if (-not (Test-Path ".env")) {
    Write-Host "⚠  .env niet gevonden. Kopieer .env.example naar .env en vul de waarden in." -ForegroundColor Yellow
    exit 1
}

# Installeer dependencies als venv nog niet bestaat
if (-not (Test-Path "venv")) {
    Write-Host "📦 Virtuele omgeving aanmaken..." -ForegroundColor Cyan
    python -m venv venv
}

# Activeer venv
& "venv\Scripts\Activate.ps1"

# Installeer/update dependencies
Write-Host "📦 Dependencies installeren..." -ForegroundColor Cyan
pip install -r requirements.txt -q

# Start de server
Write-Host "🚀 Backend starten op http://localhost:8000" -ForegroundColor Green
Write-Host "   API docs: http://localhost:8000/docs" -ForegroundColor Green
uvicorn main:app --reload --host 0.0.0.0 --port 8000
