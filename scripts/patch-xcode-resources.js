const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, '../ios/App/App.xcodeproj/project.pbxproj');

if (!fs.existsSync(projectPath)) {
  console.error(`Project file not found at ${projectPath}`);
  process.exit(1);
}

let content = fs.readFileSync(projectPath, 'utf8');

if (!content.includes('GoogleService-Info.plist in Resources')) {
  console.log('🔧 Adding GoogleService-Info.plist to Xcode project resources...');

  // 1. Add to PBXBuildFile section
  const buildFileMarker = '/* Begin PBXBuildFile section */';
  const buildFileEntry = '\t\t4987D7F72C0D4A9BA2A3D7C1 /* GoogleService-Info.plist in Resources */ = {isa = PBXBuildFile; fileRef = 7A2C47D89D1548BCB3F61E42 /* GoogleService-Info.plist */; };\n';
  content = content.replace(buildFileMarker, `${buildFileMarker}\n${buildFileEntry}`);

  // 2. Add to PBXFileReference section
  const fileRefMarker = '/* Begin PBXFileReference section */';
  const fileRefEntry = '\t\t7A2C47D89D1548BCB3F61E42 /* GoogleService-Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = "GoogleService-Info.plist"; sourceTree = "<group>"; };\n';
  content = content.replace(fileRefMarker, `${fileRefMarker}\n${fileRefEntry}`);

  // 3. Add to App PBXGroup
  const appGroupRegex = /(504EC3061FED79650016851F\s*\/\*\s*App\s*\*\/\s*=\s*\{\s*isa\s*=\s*PBXGroup;\s*children\s*=\s*\(\n)/;
  content = content.replace(appGroupRegex, `$1\t\t\t\t7A2C47D89D1548BCB3F61E42 /* GoogleService-Info.plist */,\n`);

  // 4. Add to PBXResourcesBuildPhase
  const resPhaseRegex = /(504EC3021FED79650016851F\s*\/\*\s*Resources\s*\*\/\s*=\s*\{\s*isa\s*=\s*PBXResourcesBuildPhase;\s*buildActionMask\s*=\s*2147483647;\s*files\s*=\s*\(\n)/;
  content = content.replace(resPhaseRegex, `$1\t\t\t\t4987D7F72C0D4A9BA2A3D7C1 /* GoogleService-Info.plist in Resources */,\n`);

  fs.writeFileSync(projectPath, content, 'utf8');
  console.log('✅ GoogleService-Info.plist successfully linked to Xcode Resources!');
} else {
  console.log('⏭️ GoogleService-Info.plist is already linked in Xcode project.');
}
