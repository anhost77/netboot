# Script pour mettre à jour le port du backend et FRONTEND_URL
$envFile = "backend\.env"
$content = Get-Content $envFile
$content = $content -replace "PORT=3000", "PORT=3001"
$content = $content -replace "FRONTEND_URL=http://localhost:5173", "FRONTEND_URL=http://localhost:3000"
$content | Set-Content $envFile
Write-Host "Backend .env mis à jour:"
Write-Host "  - PORT: 3001"
Write-Host "  - FRONTEND_URL: http://localhost:3000"
