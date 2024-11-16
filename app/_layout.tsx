
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import 'react-native-reanimated';



// app/_layout.tsx
import { useCallback } from 'react';

SplashScreen.preventAutoHideAsync();

export default function Layout() {


  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}



// // app.config.ts
// import { ExpoConfig, ConfigContext } from 'expo/config';

// export default ({ config }: ConfigContext): ExpoConfig => ({
//   ...config,
//   name: '禅道',
//   slug: 'zendo',
//   version: '1.0.0',
//   orientation: 'portrait',
//   icon: './assets/icon.png',
//   userInterfaceStyle: 'light',
//   splash: {
//     image: './assets/splash.png',
//     resizeMode: 'contain',
//     backgroundColor: '#f8fafc'
//   },
//   assetBundlePatterns: [
//     '**/*'
//   ],
//   ios: {
//     supportsTablet: true,
//     bundleIdentifier: 'com.yourcompany.zendo'
//   },
//   android: {
//     adaptiveIcon: {
//       foregroundImage: './assets/adaptive-icon.png',
//       backgroundColor: '#f8fafc'
//     },
//     package: 'com.yourcompany.zendo'
//   },
//   plugins: [
//     [
//       'expo-sensors',
//       {
//         androidPermissions: ['android.permission.VIBRATE']
//       }
//     ]
//   ]
// });