import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getUserTasks } from '../../../services/api';
import TaskCard from '../../../components/TaskCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Background from '../../../components/Background';


export default function UserTasksList() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { data: tasks, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['userTasks'],
    queryFn: () => getUserTasks().then(res => res.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Background>
      <FlatList
        data={tasks}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 140, paddingTop: 90 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={<EmptyState title="No tasks available" message="You're all caught up!" />}
        renderItem={({ item }: { item: any }) => (
          <TaskCard 
            task={item} 
            onPress={() => router.push(`/(user)/tasks/${item.id}` as any)}
          />
        )}
      />
    </Background>
  );
}
