Write-Host "Starting Photo Booking Server..." -ForegroundColor Green
Set-Location server
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host "Starting server..." -ForegroundColor Yellow
npm run dev
