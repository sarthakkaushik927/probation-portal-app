import { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet, Text, Platform, Animated, Easing } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import ThemeToggle from '../../components/ThemeToggle';
import AccountModal from '../../components/AccountModal';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../../hooks/useRealtime';
import { getNotifications } from '../../services/api';
import { useNotificationsPoll } from '../../hooks/useNotificationsPoll';
import * as Haptics from 'expo-haptics';
import CustomTabBar from '../../components/CustomTabBar';

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

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications().then(res => res.data.data),
    refetchInterval: 60000, // Refresh every minute
  });
  const queryClient = useQueryClient();
  const { subscribe } = useRealtime();
  const [toast, setToast] = useState<string | null>(null);
  const toastOpacity = useState(new Animated.Value(0))[0];

  const toastTranslateY = useState(new Animated.Value(-20))[0];

  const showToast = (text: string) => {
    setToast(text);
    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(toastTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      })
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.timing(toastTranslateY, { toValue: -20, duration: 250, useNativeDriver: true })
        ]).start(() => setToast(null));
      }, 4000);
    });
  };

  useEffect(() => {
    if (!user?.id) return;
    const channel = `user-${user.id}`;
    const unsub = subscribe(channel, 'mention', (data: any) => {
      try {
        const from = data?.from?.name || 'Someone';
        const text = data?.message?.content || '';
        showToast(`${from}: ${text.length > 120 ? text.slice(0, 120) + '…' : text}`);
      } catch (e) {
        // ignore
      }
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      try { unsub(); } catch (e) {}
    };
  }, [user?.id, subscribe, queryClient]);
  // Notifications are handled via Pusher realtime (above) + react-query's 60s refetchInterval.
  // No aggressive polling needed.
  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <>
      <Tabs
        tabBar={(props: any) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: true,
          headerTransparent: true,
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarHideOnKeyboard: true,
        animation: 'fade', // screen transition animation
        header: ({ options }) => {
          return (
            <View style={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 10, backgroundColor: 'transparent' }} className="px-5">
              <View className="flex-row items-center justify-between">
                <View className="rounded-full border-2 border-black dark:border-white overflow-hidden">
                  <BlurView tint={isDark ? 'dark' : 'light'} intensity={40} style={{ backgroundColor: isDark ? 'rgba(9, 9, 11, 0.1)' : 'rgba(255, 255, 255, 0.2)' }} className="px-5 py-2.5">
                    <Text className="font-bold font-sans text-xl text-zinc-900 dark:text-white">
                      {options.title || 'Dashboard'}
                    </Text>
                  </BlurView>
                </View>
                <View className="rounded-full border-2 border-black dark:border-white overflow-hidden">
                  <BlurView tint={isDark ? 'dark' : 'light'} intensity={40} style={{ backgroundColor: isDark ? 'rgba(9, 9, 11, 0.1)' : 'rgba(255, 255, 255, 0.2)' }} className="flex-row items-center gap-2 px-3 py-1.5">
                    <TouchableOpacity onPress={() => router.push('/(user)/notifications')} className="items-center justify-center w-9 h-9 relative">
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
        name="chat"
        options={{
          title: 'Chat',
          headerTitle: 'Global Chat',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="chat-bubble-outline" size={24} color={color} />,
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
      <Tabs.Screen
        name="discussion/[submissionId]"
        options={{
          href: null,
          title: 'Discussion',
        }}
      />
    </Tabs>
    {toast && (
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 16, right: 16, opacity: toastOpacity, transform: [{ translateY: toastTranslateY }], zIndex: 9999 }}>
        <View className="rounded-2xl border-2 border-black/10 dark:border-white/20 overflow-hidden shadow-2xl w-full">
          <BlurView tint={isDark ? "dark" : "light"} intensity={50} style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: isDark ? 'rgba(9, 9, 11, 0.2)' : 'rgba(255, 255, 255, 0.4)', flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="notifications-active" size={24} color={isDark ? "#fff" : "#000"} />
            <Text className="text-zinc-900 dark:text-white font-bold text-base ml-3 flex-1">{toast}</Text>
          </BlurView>
        </View>
      </Animated.View>
    )}
    <AccountModal visible={isAccountModalVisible} onClose={() => setAccountModalVisible(false)} />
    </>
  );
}
