const fs = require('fs');
const path = require('path');

const podspecPath = path.resolve(__dirname, '../node_modules/@capacitor-firebase/authentication/CapacitorFirebaseAuthentication.podspec');

if (!fs.existsSync(podspecPath)) {
  console.log('⚠️ CapacitorFirebaseAuthentication.podspec not found. Skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(podspecPath, 'utf8');

// Check if it's already patched
if (!content.includes("lite.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'")) {
  console.log('🔧 Patching CapacitorFirebaseAuthentication.podspec to associate source_files with subspecs...');
  
  // 1. Remove the root s.source_files declaration
  content = content.replace("s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'\n", "");
  content = content.replace("s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'", "");

  // 2. Add source_files inside Lite subspec
  content = content.replace(
    "s.subspec 'Lite' do |lite|\n    # Default subspec that does not contain optional third party dependencies.\n  end",
    "s.subspec 'Lite' do |lite|\n    # Default subspec that does not contain optional third party dependencies.\n    lite.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'\n  end"
  );

  // 3. Add source_files inside Google subspec
  content = content.replace(
    "s.subspec 'Google' do |google|\n    google.xcconfig = { 'OTHER_SWIFT_FLAGS' => '$(inherited) -DRGCFA_INCLUDE_GOOGLE' }\n    google.dependency 'GoogleSignIn', '7.1.0'\n  end",
    "s.subspec 'Google' do |google|\n    google.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'\n    google.xcconfig = { 'OTHER_SWIFT_FLAGS' => '$(inherited) -DRGCFA_INCLUDE_GOOGLE' }\n    google.dependency 'GoogleSignIn', '~> 7.1.0'\n  end"
  );

  fs.writeFileSync(podspecPath, content, 'utf8');
  console.log('✅ CapacitorFirebaseAuthentication.podspec patched successfully!');
} else {
  console.log('⏭️ CapacitorFirebaseAuthentication.podspec is already patched.');
}
