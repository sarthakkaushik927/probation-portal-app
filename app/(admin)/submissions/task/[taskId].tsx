import { useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAdminSubmissions } from '../../../../services/api';
import SubmissionCard from '../../../../components/SubmissionCard';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import EmptyState from '../../../../components/EmptyState';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Background from '../../../../components/Background';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useTabRefresh, shouldUseRefreshControl } from '../../../../hooks/useTabRefresh';

export default function TaskSubmissionsList() {
  const router = useRouter();
  const { taskId, initialFilter } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>((initialFilter as any) || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: allSubmissions, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminSubmissions'],
    queryFn: () => getAdminSubmissions().then(res => res.data.data),
  });

  useTabRefresh('submissions/task/[taskId]', () => refetch());

  if (isLoading) return <LoadingSpinner />;

  const taskSubmissions = allSubmissions?.filter((s: any) => s.task?.id === taskId) || [];
  const taskTitle = taskSubmissions.length > 0 ? taskSubmissions[0].task?.title : 'Task Submissions';

  const filteredSubmissions = useMemo(() => {
    let result = taskSubmissions;
    if (filter !== 'ALL') {
      result = result.filter((s: any) => s.status === filter);
    }
    if (searchQuery.trim() !== '') {
      result = result.filter((s: any) => s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [taskSubmissions, filter, searchQuery]);

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
        <TextInput
          placeholder="Search by user name..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="bg-white/50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700 px-4 py-3 rounded-xl text-zinc-900 dark:text-white font-mono text-sm mb-2"
        />
      </View>
      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        refreshControl={shouldUseRefreshControl() ? <RefreshControl refreshing={isRefetching} onRefresh={refetch} /> : undefined}
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
