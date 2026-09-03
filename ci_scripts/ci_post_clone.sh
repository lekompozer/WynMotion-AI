#!/bin/bash
# ci_scripts/ci_post_clone.sh
# Automated Xcode Cloud pre-build hook for WynMotion AI
# Resolves GoogleSignIn dependency and bypasses CocoaPods CDN timeout via Podfile.lock

set -e

echo "🚀 Starting Xcode Cloud pre-build hook for WynMotion AI..."

# Ensure UTF-8 locale for CocoaPods and Ruby
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Configure curl retry and timeout to prevent CocoaPods CDN timeout on Xcode Cloud
echo "⚙️ Configuring curl network timeout for CocoaPods CDN..."
echo "retry = 5" >> ~/.curlrc
echo "retry-delay = 2" >> ~/.curlrc
echo "connect-timeout = 60" >> ~/.curlrc
echo "max-time = 180" >> ~/.curlrc

# Navigate to repo root regardless of runner invocation directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/../../../package.json" ]; then
    cd "$SCRIPT_DIR/../../.."
elif [ -f "$SCRIPT_DIR/../../package.json" ]; then
    cd "$SCRIPT_DIR/../.."
elif [ -f "$SCRIPT_DIR/../package.json" ]; then
    cd "$SCRIPT_DIR/.."
fi
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

echo "⚙️ Copying web assets to iOS platform (without unpatched pod install)..."
npx cap copy ios

echo "⚙️ Patching CapacitorFirebaseAuthentication podspec..."
node scripts/patch-podspec.js

echo "⚙️ Linking GoogleService-Info.plist to Xcode project resources..."
node scripts/patch-xcode-resources.js

echo "⚙️ Disabling Xcode User Script Sandboxing..."
node scripts/patch-xcode-sandboxing.js

echo "⚙️ Configuring capacitor.config.json packageClassList..."
node -e "const fs=require('fs');const p='ios/App/App/capacitor.config.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.packageClassList=Array.from(new Set([...(j.packageClassList||[]),'CapacitorFirebaseAuthentication.FirebaseAuthenticationPlugin']));fs.writeFileSync(p,JSON.stringify(j,null,'\t')+'\n');"

echo "⚙️ Updating Podfile to use CapacitorFirebaseAuthentication/Google subspec..."
cd ios/App
node -e "const fs=require('fs');const p='Podfile';fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace(\"pod 'CapacitorFirebaseAuthentication'\", \"pod 'CapacitorFirebaseAuthentication/Google'\"),'utf8');"

echo "⚙️ Installing Pods in ios/App using locked dependencies..."
pod install || pod install --repo-update || (sleep 5 && pod install)

echo "✅ Xcode Cloud pre-build hook completed successfully!"
