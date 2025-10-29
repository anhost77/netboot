$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNTAzMTIzOC05ODEzLTRmZjctYTcxZi0wNWRmNGE1ZjAxMzEiLCJlbWFpbCI6ImFuc3RldHRhZHJpZW5AZ21haWwuY29tIiwiaWF0IjoxNzYxNzc0NDI0LCJleHAiOjE3NjE3NzUzMjR9.5Uakz-5C99V9Ndd8eIhebgNbdIhkCpHRre6kRJnbvwI"

Write-Output "=== Checking race details with horses ==="
$url = "http://localhost:3001/api/pmu/data/races/8f63288c-4652-49c3-a52d-d40533cf465c"
try {
    $response = Invoke-WebRequest -Uri $url -Method GET -Headers @{Authorization="Bearer $token"}
    $json = $response.Content | ConvertFrom-Json
    Write-Output "Race ID: $($json.id)"
    Write-Output "Race Name: $($json.name)"
    Write-Output "Number of horses: $($json.horses.Count)"
    if ($json.horses.Count -gt 0) {
        Write-Output "`nFirst 3 horses:"
        $json.horses[0..2] | ForEach-Object {
            Write-Output "  - #$($_.number): $($_.name)"
        }
    } else {
        Write-Output "NO HORSES FOUND!"
    }
} catch {
    Write-Output "Error: $_"
}
