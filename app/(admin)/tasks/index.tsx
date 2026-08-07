import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAdminTasks } from '../../../services/api';
import TaskCard from '../../../components/TaskCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { Stack, useRouter, Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Background from '../../../components/Background';


export default function AdminTasksList() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { data: tasks, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminTasks'],
    queryFn: () => getAdminTasks().then(res => res.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Background>
      <FlatList
        data={tasks}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 140, paddingTop: 90 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={<EmptyState title="No tasks" message="Create a task to get started" />}
        renderItem={({ item }: { item: any }) => (
          <TaskCard 
            task={item} 
            onPress={() => router.push(`/(admin)/tasks/${item.id}` as any)}
          />
        )}
      />
      <Link href="/(admin)/tasks/create" asChild>
        <TouchableOpacity 
          className="absolute bottom-32 right-6 w-14 h-14 bg-black dark:bg-white rounded-full items-center justify-center border-2 border-black dark:border-white shadow-lg"
          style={{ elevation: 5 }}
        >
          <MaterialIcons name="add" size={28} color={isDark ? '#000000' : '#ffffff'} />
        </TouchableOpacity>
      </Link>
    </Background>
  );
}
