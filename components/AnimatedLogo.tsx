import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence, withSpring } from 'react-native-reanimated';

export default function AnimatedLogo({ width = 240, height = 80 }: { width?: number; height?: number }) {
  const scale = useSharedValue(0.9);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[animatedStyle, { width, height }]} className="relative items-center justify-center">
      <View style={{ width: '100%', height: '100%' }}>
        <Image 
          source={require('../assets/images/logo.svg')} 
          style={{ width: '100%', height: '100%' }} 
          contentFit="contain"
        />
      </View>
    </Animated.View>
  );
}
