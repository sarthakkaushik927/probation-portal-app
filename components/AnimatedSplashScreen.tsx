import { useEffect, useState } from 'react';
import { View, Image, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, Easing, useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

interface AnimatedSplashScreenProps {
  isReady: boolean;
  onAnimationComplete: () => void;
}

export default function AnimatedSplashScreen({ isReady, onAnimationComplete }: AnimatedSplashScreenProps) {
  const [animationFinished, setAnimationFinished] = useState(false);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const pulse = useSharedValue(1);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    // Initial entrance animation
    scale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });
    opacity.value = withTiming(1, { duration: 800 });

    // Subtle pulsing effect while waiting
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (isReady) {
      // Hide the native splash screen smoothly
      SplashScreen.hideAsync();

      // Exit animation
      opacity.value = withTiming(0, { duration: 600, easing: Easing.in(Easing.ease) });
      scale.value = withTiming(1.2, { duration: 600, easing: Easing.in(Easing.ease) });

      // Clean up after exit animation
      setTimeout(() => {
        setAnimationFinished(true);
        onAnimationComplete();
      }, 600);
    }
  }, [isReady]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value * pulse.value }],
    };
  });

  if (animationFinished) return null;

  return (
    <View 
      className={`absolute inset-0 z-50 flex-1 justify-center items-center ${isDark ? 'bg-zinc-950' : 'bg-white'}`}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, elevation: 999, zIndex: 99999 }}
    >
      <Animated.View style={animatedStyle}>
        <Image
          source={require('../assets/images/splash-icon.png')}
          style={{ width: 200, height: 200, resizeMode: 'contain' }}
        />
      </Animated.View>
    </View>
  );
}
