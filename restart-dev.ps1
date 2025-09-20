Write-Host "Restarting development server..." -ForegroundColor Green

Write-Host "Stopping any running processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Clearing Vite cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
}

Write-Host "Starting development server..." -ForegroundColor Green
npm run dev
