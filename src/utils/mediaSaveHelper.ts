import { Capacitor } from '@capacitor/core';

/**
 * Downloads a remote media file (video/image/audio) to the device's local cache
 * and triggers iOS Native Share / Save Sheet with a file:// URI.
 * On iOS, this provides the "Save Video" (Lưu vào Cuộn Camera) and "Save to Files" options.
 */
export async function saveAndShareMedia(remoteUrl: string, defaultName: string): Promise<boolean> {
  if (!remoteUrl) return false;

  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');

      const fileName = defaultName.includes('.') ? defaultName : `${defaultName}.mp4`;

      // Download file to device cache directory
      const downloadRes = await Filesystem.downloadFile({
        url: remoteUrl,
        path: fileName,
        directory: Directory.Cache,
      });

      const localFileUri = downloadRes.path;

      // Passing local file:// URI causes iOS to present "Save Video", "Save to Files", AirDrop
      await Share.share({
        title: defaultName,
        url: localFileUri,
        dialogTitle: 'Lưu hoặc chia sẻ video',
      });
      return true;
    } catch (err: any) {
      console.warn('Native downloadFile/Share error, falling back to URL share:', err);
      try {
        const { Share } = await import('@capacitor/share');
        await Share.share({
          title: defaultName,
          url: remoteUrl,
          dialogTitle: 'Lưu hoặc chia sẻ video',
        });
        return true;
      } catch (shareErr) {
        console.warn('Share failed:', shareErr);
      }
    }
  }

  // Web Browser fallback
  try {
    const a = document.createElement('a');
    a.href = remoteUrl;
    a.download = defaultName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (webErr) {
    console.error('Web download error:', webErr);
    window.open(remoteUrl, '_blank');
    return false;
  }
}
