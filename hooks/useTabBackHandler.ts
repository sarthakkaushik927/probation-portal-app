import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useRouter } from 'expo-router';

export function useTabBackHandler(fallbackRoute: any) {
  const router = useRouter();
  
  useEffect(() => {
    const onBackPress = () => {
      router.replace(fallbackRoute);
      return true; // prevent default behavior (which goes to Dashboard in Tabs)
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [fallbackRoute, router]);
}
