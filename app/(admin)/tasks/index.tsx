import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAdminTasks } from '../../../services/api';
import TaskCard from '../../../components/TaskCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { Stack, useRouter, Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminTasksList() {
  const router = useRouter();
  const { data: tasks, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminTasks'],
    queryFn: () => getAdminTasks().then(res => res.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-900">
      <Stack.Screen 
        options={{ 
          title: 'All Tasks', 
          headerShown: true,
          headerRight: () => (
            <Link href="/(admin)/tasks/create" asChild>
              <TouchableOpacity className="mr-4">
                <MaterialIcons name="add-circle" size={24} color="#3b82f6" />
              </TouchableOpacity>
            </Link>
          )
        }} 
      />
      <FlatList
        data={tasks}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={<EmptyState title="No tasks found" message="Create a task to get started." />}
        renderItem={({ item }: { item: any }) => (
          <TaskCard 
            task={item} 
            onPress={() => router.push(`/(admin)/tasks/${item.id}`)}
          />
        )}
      />
    </View>
  );
}
