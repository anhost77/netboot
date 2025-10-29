$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNTAzMTIzOC05ODEzLTRmZjctYTcxZi0wNWRmNGE1ZjAxMzEiLCJlbWFpbCI6ImFuc3RldHRhZHJpZW5AZ21haWwuY29tIiwiaWF0IjoxNzYxNzc1NTU5LCJleHAiOjE3NjE3NzY0NTl9.s18AXpy2sOl8t8bAHj6C58BuOKDX0_HZ8sVTTRxOoGE"

# ID de la course du pari
$raceId = "62fd30a1-ca73-4424-b760-26ba105cfe80"

Write-Output "=== Test 1: Récupérer les détails de la course ==="
$url1 = "http://localhost:3001/api/pmu/data/races/$raceId"
try {
    $response = Invoke-WebRequest -Uri $url1 -Method GET -Headers @{Authorization="Bearer $token"}
    $race = $response.Content | ConvertFrom-Json
    Write-Output "Course: $($race.name)"
    Write-Output "Date: $($race.date)"
    Write-Output "Hippodrome: $($race.hippodrome.name)"
    Write-Output "Réunion: R$($race.reunionNumber)C$($race.raceNumber)"
    Write-Output "Nombre de chevaux: $($race.horses.Count)"
    Write-Output "Nombre de rapports: $($race.reports.Count)"
} catch {
    Write-Output "Erreur: $_"
}

Write-Output "`n=== Test 2: Tester l'API PMU directement pour les rapports ==="
# Extraire date, réunion et course pour tester l'API PMU
$url2 = "http://localhost:3001/api/pmu/test/reports/2025-10-29/3/4"
try {
    $response = Invoke-WebRequest -Uri $url2 -Method GET -Headers @{Authorization="Bearer $token"}
    Write-Output "Rapports PMU bruts:"
    Write-Output $response.Content
} catch {
    Write-Output "Erreur: $_"
}

Write-Output "`n=== Test 3: Récupérer les cotes pour un pari spécifique ==="
$url3 = "http://localhost:3001/api/pmu/data/races/$raceId/odds?betType=gagnant&horses=8"
try {
    $response = Invoke-WebRequest -Uri $url3 -Method GET -Headers @{Authorization="Bearer $token"}
    Write-Output "Cotes:"
    Write-Output $response.Content
} catch {
    Write-Output "Erreur: $_"
}
