import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getUserTasks } from '../../../services/api';
import TaskCard from '../../../components/TaskCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { Stack, useRouter } from 'expo-router';

export default function UserTasksList() {
  const router = useRouter();
  const { data: tasks, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['userTasks'],
    queryFn: () => getUserTasks().then(res => res.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-900">
      <Stack.Screen options={{ title: 'My Tasks', headerShown: true }} />
      <FlatList
        data={tasks}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={<EmptyState title="No tasks available" message="You're all caught up!" />}
        renderItem={({ item }: { item: any }) => (
          <TaskCard 
            task={item} 
            onPress={() => router.push(`/(user)/tasks/${item.id}` as any)}
          />
        )}
      />
    </View>
  );
}
