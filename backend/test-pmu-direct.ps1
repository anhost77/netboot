$date = "29102025"
$reunion = "1"
$course = "3"
$url = "https://online.turfinfo.api.pmu.fr/rest/client/2/programme/$date/R${reunion}/C${course}/rapports-definitifs"

Write-Output "URL: $url"
Write-Output ""

try {
    $response = Invoke-WebRequest -Uri $url -Method GET
    Write-Output "Statut: $($response.StatusCode)"
    Write-Output ""
    Write-Output "Contenu:"
    Write-Output $response.Content
} catch {
    Write-Output "Erreur:"
    Write-Output $_.Exception.Message
}
