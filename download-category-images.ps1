# Script pour télécharger les images des catégories
$categories = @(
    @{name="Fruits"; url="https://ui-avatars.com/api/?name=Fruits&size=400&background=4ade80&color=fff&bold=true"},
    @{name="Legumes"; url="https://ui-avatars.com/api/?name=Legumes&size=400&background=22c55e&color=fff&bold=true"},
    @{name="Viandes"; url="https://ui-avatars.com/api/?name=Viandes&size=400&background=ef4444&color=fff&bold=true"},
    @{name="Cereales"; url="https://ui-avatars.com/api/?name=Cereales&size=400&background=f59e0b&color=fff&bold=true"},
    @{name="Produits-Laitiers"; url="https://ui-avatars.com/api/?name=Lait&size=400&background=3b82f6&color=fff&bold=true"},
    @{name="Boissons"; url="https://ui-avatars.com/api/?name=Boissons&size=400&background=06b6d4&color=fff&bold=true"},
    @{name="Snacks"; url="https://ui-avatars.com/api/?name=Snacks&size=400&background=f97316&color=fff&bold=true"},
    @{name="Surgeles"; url="https://ui-avatars.com/api/?name=Surgeles&size=400&background=8b5cf6&color=fff&bold=true"},
    @{name="Condiments"; url="https://ui-avatars.com/api/?name=Sauces&size=400&background=eab308&color=fff&bold=true"},
    @{name="Hygiene"; url="https://ui-avatars.com/api/?name=Hygiene&size=400&background=ec4899&color=fff&bold=true"}
)

# Créer le dossier si il n'existe pas
$outputDir = "backend/public/uploads/categories"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

Write-Host "Téléchargement des images de catégories..." -ForegroundColor Green

foreach ($category in $categories) {
    $filename = "$($category.name.ToLower()).jpg"
    $outputPath = Join-Path $outputDir $filename
    
    try {
        Invoke-WebRequest -Uri $category.url -OutFile $outputPath
        Write-Host "OK $filename telecharge" -ForegroundColor Green
    }
    catch {
        Write-Host "ERREUR pour $filename : $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Telechargement termine! Les images sont dans $outputDir" -ForegroundColor Green
