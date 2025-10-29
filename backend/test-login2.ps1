$loginUrl = "http://localhost:3001/api/auth/login"
$body = @{
    email = "anstettadrien@gmail.com"
    password = "@A679563b"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $loginUrl -Method POST -Body $body -ContentType "application/json"
    Write-Output "Full response:"
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
