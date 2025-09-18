@echo off
echo Stopping any existing backend processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im wrangler.exe 2>nul

echo Starting MicroFi SaaS backend...
cd backend
npx wrangler dev --port 8787