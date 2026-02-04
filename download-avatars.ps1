# PowerShell script to download avatars for all users

$users = @(
    "Alice Martin",
    "Bob Dupont",
    "Charlie Bernard",
    "Diana Petit",
    "Ethan Robert",
    "Fiona Richard",
    "Gabriel Durand",
    "Hannah Leroy",
    "Isaac Moreau",
    "Julia Simon"
)

$outputDir = "backend\public\uploads\avatars"

Write-Host "🎨 Downloading avatars..." -ForegroundColor Cyan

foreach ($user in $users) {
    $filename = $user.ToLower().Replace(" ", "-") + ".jpg"
    $filepath = Join-Path $outputDir $filename
    $url = "https://ui-avatars.com/api/?name=$($user.Replace(' ', '+'))&size=400&background=4f46e5&color=fff&bold=true&format=png"
    
    Write-Host "  → $filename" -NoNewline
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $filepath -ErrorAction Stop
        Write-Host " ✅" -ForegroundColor Green
    }
    catch {
        Write-Host " ❌ Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "All avatars downloaded!" -ForegroundColor Green
Write-Host "Location: $outputDir" -ForegroundColor Yellow
