import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from '../lib/query-client';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAuthStore } from '../store/auth';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'nativewind';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View } from "react-native";
import CustomSplashScreen from '../components/CustomSplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import "../global.css";

// Prevent auto hide while we check auth
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  const { colorScheme } = useColorScheme();
  const { token, user, loadFromStorage } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem('appTheme').then(theme => {
      if (theme === 'light' || theme === 'dark') {
        setColorScheme(theme);
      }
    }).catch(e => console.warn('Failed to load theme:', e));
  }, []);

  useEffect(() => {
    loadFromStorage()
      .catch((e) => console.warn('Failed to load auth:', e))
      .finally(() => {
        setIsReady(true);
        // Note: CustomSplashScreen will hide the native one once it mounts
      });
  }, []);

  usePushNotifications();

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inUserGroup = segments[0] === '(user)';

    if (!token) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (user) {
      if (user.role === 'ADMIN' && !inAdminGroup) {
        router.replace('/(admin)/dashboard');
      } else if (user.role === 'USER' && !inUserGroup) {
        router.replace('/(user)/dashboard');
      }
    }
  }, [isReady, token, user, segments]);

  if (!isReady) return null;

  const LightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#000000',
      background: 'transparent',
      card: '#ffffff',
      text: '#000000',
      border: '#e4e4e7',
      notification: '#71717a',
    },
  };

  const PremiumTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#FFFFFF',
      background: 'transparent',
      card: '#09090b',
      text: '#FFFFFF',
      border: '#27272a',
      notification: '#71717a',
    },
  };

  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={isDark ? PremiumTheme : LightTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090b' : '#f8fafc' }}>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'fade'
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(user)" />
        </Stack>
        {!splashFinished && <CustomSplashScreen onFinish={() => setSplashFinished(true)} />}
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <RootLayoutNav />
    </PersistQueryClientProvider>
  );
}
