import { useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminSubmissions, approveSubmission, rejectSubmission } from '../../../services/api';
import SubmissionCard from '../../../components/SubmissionCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { Stack, useRouter } from 'expo-router';
import Background from '../../../components/Background';


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
      <View className="pt-[110px] pb-2 px-4 flex-row">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton title="All" status="ALL" />
          <FilterButton title="Pending" status="PENDING" />
          <FilterButton title="Approved" status="APPROVED" />
          <FilterButton title="Rejected" status="REJECTED" />
        </ScrollView>
      </View>
      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 140, paddingTop: 90 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={<EmptyState title="No submissions found" message="No one has submitted tasks yet." />}
        renderItem={({ item }: { item: any }) => (
          <SubmissionCard 
            submission={item} 
            isAdmin={true}
            onApprove={() => {
              Alert.alert('Confirm Approve', 'Are you sure you want to approve this submission?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Approve', style: 'default', onPress: () => approveMutation.mutate(item.id) }
              ]);
            }}
            onReject={() => {
              Alert.alert('Confirm Reject', 'Are you sure you want to reject this submission?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reject', style: 'destructive', onPress: () => rejectMutation.mutate(item.id) }
              ]);
            }}
            onPress={() => router.push(`/(admin)/submissions/${item.id}`)}
          />
        )}
      />
    </Background>
  );
}
