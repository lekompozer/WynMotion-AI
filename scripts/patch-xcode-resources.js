const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, '../ios/App/App.xcodeproj/project.pbxproj');
const entitlementsPath = path.join(__dirname, '../ios/App/App/App.entitlements');

// 0. Ensure App.entitlements file exists
if (!fs.existsSync(entitlementsPath)) {
  const defaultEntitlements = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.developer.applesignin</key>
\t<array>
\t\t<string>Default</string>
\t</array>
</dict>
</plist>
`;
  fs.writeFileSync(entitlementsPath, defaultEntitlements, 'utf8');
  console.log('✅ Created App.entitlements with Apple Sign-In capability!');
}

if (!fs.existsSync(projectPath)) {
  console.error(`Project file not found at ${projectPath}`);
  process.exit(1);
}

let content = fs.readFileSync(projectPath, 'utf8');
let modified = false;

// 1. Link GoogleService-Info.plist if missing
if (!content.includes('GoogleService-Info.plist in Resources')) {
  console.log('🔧 Adding GoogleService-Info.plist to Xcode project resources...');

  const buildFileMarker = '/* Begin PBXBuildFile section */';
  const buildFileEntry = '\t\t4987D7F72C0D4A9BA2A3D7C1 /* GoogleService-Info.plist in Resources */ = {isa = PBXBuildFile; fileRef = 7A2C47D89D1548BCB3F61E42 /* GoogleService-Info.plist */; };\n';
  content = content.replace(buildFileMarker, `${buildFileMarker}\n${buildFileEntry}`);

  const fileRefMarker = '/* Begin PBXFileReference section */';
  const fileRefEntry = '\t\t7A2C47D89D1548BCB3F61E42 /* GoogleService-Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = "GoogleService-Info.plist"; sourceTree = "<group>"; };\n';
  content = content.replace(fileRefMarker, `${fileRefMarker}\n${fileRefEntry}`);

  const appGroupRegex = /(504EC3061FED79650016851F\s*\/\*\s*App\s*\*\/\s*=\s*\{\s*isa\s*=\s*PBXGroup;\s*children\s*=\s*\(\n)/;
  content = content.replace(appGroupRegex, `$1\t\t\t\t7A2C47D89D1548BCB3F61E42 /* GoogleService-Info.plist */,\n`);

  const resPhaseRegex = /(504EC3021FED79650016851F\s*\/\*\s*Resources\s*\*\/\s*=\s*\{\s*isa\s*=\s*PBXResourcesBuildPhase;\s*buildActionMask\s*=\s*2147483647;\s*files\s*=\s*\(\n)/;
  content = content.replace(resPhaseRegex, `$1\t\t\t\t4987D7F72C0D4A9BA2A3D7C1 /* GoogleService-Info.plist in Resources */,\n`);

  modified = true;
  console.log('✅ GoogleService-Info.plist successfully linked to Xcode Resources!');
} else {
  console.log('⏭️ GoogleService-Info.plist is already linked in Xcode project.');
}

// 2. Link App.entitlements for Apple Sign In capability if missing
if (!content.includes('App.entitlements')) {
  console.log('🔧 Adding App.entitlements file reference to Xcode project...');
  const fileRefMarker = '/* Begin PBXFileReference section */';
  const fileRefEntry = '\t\t504EC3A01FED796500168520 /* App.entitlements */ = {isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = App.entitlements; sourceTree = "<group>"; };\n';
  content = content.replace(fileRefMarker, `${fileRefMarker}\n${fileRefEntry}`);

  const appGroupRegex = /(504EC3061FED79650016851F\s*\/\*\s*App\s*\*\/\s*=\s*\{\s*isa\s*=\s*PBXGroup;\s*children\s*=\s*\(\n)/;
  content = content.replace(appGroupRegex, `$1\t\t\t\t504EC3A01FED796500168520 /* App.entitlements */,\n`);
  modified = true;
}

// 3. Ensure CODE_SIGN_ENTITLEMENTS is present in build configurations
if (!content.includes('CODE_SIGN_ENTITLEMENTS = App/App.entitlements;')) {
  console.log('🔧 Configuring CODE_SIGN_ENTITLEMENTS for Debug and Release targets...');
  content = content.replace(
    /INFOPLIST_FILE = App\/Info\.plist;/g,
    'INFOPLIST_FILE = App/Info.plist;\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = App/App.entitlements;'
  );
  modified = true;
}

if (modified) {
  fs.writeFileSync(projectPath, content, 'utf8');
  console.log('✅ Xcode project successfully updated with Apple Sign In capabilities!');
} else {
  console.log('⏭️ Apple Sign-In Entitlements are already fully configured.');
}
