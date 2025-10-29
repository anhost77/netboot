$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNTAzMTIzOC05ODEzLTRmZjctYTcxZi0wNWRmNGE1ZjAxMzEiLCJlbWFpbCI6ImFuc3RldHRhZHJpZW5AZ21haWwuY29tIiwiaWF0IjoxNzYxNzc0NDI0LCJleHAiOjE3NjE3NzUzMjR9.5Uakz-5C99V9Ndd8eIhebgNbdIhkCpHRre6kRJnbvwI"

Write-Output "=== Synchronisation de la course ==="
$url = "http://localhost:3001/api/pmu/data/races/2025-10-29/3/4/sync"
try {
    $response = Invoke-WebRequest -Uri $url -Method POST -Headers @{Authorization="Bearer $token"}
    Write-Output "✅ Synchronisation réussie!"
    Write-Output $response.Content
} catch {
    Write-Output "❌ Erreur: $_"
}

Write-Output "`n=== Vérification des chevaux ==="
$url2 = "http://localhost:3001/api/pmu/data/races/8f63288c-4652-49c3-a52d-d40533cf465c"
try {
    $response = Invoke-WebRequest -Uri $url2 -Method GET -Headers @{Authorization="Bearer $token"}
    $json = $response.Content | ConvertFrom-Json
    Write-Output "Nombre de chevaux: $($json.horses.Count)"
    if ($json.horses.Count -gt 0) {
        Write-Output "`n✅ SUCCÈS! Les chevaux sont présents:"
        $json.horses[0..2] | ForEach-Object {
            Write-Output "  - #$($_.number): $($_.name)"
        }
    } else {
        Write-Output "❌ Aucun cheval trouvé"
    }
} catch {
    Write-Output "❌ Erreur: $_"
}
