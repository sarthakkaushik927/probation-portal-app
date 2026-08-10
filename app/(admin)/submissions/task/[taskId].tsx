import { useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAdminSubmissions } from '../../../../services/api';
import SubmissionCard from '../../../../components/SubmissionCard';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import EmptyState from '../../../../components/EmptyState';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Background from '../../../../components/Background';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

export default function TaskSubmissionsList() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  
  const { data: allSubmissions, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminSubmissions'],
    queryFn: () => getAdminSubmissions().then(res => res.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const taskSubmissions = allSubmissions?.filter((s: any) => s.task?.id === taskId) || [];
  const taskTitle = taskSubmissions.length > 0 ? taskSubmissions[0].task?.title : 'Task Submissions';

  const filteredSubmissions = useMemo(() => {
    if (filter === 'ALL') return taskSubmissions;
    return taskSubmissions.filter((s: any) => s.status === filter);
  }, [taskSubmissions, filter]);

  const FilterButton = ({ title, status }: { title: string, status: typeof filter }) => (
    <TouchableOpacity
      onPress={() => setFilter(status)}
      className={`px-4 py-2 rounded-full border-2 mr-2 ${
        filter === status 
          ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white' 
          : 'bg-white/50 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700'
      }`}
    >
      <Text className={`font-bold font-mono text-xs uppercase tracking-widest ${
        filter === status 
          ? 'text-white dark:text-zinc-900' 
          : 'text-zinc-500 dark:text-zinc-400'
      }`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Background>
      <Stack.Screen options={{ title: taskTitle, headerShown: true }} />
      <View className="pt-[130px] pb-2 px-4 flex-col">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <FilterButton title="All" status="ALL" />
          <FilterButton title="Pending" status="PENDING" />
          <FilterButton title="Approved" status="APPROVED" />
          <FilterButton title="Rejected" status="REJECTED" />
        </ScrollView>
      </View>
      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={<EmptyState title="No submissions found" message="There are no submissions matching this filter." />}
        renderItem={({ item }: { item: any }) => (
          <SubmissionCard 
            submission={item} 
            isAdmin={true}
            onPress={() => router.push(`/(admin)/submissions/${item.id}` as any)}
          />
        )}
      />
    </Background>
  );
}
