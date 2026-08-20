import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pro.wynai.wynmotion',
  appName: 'WynMotion AI',
  webDir: 'out',
  appendUserAgent: 'Safari/604.1 WynMotionApp/1.0',
  server: {
    hostname: 'www.wynai.pro',
    iosScheme: 'https',
    allowNavigation: ['*'],
  },
  ios: {
    scheme: 'App',
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
  },
};

export default config;
