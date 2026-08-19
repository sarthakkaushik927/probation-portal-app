import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions, Keyboard } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import * as Haptics from 'expo-haptics';

// Helper component for animating the icon scale and position
// Helper component for animating the icon scale and position
// Helper component for animating the icon scale and position
const AnimatedTabIcon = ({ isFocused, options, color }: any) => {
  const scale = useRef(new Animated.Value(isFocused ? 1.25 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isFocused ? 1.25 : 1, // Nice subtle zoom
      useNativeDriver: true,
      bounciness: 12,
      speed: 12,
    }).start();
  }, [isFocused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View style={{ padding: 6 }}>
        {options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color, size: 26 }) : null}
      </View>
    </Animated.View>
  );
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // Theme Constants
  const borderColor = isDark ? '#ffffff' : '#000000';
  const tabBgColor = isDark ? 'rgba(9, 9, 11, 0.2)' : 'rgba(255, 255, 255, 0.3)';
  const pillBgColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

  // Determine which routes should actually be visible in the tab bar
  const visibleRoutes = state.routes.filter(route => {
    const { options } = descriptors[route.key];
    if (options.tabBarItemStyle && (options.tabBarItemStyle as any).display === 'none') return false;
    
    const hiddenRouteNames = [
      'notifications', 'profile', 'users/[userId]', 
      'tasks/create', 'tasks/[taskId]', 
      'submissions/[submissionId]', 'submissions/create', 
      'attendance/index'
    ];
    if (hiddenRouteNames.includes(route.name)) return false;

    return true;
  });

  const windowWidth = Dimensions.get('window').width;
  const tabWidth = (windowWidth - 44) / visibleRoutes.length;
  
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const activeRoute = state.routes[state.index];
    let activeVisibleIndex = visibleRoutes.findIndex(r => r.key === activeRoute.key);

    if (activeVisibleIndex === -1) {
      if (activeRoute.name.startsWith('users/')) activeVisibleIndex = visibleRoutes.findIndex(r => r.name === 'users/index');
      else if (activeRoute.name.startsWith('tasks/')) activeVisibleIndex = visibleRoutes.findIndex(r => r.name.startsWith('tasks'));
      else if (activeRoute.name.startsWith('submissions/')) activeVisibleIndex = visibleRoutes.findIndex(r => r.name.startsWith('submissions'));
      
      if (activeVisibleIndex === -1) activeVisibleIndex = 0;
    }

    Animated.spring(translateX, {
      toValue: activeVisibleIndex * tabWidth,
      useNativeDriver: true,
      bounciness: 12,
      speed: 12,
    }).start();
  }, [state.index, tabWidth, state.routes, visibleRoutes]);

  if (isKeyboardVisible) {
    return null;
  }

  return (
    <View style={{
      position: 'absolute',
      bottom: Math.max(insets.bottom + 10, 24),
      left: 20,
      right: 20,
      shadowColor: isDark ? '#ffffff' : '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
      borderRadius: 100,
      backgroundColor: 'transparent',
    }}>
      <View
        style={{
          height: 60, 
          borderRadius: 100,
          borderWidth: 2,
          borderColor: borderColor,
          backgroundColor: tabBgColor,
          overflow: 'hidden',
        }}
      >
        <BlurView tint={isDark ? "dark" : "light"} intensity={40} style={StyleSheet.absoluteFill} />
        
        <View style={{ flex: 1, flexDirection: 'row', position: 'relative' }}>
        {/* Animated Internal Sliding Bubble */}
        <Animated.View
          style={{
            position: 'absolute',
            width: tabWidth,
            height: '100%',
            alignItems: 'center', 
            justifyContent: 'center',
            transform: [{ translateX }],
          }}
        >
          <View style={{ 
            width: tabWidth - 16, 
            height: 44, 
            backgroundColor: pillBgColor, 
            borderRadius: 22,
          }} />
        </Animated.View>

        {/* Tab Icons */}
        {visibleRoutes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          // We must check if the GLOBAL state active route matches this route, 
          // or if the global active route is a child of this route (for highlighting)
          const activeRoute = state.routes[state.index];
          let isFocused = activeRoute.key === route.key;
          if (!isFocused && activeRoute.name.startsWith(route.name.split('/')[0])) {
             isFocused = true;
          }

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Slightly stronger haptic for a "liquid pop" feel
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const color = isFocused 
            ? (isDark ? '#ffffff' : '#000000') 
            : (isDark ? '#71717a' : '#a1a1aa');

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID}
              onPress={onPress}
              activeOpacity={0.8}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 2,
              }}
            >
              <AnimatedTabIcon isFocused={isFocused} options={options} color={color} isDark={isDark} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
    </View>
  );
}
