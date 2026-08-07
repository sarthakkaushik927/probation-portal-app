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

  const showToast = (text: string) => {
    setToast(text);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setToast(null));
      }, 3500);
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
  // Poll for notifications as a fallback (and to ensure mobile notification UX works)
  useNotificationsPoll((n: any) => {
    try {
      const title = n.title || 'Notification';
      const body = n.body || '';
      showToast(`${title}: ${body.length > 120 ? body.slice(0, 120) + '…' : body}`);
    } catch (e) {}
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, 5000);
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
    </Tabs>
    {toast && (
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: Platform.OS === 'ios' ? 80 : 40, left: 20, right: 20, alignItems: 'center', opacity: toastOpacity }}>
        <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.75)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>{toast}</Text>
        </View>
      </Animated.View>
    )}
    <AccountModal visible={isAccountModalVisible} onClose={() => setAccountModalVisible(false)} />
    </>
  );
}
