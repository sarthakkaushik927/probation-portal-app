import { useState } from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import ThemeToggle from '../../components/ThemeToggle';
import AccountModal from '../../components/AccountModal';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

export default function UserLayout() {
  const user = useAuthStore(state => state.user);
  const router = useRouter();
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const activeColor = isDark ? '#ffffff' : '#000000';
  const inactiveColor = isDark ? '#71717a' : '#a1a1aa';
  const borderColor = isDark ? '#ffffff' : '#000000';
  const tabBgColor = isDark ? 'rgba(9, 9, 11, 0.6)' : 'rgba(255, 255, 255, 0.6)';
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTransparent: true,
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarHideOnKeyboard: true,
          tabBarBackground: () => (
            <BlurView tint={isDark ? "dark" : "light"} intensity={80} style={StyleSheet.absoluteFill} />
          ),
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom + 10, 24),
          marginHorizontal: 20,
          elevation: 0,
          backgroundColor: tabBgColor,
          borderWidth: 2,
          borderColor: borderColor,
          borderRadius: 100,
          height: 72,
          overflow: 'hidden',
          paddingBottom: 6, // Give space for text labels
        },
        tabBarItemStyle: {
          paddingTop: 8,
          paddingBottom: 4,
        },
        header: ({ options }) => {
          return (
            <View style={{ paddingTop: Math.max(insets.top, 10), paddingBottom: 10, backgroundColor: 'transparent' }} className="px-5">
              <View className="flex-row items-center justify-between">
                <View className="rounded-full border-2 border-black dark:border-white overflow-hidden">
                  <BlurView tint={isDark ? 'dark' : 'light'} intensity={80} className="px-5 py-2.5">
                    <Text className="font-bold font-sans text-xl text-zinc-900 dark:text-white">
                      {options.title || 'Dashboard'}
                    </Text>
                  </BlurView>
                </View>
                <View className="rounded-full border-2 border-black dark:border-white overflow-hidden">
                  <BlurView tint={isDark ? 'dark' : 'light'} intensity={80} className="flex-row items-center gap-2 px-3 py-1.5">
                    <TouchableOpacity onPress={() => router.push('/(user)/notifications')} className="items-center justify-center w-9 h-9">
                      <MaterialIcons name="notifications" size={22} color={activeColor} />
                    </TouchableOpacity>
                    <View className="w-9 h-9 items-center justify-center">
                      <ThemeToggle />
                    </View>
                    <TouchableOpacity onPress={() => setAccountModalVisible(true)} className="items-center justify-center w-9 h-9 overflow-hidden rounded-full border border-transparent dark:border-zinc-800">
                      {user?.avatarData ? (
                        <Image source={{ uri: user.avatarData }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                      ) : (
                        <MaterialIcons name="person" size={24} color={activeColor} />
                      )}
                    </TouchableOpacity>
                  </BlurView>
                </View>
              </View>
            </View>
          );
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'Dashboard',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="dashboard" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          headerTitle: 'Tasks',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="assignment" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="submissions"
        options={{
          title: 'Projects',
          headerTitle: 'Projects',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="rocket-launch" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="calendar-month" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: 'Profile',
        }}
      />
    </Tabs>
    <AccountModal visible={isAccountModalVisible} onClose={() => setAccountModalVisible(false)} />
    </>
  );
}
