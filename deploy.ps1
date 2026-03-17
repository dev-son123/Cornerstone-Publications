#!/bin/pwsh
# Cornerstone Research - Automated Deployment Script
# Usage: .\deploy.ps1

$ErrorActionPreference = "Stop"

# Color output
function Write-Header { Write-Host "`n═══════════════════════════════════════════" -ForegroundColor Cyan; Write-Host $args -ForegroundColor Cyan; Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Cyan }
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Warning { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Error-Custom { Write-Host "❌ $args" -ForegroundColor Red }

Write-Header "CORNERSTONE DEPLOYMENT SCRIPT"

# Step 1: Define paths
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$appFolder = Join-Path $projectRoot "app"
$distFolder = Join-Path $appFolder "dist"
$deploymentZip = Join-Path $projectRoot "deployment-build.zip"

Write-Host "Project Root: $projectRoot"
Write-Host "App Folder: $appFolder"
Write-Host "Dist Folder: $distFolder`n"

# Step 2: Verify app folder exists
if (-not (Test-Path $appFolder)) {
    Write-Error-Custom "❌ app/ folder not found at: $appFolder"
    exit 1
}
Write-Success "app/ folder found"

# Step 3: Check if npm is available
try {
    $npmVersion = npm --version
    Write-Success "npm version: $npmVersion"
} catch {
    Write-Error-Custom "npm not found. Please install Node.js"
    exit 1
}

# Step 4: Build the app
Write-Header "BUILDING APPLICATION"
Push-Location $appFolder
try {
    if (Test-Path "node_modules") {
        Write-Host "Running: npm run build" -ForegroundColor Yellow
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Build failed!"
            exit 1
        }
    } else {
        Write-Warning "node_modules not found. Run 'npm install' first"
        exit 1
    }
} finally {
    Pop-Location
}

Write-Success "Build completed successfully"

# Step 5: Verify dist folder
if (-not (Test-Path $distFolder)) {
    Write-Error-Custom "dist/ folder not created!"
    exit 1
}
Write-Success "dist/ folder verified"

# Step 6: List dist contents
Write-Header "DISTRIBUTION CONTENTS"
Get-ChildItem -Path $distFolder -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Substring($distFolder.Length + 1)
    if ($_.PSIsContainer) {
        Write-Host "📁 $relativePath/"
    } else {
        Write-Host "📄 $relativePath"
    }
}

# Step 7: Create deployment zip
Write-Header "CREATING DEPLOYMENT PACKAGE"
if (Test-Path $deploymentZip) {
    Remove-Item $deploymentZip -Force
    Write-Host "Removed old deployment-build.zip"
}

try {
    Compress-Archive -Path "$distFolder/*" -DestinationPath $deploymentZip -Force
    $zipSize = (Get-Item $deploymentZip).Length / 1MB
    Write-Success "Deployment package created: deployment-build.zip ($([Math]::Round($zipSize, 2)) MB)"
} catch {
    Write-Error-Custom "Failed to create zip file: $_"
    exit 1
}

# Step 8: Summary and next steps
Write-Header "DEPLOYMENT READY ✅"
Write-Host @"
Your app is ready to deploy!

📦 DEPLOYMENT PACKAGE LOCATION:
   $deploymentZip

📋 WHAT TO UPLOAD TO HOSTINGER:
   File: deployment-build.zip
   Destination: public_html/
   
🚀 NEXT STEPS:

   1. Open Hostinger File Manager (cpanel)
   2. Navigate to public_html/
   3. Delete existing files (if any)
   4. Upload deployment-build.zip
   5. Extract/Unzip the file in public_html/
   6. Set up environment variables in .env

📝 FILES IN DEPLOYMENT:
   - index.html (main page)
   - assets/ (JavaScript + CSS bundles)
   - logo.jpeg, journal-logo.jpeg (images)
   - _redirects (routing config)

⚙️  ENVIRONMENT SETUP:
   Create .env in public_html/ with:
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key

"@

Write-Host "Press any key to open the deployment folder..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Invoke-Item $projectRoot
