@echo off
echo ========================================
echo   WoldVirtual3D Editor 3D - Iniciando
echo ========================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado o no está en el PATH
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no está instalado o no está en el PATH
    pause
    exit /b 1
)

echo Node.js version: 
node --version
echo npm version:
npm --version
echo.

REM Verificar si las dependencias están instaladas
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al instalar dependencias
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   Iniciando servidor WebSocket...
echo ========================================
echo.

REM Iniciar el servidor WebSocket en segundo plano
start "Editor3D WebSocket Server" cmd /c "npm run server"

REM Esperar un momento para que el servidor se inicie
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Iniciando editor 3D...
echo ========================================
echo.

REM Iniciar el editor 3D
npm run dev

echo.
echo ========================================
echo   Editor 3D cerrado
echo ========================================
pause 