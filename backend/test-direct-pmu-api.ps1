# Test direct de l'API PMU sans authentification

Write-Output "=== Test 1: Récupérer les rapports PMU pour R1C3 du 29/10/2025 ==="
$date = "29102025"
$reunion = "1"
$course = "3"
$url = "https://online.turfinfo.api.pmu.fr/rest/client/61/programme/$date/R${reunion}C${course}/rapports-definitifs"

try {
    $response = Invoke-WebRequest -Uri $url -Method GET
    Write-Output "✅ Réponse reçue!"
    Write-Output "`nStatut: $($response.StatusCode)"
    Write-Output "`nContenu (premiers 2000 caractères):"
    $content = $response.Content
    if ($content.Length -gt 2000) {
        Write-Output $content.Substring(0, 2000)
        Write-Output "`n... (tronqué)"
    } else {
        Write-Output $content
    }
    
    # Parser le JSON
    $json = $response.Content | ConvertFrom-Json
    Write-Output "`n=== Analyse des rapports ==="
    Write-Output "Nombre de types de paris: $($json.Count)"
    
    # Chercher le Simple Gagnant
    $simpleGagnant = $json | Where-Object { $_.typePari -eq "SIMPLE_GAGNANT" }
    if ($simpleGagnant) {
        Write-Output "`n📊 Simple Gagnant trouvé:"
        Write-Output "  Mise de base: $($simpleGagnant.miseBase)"
        Write-Output "  Nombre de rapports: $($simpleGagnant.rapports.Count)"
        if ($simpleGagnant.rapports.Count -gt 0) {
            $premier = $simpleGagnant.rapports[0]
            Write-Output "`n  Premier rapport:"
            Write-Output "    Combinaison: $($premier.combinaison)"
            Write-Output "    Dividende: $($premier.dividende)"
            Write-Output "    Dividende pour 1€: $($premier.dividendePourUnEuro)"
            Write-Output "    Cote en euros: $($premier.dividendePourUnEuro / 100)€"
        }
    }
} catch {
    Write-Output "❌ Erreur: $_"
    Write-Output $_.Exception.Message
}
