# fix-npm.ps1 - Fix npm issues on Windows
Write-Host "🚀 CareerCraft Firebase Fix Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# 1. Stop any running processes
Write-Host "`n1. Stopping running processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Clean up
Write-Host "`n2. Cleaning up temporary files..." -ForegroundColor Yellow
if (Test-Path ".\node_modules") {
    Remove-Item -Path ".\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   Removed node_modules" -ForegroundColor Cyan
}
if (Test-Path ".\package-lock.json") {
    Remove-Item -Path ".\package-lock.json" -Force -ErrorAction SilentlyContinue
    Write-Host "   Removed package-lock.json" -ForegroundColor Cyan
}
if (Test-Path ".\dist") {
    Remove-Item -Path ".\dist" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   Removed dist folder" -ForegroundColor Cyan
}
if (Test-Path ".\.vite") {
    Remove-Item -Path ".\.vite" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   Removed .vite folder" -ForegroundColor Cyan
}

# 3. Clear npm cache
Write-Host "`n3. Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "   ✅ Cache cleared" -ForegroundColor Green

# 4. Fix npm authentication
Write-Host "`n4. Fixing npm authentication..." -ForegroundColor Yellow
try {
    npm logout
    Write-Host "   ✅ Logged out from npm" -ForegroundColor Green
} catch {
    Write-Host "   ℹ️ No active npm session" -ForegroundColor Yellow
}

# Remove .npmrc files
$npmrcPaths = @(
    "$env:USERPROFILE\.npmrc",
    "C:\Users\Nelso\.npmrc",
    "$env:APPDATA\npm\node_modules\.npmrc",
    "$env:LOCALAPPDATA\npm-cache\_logs"
)
foreach ($path in $npmrcPaths) {
    if (Test-Path $path) {
        Remove-Item $path -Force -Recurse -ErrorAction SilentlyContinue
        Write-Host "   Removed $path" -ForegroundColor Cyan
    }
}

# 5. Install dependencies
Write-Host "`n5. Installing dependencies..." -ForegroundColor Yellow
npm install

# 6. Install specific type packages
Write-Host "`n6. Installing TypeScript type definitions..." -ForegroundColor Yellow
npm install @types/react-firebase-hooks --save-dev

# 7. Verify installation
Write-Host "`n7. Verifying installation..." -ForegroundColor Yellow
npm list firebase
npm list @types/react-firebase-hooks

# 8. Run TypeScript check
Write-Host "`n8. Running TypeScript check..." -ForegroundColor Yellow
npx tsc --noEmit

Write-Host "`n=================================" -ForegroundColor Green
Write-Host "✅ Fix script completed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run dev" -ForegroundColor Cyan
Write-Host "2. Open: http://localhost:3001" -ForegroundColor Cyan
Write-Host "3. Test Firebase at: http://localhost:3001/firebase-test" -ForegroundColor Cyan
Write-Host "`nIf issues persist, run: npm run fresh-install" -ForegroundColor Red

# Wait for user input
Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')