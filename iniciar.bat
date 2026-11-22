@echo off
setlocal EnableExtensions
chcp 65001 >nul
title UniMatricula

set "ROOT=%~dp0"

echo ============================================================
echo    UniMatricula - Sistema de Matriculas
echo ============================================================
echo.

rem 1) Verifica Node.js
where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao foi encontrado. Instale em https://nodejs.org
  echo.
  pause
  exit /b 1
)

rem 2) Libera a porta 4000 (encerra processos antigos do sistema)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":4000" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%p >nul 2>nul
)

rem 3) Instala dependencias (somente na primeira vez)
if not exist "%ROOT%backend\node_modules" (
  echo Instalando dependencias do backend...
  pushd "%ROOT%backend"
  call npm install --no-audit --no-fund
  popd
)
if not exist "%ROOT%frontend\node_modules" (
  echo Instalando dependencias do frontend...
  pushd "%ROOT%frontend"
  call npm install --no-audit --no-fund
  popd
)

rem 4) Compila o frontend (somente na primeira vez)
if not exist "%ROOT%frontend\dist\index.html" (
  echo Compilando o frontend...
  pushd "%ROOT%frontend"
  call npm run build
  popd
)

echo.
echo ============================================================
echo  Iniciando o sistema...
echo  O NAVEGADOR VAI ABRIR SOZINHO. Nao digite nada.
echo  Para parar, feche esta janela (ou Ctrl+C).
echo ============================================================
echo.
cd /d "%ROOT%backend"
call npm start
