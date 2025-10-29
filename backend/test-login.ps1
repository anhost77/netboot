$loginUrl = "http://localhost:3001/api/auth/login"
$body = @{
    email = "anstettadrien@gmail.com"
    password = "@A679563b"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $loginUrl -Method POST -Body $body -ContentType "application/json"
    $result = $response.Content | ConvertFrom-Json
    Write-Output "Token: $($result.accessToken)"
    
    # Sauvegarder le token dans un fichier
    $result.accessToken | Out-File -FilePath "token.txt" -NoNewline
    Write-Output "`nToken saved to token.txt"
} catch {
    Write-Output "Error: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Output $reader.ReadToEnd()
    }
}
