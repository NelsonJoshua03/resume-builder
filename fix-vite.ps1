# fix-vite.ps1 - Fix Vite installation issues on Windows
Write-Host "🚀 CareerCraft Vite Fix Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check current directory
Write-Host "`nCurrent Directory: $pwd" -ForegroundColor Yellow

# 1. Stop any running processes
Write-Host "`n1. Stopping running processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Clean up everything
Write-Host "`n2. Cleaning up ALL temporary files..." -ForegroundColor Yellow
@("node_modules", "package-lock.json", "dist", ".vite", ".npmrc") | ForEach-Object {
    if (Test-Path $_) {
        Remove-Item -Path $_ -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   Removed $_" -ForegroundColor Cyan
    }
}

# 3. Clear ALL npm caches
Write-Host "`n3. Clearing npm caches..." -ForegroundColor Yellow
npm cache clean --force
npm cache verify

# 4. Check Node.js and npm versions
Write-Host "`n4. Checking Node.js and npm versions..." -ForegroundColor Yellow
node --version
npm --version

# 5. Install dependencies with legacy peer deps
Write-Host "`n5. Installing dependencies with legacy-peer-deps..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# 6. Install Vite globally for CLI access
Write-Host "`n6. Installing Vite globally..." -ForegroundColor Yellow
npm install -g vite

# 7. Verify Vite installation
Write-Host "`n7. Verifying Vite installation..." -ForegroundColor Yellow
npm list vite
npx vite --version

# 8. Run TypeScript check
Write-Host "`n8. Running TypeScript check..." -ForegroundColor Yellow
npx tsc --noEmit

Write-Host "`n=================================" -ForegroundColor Green
Write-Host "✅ Fix script completed!" -ForegroundColor Green

Write-Host "`n🚀 Now run these commands:" -ForegroundColor Yellow
Write-Host "1. npm run dev" -ForegroundColor Cyan
Write-Host "   OR" -ForegroundColor Cyan
Write-Host "2. npx vite --host" -ForegroundColor Cyan

# Wait for user input
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')