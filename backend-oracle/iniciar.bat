@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

echo.
echo ==========================================
echo   Portal Synthetica - API FastAPI + Oracle
echo ==========================================
echo.

set "CHECKVER=import sys; sys.exit(0 if (3,10) <= sys.version_info < (3,15) else 1)"
set "PY="

py -3.14 -c "!CHECKVER!" >nul 2>&1
if not errorlevel 1 set "PY=py -3.14"

if not defined PY (
    py -3 -c "!CHECKVER!" >nul 2>&1
    if not errorlevel 1 set "PY=py -3"
)

if not defined PY (
    python -c "!CHECKVER!" >nul 2>&1
    if not errorlevel 1 set "PY=python"
)

if not defined PY (
    echo [ERRO] Nenhum Python entre 3.10 e 3.14 foi encontrado.
    echo Baixe em https://www.python.org/downloads/ e marque "Add python.exe to PATH".
    pause
    exit /b 1
)

for /f "delims=" %%v in ('%PY% --version 2^>^&1') do set "PYVER=%%v"
echo Usando: !PYVER!  ^(!PY!^)
echo.

set "VENVPY=.venv\Scripts\python.exe"

if exist "%VENVPY%" (
    "%VENVPY%" -c "import sys" >nul 2>&1
    if errorlevel 1 (
        echo [1/4] Ambiente virtual .venv quebrado - recriando ...
        rmdir /s /q .venv
    )
)

if not exist "%VENVPY%" (
    echo [1/4] Criando ambiente virtual .venv ...
    %PY% -m venv .venv
    if errorlevel 1 ( echo [ERRO] Falha ao criar o venv. & pause & exit /b 1 )
) else (
    echo [1/4] Ambiente virtual .venv ja existe.
)

echo [2/4] Instalando dependencias ...
"%VENVPY%" -m pip install --upgrade pip --quiet
"%VENVPY%" -m pip install -r requirements.txt --quiet
if errorlevel 1 ( echo [ERRO] Falha ao instalar dependencias. & pause & exit /b 1 )

if not exist ".env" (
    echo [3/4] .env nao encontrado - copiando de .env.exemplo ...
    copy .env.exemplo .env >nul
    echo.
    echo ==========================================
    echo   ATENCAO: preencha o .env com as
    echo   credenciais do Oracle. Abrindo o notepad ...
    echo ==========================================
    echo.
    notepad .env
    echo Depois de salvar, rode este script de novo.
    pause
    exit /b 0
) else (
    echo [3/4] Arquivo .env encontrado.
)

echo [4/4] Subindo API em http://127.0.0.1:8010
echo       Documentacao Swagger: http://127.0.0.1:8010/docs
echo       Pressione CTRL+C para parar.
echo.
start "" http://127.0.0.1:8010/docs
"%VENVPY%" -m uvicorn main:app --reload --port 8010

echo.
echo Servidor encerrado.
pause
