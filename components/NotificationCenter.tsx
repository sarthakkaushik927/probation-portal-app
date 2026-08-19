import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import EmptyState from './EmptyState';
import { useColorScheme } from 'nativewind';
import LoadingSpinner from './LoadingSpinner';
import GlassCard from './GlassCard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/auth';

export default function NotificationCenter() {
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const getNotificationRoute = (notification: any): string | null => {
    const type = notification.type;
    if (isAdmin) {
      switch (type) {
        case 'SUBMISSION_STATUS': return '/(admin)/submissions';
        case 'TASK_ASSIGNED': return '/(admin)/tasks';
        case 'ATTENDANCE': return '/(admin)/attendance';
        default: return null;
      }
    } else {
      switch (type) {
        case 'SUBMISSION_STATUS': return '/(user)/submissions';
        case 'TASK_ASSIGNED': return '/(user)/tasks';
        case 'ATTENDANCE': return '/(user)/attendance';
        default: return null;
      }
    }
  };

  const { data: notifications, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications().then(res => res.data.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData(['notifications']);
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return old;
        return old.map((n: any) => n.id === id ? { ...n, isRead: true } : n);
      });
      return { previousNotifications };
    },
    onError: (err, id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData(['notifications']);
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return old;
        return old.map((n: any) => ({ ...n, isRead: true }));
      });
      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData(['notifications']);
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return old;
        return old.filter((n: any) => n.id !== id);
      });
      return { previousNotifications };
    },
    onError: (err, id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (isLoading) return <LoadingSpinner />;

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleNotificationTap = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!item.isRead) {
      markReadMutation.mutate(item.id);
    }
    const route = getNotificationRoute(item);
    if (route) {
      router.push(route as any);
    }
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteMutation.mutate(id);
  };

  return (
    <View className="flex-1" style={{ paddingTop: 130 }}>
      {unreadCount > 0 && (
        <View className="flex-row justify-end items-center px-4 pt-4 pb-2">
          <TouchableOpacity 
            className="bg-black dark:bg-white px-4 py-2 rounded-lg"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              markAllReadMutation.mutate();
            }}
            disabled={markAllReadMutation.isPending}
          >
            {markAllReadMutation.isPending ? (
              <ActivityIndicator color={isDark ? "black" : "white"} size="small" />
            ) : (
              <Text className="text-white dark:text-black font-bold font-mono">Mark All Read</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          refetch();
        }} />}
        ListEmptyComponent={
          <EmptyState 
            title="No Notifications" 
            message="You're all caught up! We'll notify you when something happens." 
            icon="notifications-off"
          />
        }
        renderItem={({ item }: { item: any }) => (
          <View className="mb-4">
            <GlassCard>
              <View className={`p-4 rounded-xl flex-row items-center justify-between ${item.isRead ? 'opacity-70' : ''}`}>
                <TouchableOpacity 
                  className="flex-1 flex-row items-start"
                  onPress={() => handleNotificationTap(item)}
                >
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 border-2 border-black/10 dark:border-white/10 ${item.isRead ? 'bg-zinc-200/50 dark:bg-zinc-800/50' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                    <MaterialIcons 
                      name={
                        item.type === 'ATTENDANCE' ? 'event-available' : 
                        item.type === 'SUBMISSION_STATUS' ? 'task-alt' : 
                        item.type === 'TASK_ASSIGNED' ? 'assignment' : 
                        item.type === 'BROADCAST' ? 'campaign' : 'notifications'
                      } 
                      size={24} 
                      color={isDark ? "#ffffff" : "#000000"} 
                    />
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className={`text-base font-bold mb-1 ${item.isRead ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>
                      {item.title}
                    </Text>
                    <Text className={`text-sm ${item.isRead ? 'text-zinc-500 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {item.body}
                    </Text>
                    <Text className="text-xs font-bold font-mono text-zinc-400 dark:text-zinc-500 mt-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View className="flex-row items-center space-x-2 gap-2">
                  <TouchableOpacity 
                    onPress={() => handleDelete(item.id)}
                    className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"
                  >
                    <MaterialIcons name="delete-outline" size={20} color={isDark ? "#f87171" : "#ef4444"} />
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          </View>
        )}
      />
    </View>
  );
}
