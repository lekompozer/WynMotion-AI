# GitHub Copilot Instructions for WynMotion-AI

## Xcode Cloud Build & Release Policy
- Automatic builds on `commit` / `push` to `main` are disabled in Xcode Cloud to conserve build minutes.
- Xcode Cloud is configured to build, archive, and deploy to TestFlight (Internal Testing) ONLY when a new version tag (e.g. `v1.0.0`) is created and pushed:
  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```

## Mobile & Web Parity
- WynMotion-AI iOS & Web Studio must share identical component structures, timeline tracks, and rendering engines with `wordai`.
- Audio flyout tabs, dynamic scene renderers, and instant memory blob previews (`URL.createObjectURL(file)`) must be kept in 1:1 synchronization across repositories.
