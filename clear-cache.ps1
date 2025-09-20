Write-Host "Clearing cache and restarting development server..." -ForegroundColor Green

Write-Host "Stopping any running processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Clearing node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}

Write-Host "Clearing package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

Write-Host "Reinstalling dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Starting development server..." -ForegroundColor Green
npm run dev
