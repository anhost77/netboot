$url = "http://localhost:3001/api/pmu/data/races/2025-10-29/3/4/sync"
try {
    $response = Invoke-WebRequest -Uri $url -Method POST
    Write-Output $response.Content
} catch {
    Write-Output "Error: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Output $reader.ReadToEnd()
    }
}
