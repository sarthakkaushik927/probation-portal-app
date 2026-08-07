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
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '../../services/api';

export default function AdminLayout() {
  const user = useAuthStore(state => state.user);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);

  const activeColor = isDark ? '#ffffff' : '#000000';
  const inactiveColor = isDark ? '#71717a' : '#a1a1aa';
  const borderColor = isDark ? '#ffffff' : '#000000';
  const tabBgColor = isDark ? 'rgba(9, 9, 11, 0.6)' : 'rgba(255, 255, 255, 0.6)';
  const insets = useSafeAreaInsets();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications().then(res => res.data.data),
    refetchInterval: 60000,
  });
  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

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
            <View style={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 10, backgroundColor: 'transparent' }} className="px-5">
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
                    <TouchableOpacity onPress={() => router.push('/(admin)/notifications')} className="items-center justify-center w-9 h-9 relative">
                      <MaterialIcons name="notifications" size={22} color={activeColor} />
                      {unreadCount > 0 && (
                        <View className="absolute top-1 right-1 bg-red-500 w-3.5 h-3.5 rounded-full items-center justify-center border-2 border-transparent">
                        </View>
                      )}
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
        name="users/index"
        options={{
          title: 'Users',
          headerTitle: 'Users',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="people" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users/[userId]"
        options={{
          href: null,
          headerShown: true,
          headerTitle: 'User Detail',
        }}
      />
      <Tabs.Screen
        name="tasks/index"
        options={{
          title: 'Tasks',
          headerTitle: 'Tasks',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="assignment" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks/create"
        options={{
          href: null,
          headerShown: true,
          headerTitle: 'Create Task',
        }}
      />
      <Tabs.Screen
        name="tasks/[taskId]"
        options={{
          href: null,
          headerShown: true,
          headerTitle: 'Edit Task',
        }}
      />
      <Tabs.Screen
        name="submissions/index"
        options={{
          title: 'Reviews',
          headerTitle: 'Reviews',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="inbox" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="submissions/[submissionId]"
        options={{
          href: null,
          headerShown: true,
          headerTitle: 'Review Submission',
        }}
      />
      <Tabs.Screen
        name="attendance/index"
        options={{
          href: null,
          title: 'Attendance',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="event-available" size={26} color={color} />,
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
