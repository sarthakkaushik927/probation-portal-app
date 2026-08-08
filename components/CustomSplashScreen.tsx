import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'nativewind';

export default function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(12);
  const screenOpacity = useSharedValue(1);

  const [done, setDone] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    // Logo entrance — fast spring
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 120 });

    // Tagline slides up after logo
    taglineOpacity.value = withDelay(350, withTiming(1, { duration: 400 }));
    taglineTranslateY.value = withDelay(350, withSpring(0, { damping: 14, stiffness: 100 }));

    // Fade entire screen out after 1.4s
    screenOpacity.value = withDelay(1400, withTiming(0, { duration: 500 }, (finished) => {
      if (finished) {
        runOnJS(setDone)(true);
      }
    }));
  }, []);

  useEffect(() => {
    if (done) onFinish();
  }, [done, onFinish]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, screenStyle, { 
      backgroundColor: isDark ? '#09090b' : '#ffffff', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 9999 
    }]}>
      {/* Logo */}
      <Animated.View style={logoStyle}>
        <Image 
          source={require('../assets/images/logo.svg')} 
          style={{ width: 220, height: 72 }} 
          contentFit="contain"
          cachePolicy="memory"
        />
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[taglineStyle, { marginTop: 16 }]}>  
        <Text style={{ 
          color: isDark ? '#a1a1aa' : '#71717a', 
          fontSize: 14, 
          fontWeight: '500',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          Probation Portal
        </Text>
      </Animated.View>

      {/* Bottom branding */}
      <View style={{ position: 'absolute', bottom: 48, alignItems: 'center' }}>
        <Text style={{ 
          color: isDark ? '#3f3f46' : '#d4d4d8', 
          fontSize: 11, 
          fontWeight: '600',
          letterSpacing: 1.5,
        }}>
          NEXTGEN SOLUTIONS
        </Text>
      </View>
    </Animated.View>
  );
}
