#!/bin/bash
# ios/App/ci_scripts/ci_post_clone.sh
# Automated Xcode Cloud pre-build hook for WynMotion AI

set -e

echo "🚀 Starting Xcode Cloud pre-build hook for WynMotion AI..."

# Ensure UTF-8 locale for CocoaPods and Ruby
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Navigate to repo root
cd ../../..
echo "📂 Working directory: $(pwd)"

# Install Node.js if missing
if ! command -v node >/dev/null 2>&1; then
    echo "⚙️ Node.js not found. Installing via Homebrew..."
    brew install node
fi

# Install CocoaPods if missing
if ! command -v pod >/dev/null 2>&1; then
    echo "⚙️ CocoaPods not found. Installing via Homebrew..."
    brew install cocoapods
fi

echo "🟢 Node version: $(node --version)"
echo "🟢 NPM version: $(npm --version)"
echo "🟢 Pod version: $(pod --version)"

echo "⚙️ Installing npm dependencies..."
npm install

echo "⚙️ Building Next.js static export..."
npm run build

echo "⚙️ Syncing Capacitor iOS platform..."
npx cap sync ios

echo "⚙️ Disabling Xcode User Script Sandboxing..."
node scripts/patch-xcode-sandboxing.js

echo "⚙️ Installing Pods in ios/App..."
cd ios/App
pod install --repo-update

echo "✅ Xcode Cloud pre-build hook completed successfully!"
