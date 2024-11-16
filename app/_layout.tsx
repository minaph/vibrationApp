import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';


// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

//   if (!loaded) {
//     return null;
//   }

//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }}></Stack.Screen>
//         <Stack.Screen name="index"></Stack.Screen>
//         <Stack.Screen name="+not-found" />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// }


// app/_layout.tsx
import { useCallback } from 'react';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  // const [fontsLoaded, fontError] = useFonts({
  //   'NotoSansJP-Regular': require('../assets/fonts/NotoSansJP-Regular.ttf'),
  //   'NotoSansJP-Medium': require('../assets/fonts/NotoSansJP-Medium.ttf'),
  //   'NotoSansJP-Bold': require('../assets/fonts/NotoSansJP-Bold.ttf'),
  // });

  const onLayoutRootView = useCallback(async () => {
    // if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    // }
  }, []);

  // if (!fontsLoaded && !fontError) {
  //   return null;
  // }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f8fafc' }
      }}
    />
  );
}

// -----------------------------------



// -----------------------------------

// app/session.tsx


// -----------------------------------



// -----------------------------------


// -----------------------------------

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