@echo off
cd /d "%~dp0"
title MarketLink Frontend - VPS 172.16.2.89

echo ================================================================
echo   MARKETLINK FRONTEND - KHOI DONG TREN VPS 172.16.2.89
echo ================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] May VPS chua duoc cai dat Node.js!
    echo Vui long tai va cai dat Node.js tu: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [*] Dang mo port 5178 tren Windows Firewall...
netsh advfirewall firewall add rule name="Allow Port 5178" dir=in action=allow protocol=TCP localport=5178 >nul 2>nul

if not exist "node_modules\" (
    echo [1/2] Dang cai dat thu vien npm install...
    call npm install
    if %errorlevel% neq 0 (
        echo [LOI] npm install that bai!
        pause
        exit /b 1
    )
)

echo [2/2] Dang build Frontend npm run build...
call npm run build
if %errorlevel% neq 0 (
    echo [LOI] Build that bai!
    pause
    exit /b 1
)

echo.
echo ================================================================
echo   HE THONG DA KHOI CHAY THANH CONG!
echo   - Web Frontend:  http://172.16.2.89:5178
echo   - Localhost:     http://localhost:5178
echo   - Backend API:   http://172.16.2.89:8081
echo   - Swagger UI:    http://172.16.2.89:8081/swagger-ui/index.html
echo ================================================================
echo.

call npx vite preview --port 5178 --host 0.0.0.0
pause
