@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================================
echo   SerialForge PRO — Сборка автономного .EXE файла
echo ========================================================
echo.
echo Компиляция в один независимый .exe (x64 Windows)...
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o ./publish_exe

if %ERRORLEVEL% EQU 0 (
    copy /y "app_icon.png" "publish_exe\app_icon.png" >nul 2>&1
    copy /y "app_icon.jpg" "publish_exe\app_icon.jpg" >nul 2>&1
    echo.
    echo ========================================================
    echo   УСПЕШНО! Готовый .exe файл собран в папке:
    echo   csharp_wpf/publish_exe/SerialForgeWpf.exe
    echo ========================================================
    explorer "publish_exe"
) else (
    echo.
    echo [ОШИБКА] Сборка завершилась с ошибкой. Проверьте установку .NET 8 SDK.
)
pause
