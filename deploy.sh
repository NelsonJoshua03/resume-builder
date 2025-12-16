#!/bin/bash
set -e

echo "🚀 CareerCraft.in Deployment"
echo "============================"

# Check if Firebase is logged in
if ! firebase projects:list 2>/dev/null | grep -q "careercraft-36711"; then
    echo "❌ Not logged into Firebase or wrong project"
    echo "Run: firebase login"
    echo "Then: firebase use careercraft-36711"
    exit 1
fi

# Build for production
echo "📦 Building for production..."
npm run build:prod

# Check build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

# Deploy
echo "🔥 Deploying to Firebase..."
firebase deploy

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "🌐 Live at: https://careercraft.in"
echo ""
echo "Next steps:"
echo "1. Check Firebase Console: https://console.firebase.google.com/project/careercraft-36711"
echo "2. Verify Analytics: https://analytics.google.com"
echo "3. Test site: https://careercraft.in"