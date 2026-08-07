import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import EmptyState from './EmptyState';
import { useColorScheme } from 'nativewind';
import LoadingSpinner from './LoadingSpinner';

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

  if (isLoading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
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
          <TouchableOpacity 
            className={`p-4 mb-4 rounded-xl border-2 border-black dark:border-white ${item.isRead ? 'bg-zinc-100 dark:bg-zinc-900 opacity-70' : 'bg-white dark:bg-zinc-950'}`}
            onPress={() => {
              if (!item.isRead) markReadMutation.mutate(item.id);
            }}
            disabled={item.isRead || markReadMutation.isPending}
          >
            <View className="flex-row items-start">
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 border-2 border-black dark:border-white ${item.isRead ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-black dark:bg-white'}`}>
                <MaterialIcons 
                  name={item.type === 'ATTENDANCE' ? 'event-available' : item.type === 'SUBMISSION' ? 'task-alt' : 'campaign'} 
                  size={20} 
                  color={item.isRead ? (isDark ? "#a1a1aa" : "#71717a") : (isDark ? "#000000" : "#ffffff")} 
                />
              </View>
              <View className="flex-1">
                <Text className={`text-base font-bold mb-1 ${item.isRead ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>
                  {item.title}
                </Text>
                <Text className={`text-sm ${item.isRead ? 'text-zinc-500 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                  {item.message}
                </Text>
                <Text className="text-xs font-bold font-mono text-zinc-400 dark:text-zinc-600 mt-2">
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
              {!item.isRead && (
                <View className="w-3 h-3 rounded-full bg-red-500 ml-2 mt-1" />
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
