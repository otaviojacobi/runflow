export default {
  name: 'RunFlow',
  slug: 'runflow',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'runflow', // Deep linking scheme for OAuth
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.runflow.app',
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ['runflow']
        }
      ]
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.runflow.app',
    intentFilters: [
      {
        action: 'VIEW',
        category: ['BROWSABLE', 'DEFAULT'],
        data: {
          scheme: 'runflow'
        }
      }
    ]
  },
  plugins: [
    'expo-font'
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    turnstileSiteKey: process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY,
    googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  }
};
