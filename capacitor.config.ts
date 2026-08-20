import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pro.wynai.wynmotion',
  appName: 'WynMotion AI',
  webDir: 'out',
  appendUserAgent: 'Safari/604.1 WynMotionApp/1.0',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'always',
  },
  cordova: {
    preferences: {
      AllowInlineMediaPlayback: 'true',
      MediaPlaybackRequiresUserAction: 'false',
    },
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    Keyboard: {
      resize: 'none',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FFFFFF',
    },
  } as any,
};

export default config;
