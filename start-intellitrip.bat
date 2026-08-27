@echo off
setlocal enabledelayedexpansion
title IntelliTrip Launcher

echo ================================================================
echo   IntelliTrip - Starting Backend + Frontend
echo ================================================================
echo.

REM ---------------------------------------------------------------
REM Resolve the project root as the folder THIS .bat file lives in,
REM so it works no matter where you extracted the project (E:\, C:\, etc.)
REM ---------------------------------------------------------------
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

if not exist "%BACKEND%\package.json" (
  echo [ERROR] Could not find backend\package.json under:
  echo   %ROOT%
  echo Make sure this .bat file sits directly inside the IntelliTrip
  echo folder, next to the "backend" and "frontend" folders.
  echo.
  pause
  exit /b 1
)
if not exist "%FRONTEND%\package.json" (
  echo [ERROR] Could not find frontend\package.json under:
  echo   %ROOT%
  pause
  exit /b 1
)

REM ---------------------------------------------------------------
REM Step 1 - backend .env check
REM ---------------------------------------------------------------
echo [1/6] Checking backend\.env ...
if not exist "%BACKEND%\.env" (
  echo   [WARN] backend\.env not found.
  if exist "%BACKEND%\.env.example" (
    copy "%BACKEND%\.env.example" "%BACKEND%\.env" >nul
    echo   Created backend\.env from .env.example.
    echo   IMPORTANT: open backend\.env now and set DATABASE_URL / JWT_SECRET
    echo   to match your MySQL setup, then re-run this script.
    echo.
    pause
    exit /b 1
  ) else (
    echo   [ERROR] backend\.env.example is also missing. Cannot continue.
    pause
    exit /b 1
  )
) else (
  echo   Found backend\.env - OK.
)

REM Warn about the classic Windows/Notepad ".env.txt" trap
if exist "%BACKEND%\.env.txt" (
  echo   [WARN] backend\.env.txt also exists - this is usually a mistake
  echo   caused by Notepad. Node only reads the file named exactly ".env".
)

REM ---------------------------------------------------------------
REM Step 2 - frontend .env check (optional, has code fallback)
REM ---------------------------------------------------------------
echo [2/6] Checking frontend\.env ...
if not exist "%FRONTEND%\.env" (
  if exist "%FRONTEND%\.env.example" (
    copy "%FRONTEND%\.env.example" "%FRONTEND%\.env" >nul
    echo   Created frontend\.env from .env.example - default values work out of the box.
  )
) else (
  echo   Found frontend\.env - OK.
)

REM ---------------------------------------------------------------
REM Step 3 - backend dependencies
REM ---------------------------------------------------------------
echo [3/6] Backend dependencies ...
cd /d "%BACKEND%"
if not exist "node_modules" (
  echo   Running npm install in backend - first run only, this can take a few minutes...
  call npm install
  if errorlevel 1 (
    echo   [ERROR] npm install failed in backend. Fix the error above and re-run this script.
    pause
    exit /b 1
  )
) else (
  echo   node_modules already present - skipping npm install.
)

REM ---------------------------------------------------------------
REM Step 4 - frontend dependencies
REM ---------------------------------------------------------------
echo [4/6] Frontend dependencies ...
cd /d "%FRONTEND%"
if not exist "node_modules" (
  echo   Running npm install in frontend - first run only...
  call npm install
  if errorlevel 1 (
    echo   [ERROR] npm install failed in frontend. Fix the error above and re-run this script.
    pause
    exit /b 1
  )
) else (
  echo   node_modules already present - skipping npm install.
)

REM ---------------------------------------------------------------
REM Step 5 - start the backend in its OWN window (must stay open)
REM ---------------------------------------------------------------
echo [5/6] Starting backend on http://localhost:5000 in a new window ...
start "IntelliTrip BACKEND (do not close)" cmd /k "cd /d "%BACKEND%" && npm run dev"

echo   Waiting for the backend to come up ...
timeout /t 6 /nobreak >nul

REM ---------------------------------------------------------------
REM Step 6 - start the frontend in its OWN window (must stay open)
REM ---------------------------------------------------------------
echo [6/6] Starting frontend on http://localhost:5173 in a new window ...
start "IntelliTrip FRONTEND (do not close)" cmd /k "cd /d "%FRONTEND%" && npm run dev"

echo   Waiting for the frontend to come up ...
timeout /t 6 /nobreak >nul

start "" "http://localhost:5173"

echo.
echo ================================================================
echo   Two new windows just opened:
echo     - "IntelliTrip BACKEND"  -^> must stay open (http://localhost:5000)
echo     - "IntelliTrip FRONTEND" -^> must stay open (http://localhost:5173)
echo.
echo   DO NOT CLOSE either window while you're using the app.
echo   This launcher window can be closed - it has done its job.
echo.
echo   Quick health check : http://localhost:5000/api/health
echo   The actual app     : http://localhost:5173
echo ================================================================
echo.
pause
