@echo off
echo Starting MicroFi Multi-Tenant Backend...
cd /d "%~dp0..\backend"
echo Backend directory: %cd%
npx wrangler dev --port 8787