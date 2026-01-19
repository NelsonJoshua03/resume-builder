@echo off
echo ========================================
echo CareerCraft Performance Optimization
echo ========================================
echo.

echo Step 1: Cleaning up old files...
del /f package-lock.json 2>nul
rmdir /s /q node_modules 2>nul
echo ✓ Cleaned old files
echo.

echo Step 2: Clearing npm cache...
npm cache clean --force
echo ✓ Cache cleared
echo.

echo Step 3: Installing dependencies...
call npm install --legacy-peer-deps --no-audit --fund false
echo ✓ Dependencies installed
echo.

echo Step 4: Building optimized version...
call npm run build:prod
echo ✓ Build completed
echo.

echo Step 5: Starting preview server...
echo.
echo Open http://localhost:3001 in your browser
echo Press Ctrl+C to stop the server
echo.
call npm run preview:prod