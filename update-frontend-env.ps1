# Script pour mettre à jour l'URL de l'API frontend
$envFile = "frontend\.env"
$content = Get-Content $envFile
$content = $content -replace "NEXT_PUBLIC_API_URL=http://localhost:3001/api", "NEXT_PUBLIC_API_URL=http://localhost:3001"
$content = $content -replace "NEXT_PUBLIC_API_URL=http://localhost:3001", "NEXT_PUBLIC_API_URL=http://localhost:3001"
$content | Set-Content $envFile
Write-Host "Frontend .env mis à jour:"
Write-Host "  - NEXT_PUBLIC_API_URL: http://localhost:3001"
