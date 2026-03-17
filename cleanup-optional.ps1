#!/bin/pwsh
# Optional Cleanup Script - Removes editor config and unnecessary files
# WARNING: This is optional and won't affect deployment
# Usage: .\cleanup-optional.ps1

$confirm = Read-Host "This will remove editor config files (.vscode, .hintrc). Continue? (y/n)"

if ($confirm -eq 'y' -or $confirm -eq 'Y') {
    $projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
    
    $toDelete = @(
        (Join-Path $projectRoot ".vscode"),
        (Join-Path $projectRoot ".hintrc"),
        (Join-Path $projectRoot "app" ".vscode")
    )
    
    foreach ($path in $toDelete) {
        if (Test-Path $path) {
            Write-Host "Deleting: $path" -ForegroundColor Yellow
            Remove-Item -Path $path -Recurse -Force
            Write-Host "✅ Deleted" -ForegroundColor Green
        }
    }
    
    Write-Host "`n✅ Cleanup complete! Your app is ready for deployment." -ForegroundColor Green
    Write-Host "Next: Run .\deploy.ps1 to prepare deployment package" -ForegroundColor Cyan
} else {
    Write-Host "Cleanup cancelled. Your files are safe." -ForegroundColor Yellow
}
