import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { usePathname } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const ROUTE_COLORS = {
  default: { topLight: 'rgba(191, 219, 254, 0.4)', bottomLight: 'rgba(233, 213, 255, 0.4)', topDark: 'rgba(30, 58, 138, 0.25)', bottomDark: 'rgba(88, 28, 135, 0.25)' },
  chat: { topLight: 'rgba(254, 202, 202, 0.4)', bottomLight: 'rgba(254, 240, 138, 0.4)', topDark: 'rgba(127, 29, 29, 0.25)', bottomDark: 'rgba(113, 63, 18, 0.25)' },
  tasks: { topLight: 'rgba(167, 243, 208, 0.4)', bottomLight: 'rgba(153, 246, 228, 0.4)', topDark: 'rgba(6, 78, 59, 0.25)', bottomDark: 'rgba(15, 118, 110, 0.25)' },
  submissions: { topLight: 'rgba(253, 230, 138, 0.4)', bottomLight: 'rgba(254, 215, 170, 0.4)', topDark: 'rgba(113, 63, 18, 0.25)', bottomDark: 'rgba(124, 45, 18, 0.25)' },
  attendance: { topLight: 'rgba(191, 219, 254, 0.4)', bottomLight: 'rgba(251, 207, 232, 0.4)', topDark: 'rgba(30, 58, 138, 0.25)', bottomDark: 'rgba(131, 24, 67, 0.25)' },
};

export default function Background({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const pathname = usePathname();

  const topColor = useSharedValue(isDark ? ROUTE_COLORS.default.topDark : ROUTE_COLORS.default.topLight);
  const bottomColor = useSharedValue(isDark ? ROUTE_COLORS.default.bottomDark : ROUTE_COLORS.default.bottomLight);

  useEffect(() => {
    let routeKey = 'default';
    if (pathname.includes('chat')) routeKey = 'chat';
    else if (pathname.includes('tasks')) routeKey = 'tasks';
    else if (pathname.includes('submissions')) routeKey = 'submissions';
    else if (pathname.includes('attendance')) routeKey = 'attendance';

    const colors = ROUTE_COLORS[routeKey as keyof typeof ROUTE_COLORS];

    topColor.value = withTiming(isDark ? colors.topDark : colors.topLight, { duration: 1000 });
    bottomColor.value = withTiming(isDark ? colors.bottomDark : colors.bottomLight, { duration: 1000 });
  }, [pathname, isDark]);

  const topStyle = useAnimatedStyle(() => ({
    backgroundColor: topColor.value,
  }));
  const bottomStyle = useAnimatedStyle(() => ({
    backgroundColor: bottomColor.value,
  }));

  return (
    <View style={styles.container} className="bg-white dark:bg-zinc-950">
      <Animated.View className="absolute top-0 right-0 w-96 h-96 rounded-full -mt-20 -mr-20" style={[topStyle, { filter: isDark ? 'blur(70px)' : 'blur(60px)' } as any]} />
      <Animated.View className="absolute bottom-0 left-0 w-96 h-96 rounded-full -mb-20 -ml-20" style={[bottomStyle, { filter: isDark ? 'blur(70px)' : 'blur(60px)' } as any]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
