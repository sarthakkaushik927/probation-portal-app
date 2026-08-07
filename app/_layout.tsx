import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from '../lib/query-client';
import { useAuthStore } from '../store/auth';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'nativewind';
import "../global.css";

// Prevent auto hide while we check auth
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { colorScheme } = useColorScheme();
  const { token, user, loadFromStorage } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage().finally(() => {
      setIsReady(true);
      SplashScreen.hideAsync();
    });
  }, []);

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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(user)" />
    </Stack>
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
