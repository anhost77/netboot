$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNTAzMTIzOC05ODEzLTRmZjctYTcxZi0wNWRmNGE1ZjAxMzEiLCJlbWFpbCI6ImFuc3RldHRhZHJpZW5AZ21haWwuY29tIiwiaWF0IjoxNzYxNzc0NDI0LCJleHAiOjE3NjE3NzUzMjR9.5Uakz-5C99V9Ndd8eIhebgNbdIhkCpHRre6kRJnbvwI"

# Test 1: Get race participants
Write-Output "=== Test 1: Get race participants ==="
$url1 = "http://localhost:3001/api/pmu/race/participants?date=2025-10-29&reunion=3&course=4"
try {
    $response = Invoke-WebRequest -Uri $url1 -Method GET -Headers @{Authorization="Bearer $token"}
    Write-Output $response.Content
} catch {
    Write-Output "Error: $_"
}

Write-Output "`n`n=== Test 2: Sync race ==="
$url2 = "http://localhost:3001/api/pmu/data/races/2025-10-29/3/4/sync"
try {
    $response = Invoke-WebRequest -Uri $url2 -Method POST -Headers @{Authorization="Bearer $token"}
    Write-Output $response.Content
} catch {
    Write-Output "Error: $_"
}
