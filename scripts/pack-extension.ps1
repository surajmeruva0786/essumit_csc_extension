# Pack CSC Sahayak extension for Chrome Web Store (run from repo root)
# Usage: .\scripts\pack-extension.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$dest = Join-Path $root "extension-pack"
$zipPath = Join-Path $root "csc-sahayak-extension.zip"

# Build extension frontend first
Push-Location (Join-Path $root "extension_frontend")
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

# Create clean pack directory
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# Copy required files (no node_modules, no .env)
$copyItems = @(
    "manifest.json",
    "background.js",
    "content.js",
    "panel.html",
    "panel.js",
    "validationRules.js",
    "aiAssistant.js",
    "icons",
    "knowledge_base",
    "mic_permission.html",
    "mic_permission.js"
)
foreach ($item in $copyItems) {
    $src = Join-Path $root $item
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dest -Recurse -Force
    }
}
Copy-Item -Path (Join-Path $root "extension_frontend\dist") -Destination (Join-Path $dest "extension_frontend\dist") -Recurse -Force

# Create zip
if (Test-Path $zipPath) { Remove-Item $zipPath }
Compress-Archive -Path "$dest\*" -DestinationPath $zipPath
Remove-Item -Recurse -Force $dest

Write-Host "Done. Extension zip: $zipPath"
Write-Host "Upload this file to Chrome Web Store Developer Dashboard."
