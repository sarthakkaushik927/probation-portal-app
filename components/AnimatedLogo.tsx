import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence, withSpring } from 'react-native-reanimated';

export default function AnimatedLogo({ size = 96 }: { size?: number }) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 15000, easing: Easing.linear }),
      -1,
      false
    );
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

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` }
      ]
    }
  });

  return (
    <Animated.View style={[animatedStyle, { width: size, height: size }]} className="relative items-center justify-center">
      {/* Outer rotating glow ring (optional cool effect) */}
      <Animated.View style={[rotateStyle, { position: 'absolute', width: size * 1.2, height: size * 1.2, borderRadius: size, borderWidth: 2, borderColor: 'rgba(168, 85, 247, 0.4)', borderStyle: 'dashed' }]} />
      
      {/* The actual logo image */}
      <View className="overflow-hidden rounded-3xl" style={{ width: size, height: size }}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={{ width: '100%', height: '100%' }} 
          contentFit="cover"
        />
      </View>
    </Animated.View>
  );
}
