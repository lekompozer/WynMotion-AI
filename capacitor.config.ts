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
    contentInset: 'never',
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
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com', 'apple.com'],
    },
    Keyboard: {
      resize: 'none',
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'LIGHT',
    },
  } as any,
};

export default config;
