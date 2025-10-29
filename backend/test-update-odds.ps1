$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNTAzMTIzOC05ODEzLTRmZjctYTcxZi0wNWRmNGE1ZjAxMzEiLCJlbWFpbCI6ImFuc3RldHRhZHJpZW5AZ21haWwuY29tIiwiaWF0IjoxNzYxNzc1NTU5LCJleHAiOjE3NjE3NzY0NTl9.s18AXpy2sOl8t8bAHj6C58BuOKDX0_HZ8sVTTRxOoGE"

$raceId = "62fd30a1-ca73-4424-b760-26ba105cfe80"

Write-Output "=== Mise à jour des cotes depuis les rapports PMU ==="
$url = "http://localhost:3001/api/pmu/data/races/$raceId/update-odds"
try {
    $response = Invoke-WebRequest -Uri $url -Method GET -Headers @{Authorization="Bearer $token"}
    Write-Output "✅ Cotes mises à jour!"
    Write-Output $response.Content
} catch {
    Write-Output "❌ Erreur: $_"
}

Write-Output "`n=== Test des cotes après mise à jour ==="
$url2 = "http://localhost:3001/api/pmu/data/races/$raceId/odds?betType=gagnant&horses=8"
try {
    $response = Invoke-WebRequest -Uri $url2 -Method GET -Headers @{Authorization="Bearer $token"}
    Write-Output "Cotes:"
    Write-Output $response.Content
} catch {
    Write-Output "❌ Erreur: $_"
}
