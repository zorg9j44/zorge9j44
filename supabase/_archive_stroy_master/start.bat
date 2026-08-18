@echo off
chcp 65001 > nul
title Локальный сервер Строй-Мастер

cd /d "c:\Users\37061\Downloads\remont"

echo ========================================================
echo   Запуск встроенного локального сервера...
echo   Ссылка откроется в браузере автоматически:
echo   http://localhost:3000/
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "c:\Users\37061\Downloads\remont\server.ps1"

pause
