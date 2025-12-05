@echo off
title Bridge ComfyUI - Uvicorn

echo ===============================================
echo       LANCEMENT DU BRIDGE COMFYUI (UVICORN)
echo ===============================================
echo.

set COMFYUI_URL=http://127.0.0.1:8000/
echo Utilisation de l'adresse ComfyUI : %COMFYUI_URL%
echo.

cd /d "%~dp0"

echo [1/2] Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

echo [2/2] Démarrage du serveur Uvicorn sur le port 8001...
python -m uvicorn bridge_api:app --host 127.0.0.1 --port 8001

pause
