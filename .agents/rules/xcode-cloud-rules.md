# Xcode Cloud Release & Tag Automation Rules for WynMotion-AI

## Trigger & Deployment Policy
- **NO Automatic Build on Commit/Push**: Xcode Cloud workflow `Xcode-Cloud-Default` is strictly configured to **DISABLE** automatic triggers on standard `git push` or branch commits to preserve build quota.
- **Tag-based Auto Archive & TestFlight Deployment**: Xcode Cloud will ONLY automatically start building, archiving, and deploying to TestFlight Internal Testing when a new semantic version tag is created and pushed to GitHub:
  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```

## Manual Deployment Workflow
When completing features and ready to publish a new build to TestFlight:
1. Ensure all code changes are committed and pushed to `main`.
2. Create a new version tag (e.g. `v1.0.0`, `v1.0.1`):
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
3. Xcode Cloud will detect the `v*` tag change, run `ci_scripts/ci_post_clone.sh`, compile the project, and automatically push the build to TestFlight for Internal Testers.
