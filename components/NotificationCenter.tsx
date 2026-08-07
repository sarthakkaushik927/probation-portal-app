import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import EmptyState from './EmptyState';
import { useColorScheme } from 'nativewind';
import LoadingSpinner from './LoadingSpinner';
import GlassCard from './GlassCard';

export default function NotificationCenter() {
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data: notifications, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications().then(res => res.data.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (isLoading) return <LoadingSpinner />;

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <View className="flex-1" style={{ paddingTop: 130 }}>
      <View className="flex-row justify-between items-center p-4 border-b-2 border-black dark:border-white">
        <Text className="text-xl font-bold font-sans text-zinc-900 dark:text-white tracking-tighter uppercase">Notifications {unreadCount > 0 && `(${unreadCount})`}</Text>
        {unreadCount > 0 && (
          <TouchableOpacity 
            className="bg-black dark:bg-white px-4 py-2 rounded-lg"
            onPress={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            {markAllReadMutation.isPending ? (
              <ActivityIndicator color={isDark ? "black" : "white"} size="small" />
            ) : (
              <Text className="text-white dark:text-black font-bold font-mono">Mark All Read</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
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
              <TouchableOpacity 
                className={`p-4 rounded-xl ${item.isRead ? 'opacity-70' : ''}`}
                onPress={() => {
                  if (!item.isRead && item.userId) markReadMutation.mutate(item.id);
                }}
                disabled={item.isRead || markReadMutation.isPending || !item.userId}
              >
                <View className="flex-row items-start">
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
                  <View className="flex-1">
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
                  {!item.isRead && (
                    <View className="w-3 h-3 rounded-full bg-red-500 ml-2 mt-2 shadow-sm shadow-red-500/50" />
                  )}
                </View>
              </TouchableOpacity>
            </GlassCard>
          </View>
        )}
      />
    </View>
  );
}
