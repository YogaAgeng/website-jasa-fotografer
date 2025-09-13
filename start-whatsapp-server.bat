@echo off
echo Starting Photo Booking Server with WhatsApp Integration...
cd server
echo Installing dependencies...
call npm install
echo.
echo Starting server with WhatsApp support...
echo Make sure to scan QR code when it appears to connect WhatsApp
echo.
call npm run dev
pause
