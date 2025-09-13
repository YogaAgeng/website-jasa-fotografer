Write-Host "Starting Photo Booking Server with WhatsApp Integration..." -ForegroundColor Green
Set-Location server
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host ""
Write-Host "Starting server with WhatsApp support..." -ForegroundColor Yellow
Write-Host "Make sure to scan QR code when it appears to connect WhatsApp" -ForegroundColor Cyan
Write-Host ""
npm run dev
