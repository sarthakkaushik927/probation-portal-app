import { useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminSubmissions, approveSubmission, rejectSubmission } from '../../../services/api';
import SubmissionCard from '../../../components/SubmissionCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { Stack, useRouter } from 'expo-router';
import Background from '../../../components/Background';
import { MaterialIcons } from '@expo/vector-icons';
import GlassCard from '../../../components/GlassCard';
import { useColorScheme } from 'nativewind';

const TaskCard = ({ item }: { item: any }) => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity 
      className="mb-4"
      onPress={() => router.push(`/(admin)/submissions/task/${item.task.id}` as any)}
      activeOpacity={0.7}
    >
      <GlassCard className="p-1">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center mr-3 border-2 border-black dark:border-white">
            <MaterialIcons name="assignment" size={18} color={isDark ? '#ffffff' : '#000000'} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-black text-zinc-900 dark:text-white mb-0.5" numberOfLines={1}>{item.task.title}</Text>
            <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest">{item.submissions.length} Submissions</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#71717a" />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};


export default function AdminSubmissionsList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const { data: submissions, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminSubmissions'],
    queryFn: () => getAdminSubmissions().then(res => res.data.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to approve');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to reject');
    }
  });

  if (isLoading) return <LoadingSpinner />;

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    if (filter === 'ALL') return submissions;
    return submissions.filter((s: any) => s.status === filter);
  }, [submissions, filter]);

  const groupedSubmissions = useMemo(() => {
    if (!filteredSubmissions) return [];
    
    const groups: Record<string, { task: any; submissions: any[] }> = {};
    
    filteredSubmissions.forEach((sub: any) => {
      const taskId = sub.task?.id;
      if (!taskId) return;
      if (!groups[taskId]) {
        groups[taskId] = { task: sub.task, submissions: [] };
      }
      groups[taskId].submissions.push(sub);
    });
    
    return Object.values(groups);
  }, [filteredSubmissions]);

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
      <Stack.Screen options={{ title: 'All Submissions', headerShown: true }} />
      <View className="pt-[130px] pb-2 px-4 flex-row">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton title="All" status="ALL" />
          <FilterButton title="Pending" status="PENDING" />
          <FilterButton title="Approved" status="APPROVED" />
          <FilterButton title="Rejected" status="REJECTED" />
        </ScrollView>
      </View>
      <FlatList
        data={groupedSubmissions}
        keyExtractor={(item: any) => item.task.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={<EmptyState title="No submissions found" message="No one has submitted tasks yet." />}
        renderItem={({ item }: { item: any }) => (
          <TaskCard item={item} />
        )}
      />
    </Background>
  );
}
