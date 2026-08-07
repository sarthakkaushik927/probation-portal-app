import { View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  useSharedValue,
  withSequence
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';

export default function LoadingSpinner() {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotateZ: `${rotation.value}deg` },
        { scale: scale.value }
      ],
    };
  });

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-950 absolute w-full h-full z-50">
      <Animated.View 
        style={[
          animatedStyle,
          {
            width: 48,
            height: 48,
            borderWidth: 6,
            borderColor: isDark ? '#ffffff' : '#000000',
            borderRadius: 12,
            backgroundColor: 'transparent'
          }
        ]}
      />
    </View>
  );
}
