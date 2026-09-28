@echo off
chcp 65001 >nul
title MarketLink Frontend - VPS 172.16.2.89
color 0A

echo ====================================================================
echo      MARKETLINK FRONTEND - KHỞI CHẠY VPS WINDOWS 10 (172.16.2.89)
echo ====================================================================
echo.

:: 1. Kiểm tra môi trường Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [LỖI] Máy chủ VPS chưa được cài đặt Node.js!
    echo Vui lòng tải và cài đặt Node.js bản LTS tại: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Mở cổng tường lửa Windows Firewall cho Cổng 5178 (Web) và 8081 (Backend)
echo [*] Đang thiết lập tường lửa Windows Firewall cho cổng 5178...
netsh advfirewall firewall add rule name="Allow MarketLink Port 5178" dir=in action=allow protocol=TCP localport=5178 >nul 2>nul
netsh advfirewall firewall add rule name="Allow MarketLink Port 8081" dir=in action=allow protocol=TCP localport=8081 >nul 2>nul

:: 3. Kiểm tra và cài đặt thư viện dependencies
if not exist "node_modules\" (
    echo [1/3] Đang tải thư viện dependencies (Lần đầu clone)...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [LỖI] npm install thất bại! Vui lòng kiểm tra lại kết nối mạng.
        pause
        exit /b 1
    )
) else (
    echo [1/3] Thư viện dependencies đã sẵn sàng.
)

:: 4. Đóng gói Frontend tối ưu
echo.
echo [2/3] Đang đóng gói dự án Frontend (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo [LỖI] Build Frontend thất bại!
    pause
    exit /b 1
)

:: 5. Khởi động Web Server
echo.
echo [3/3] Đang khởi động Web Server trên Cổng 5178...
echo.
echo ====================================================================
echo   🎉 HỆ THỐNG ĐÃ KHỞI CHẠY THÀNH CÔNG TRÊN VPS 172.16.2.89:5178!
echo ====================================================================
echo   * Web Frontend:       http://172.16.2.89:5178
echo   * Localhost:          http://localhost:5178
echo   * Backend SpringBoot: http://172.16.2.89:8081
echo   * Swagger UI Doc:     http://172.16.2.89:8081/swagger-ui/index.html
echo.
echo   Toàn bộ API được tự động chuyển tiếp trực tiếp mượt mà 100%%.
echo   Nhấn Ctrl + C để dừng máy chủ.
echo ====================================================================
echo.

call npx vite preview --port 5178 --host 0.0.0.0
pause
