const fs = require('fs');
const path = require('path');

// 1. Patch Podfile
const podfilePath = path.join(__dirname, '../ios/App/Podfile');
if (fs.existsSync(podfilePath)) {
  let podfile = fs.readFileSync(podfilePath, 'utf8');
  if (!podfile.includes("config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'")) {
    const postInstallBlock = `post_install do |installer|
  assertDeploymentTarget(installer)
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
    end
  end
  installer.aggregate_targets.each do |target|
    target.user_project.build_configurations.each do |config|
      config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
    end
  end
end`;
    podfile = podfile.replace(/post_install do \|installer\|[\s\S]*?end/, postInstallBlock);
    fs.writeFileSync(podfilePath, podfile, 'utf8');
    console.log('✅ Patched Podfile with ENABLE_USER_SCRIPT_SANDBOXING = NO');
  }
}

// 2. Patch project.pbxproj
const pbxprojPath = path.join(__dirname, '../ios/App/App.xcodeproj/project.pbxproj');
if (fs.existsSync(pbxprojPath)) {
  let pbx = fs.readFileSync(pbxprojPath, 'utf8');
  pbx = pbx.replace(/buildSettings = \{/g, "buildSettings = {\n\t\t\t\tENABLE_USER_SCRIPT_SANDBOXING = NO;");
  // Remove duplicates if any
  pbx = pbx.replace(/ENABLE_USER_SCRIPT_SANDBOXING = NO;\s+ENABLE_USER_SCRIPT_SANDBOXING = NO;/g, "ENABLE_USER_SCRIPT_SANDBOXING = NO;");
  fs.writeFileSync(pbxprojPath, pbx, 'utf8');
  console.log('✅ Patched project.pbxproj with ENABLE_USER_SCRIPT_SANDBOXING = NO');
}
