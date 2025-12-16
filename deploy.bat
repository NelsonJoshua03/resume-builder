@echo off
echo ========================================
echo CareerCraft.in Deployment
echo ========================================
echo Time: %date% %time%
echo.

echo Step 1: Clean previous build...
if exist "dist" rmdir /s /q "dist"

echo.
echo Step 2: Install dependencies...
call npm install

echo.
echo Step 3: Build project...
call npm run build

if not exist "dist" (
    echo ❌ Build failed: dist directory not created
    pause
    exit /b 1
)

echo ✅ Build successful!

echo.
echo Step 4: Deploy to Firebase...
call firebase deploy

echo.
echo ========================================
echo 🎉 DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo 🌐 Live at: https://careercraft.in
echo 📊 Firebase Console: https://console.firebase.google.com/project/careercraft-36711
echo.
pause