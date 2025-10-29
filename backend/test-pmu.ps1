$url = "http://localhost:3001/api/pmu/race/participants?date=2025-10-29&reunion=3&course=4"
try {
    $response = Invoke-WebRequest -Uri $url -Method GET
    Write-Output $response.Content
} catch {
    Write-Output "Error: $_"
    Write-Output $_.Exception.Response.StatusCode
}
