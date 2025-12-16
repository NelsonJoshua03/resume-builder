#!/bin/bash

# CareerCraft.in Staging Deployment Script

set -e

echo "🚀 Deploying to Staging Environment..."

# Set staging environment
export VITE_ENV=staging

# Build with staging config
npm run build

# Deploy to Firebase staging channel
firebase hosting:channel:deploy staging --expires 7d --non-interactive

echo "✅ Staging deployment complete!"
echo "🌐 Staging URL: https://careercraft-36711.web.app"