import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';

/**
 * Handles back navigation for nested tab screens.
 * Uses router.back() to preserve the navigation stack instead of router.replace(),
 * which was causing pages to be skipped when pressing back.
 * Falls back to navigating to fallbackRoute only if there's no history to go back to.
 */
export function useTabBackHandler(fallbackRoute: any) {
  const router = useRouter();
  const navigation = useNavigation();
  
  useEffect(() => {
    const onBackPress = () => {
      // Try going back in the stack first to preserve navigation history
      if (navigation.canGoBack()) {
        router.back();
      } else {
        // Only replace as a last resort when there's no history
        router.replace(fallbackRoute);
      }
      return true; // prevent default behavior
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [fallbackRoute, router, navigation]);
}
