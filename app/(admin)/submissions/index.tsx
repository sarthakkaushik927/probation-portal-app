import { View, Text, FlatList, RefreshControl, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminSubmissions, approveSubmission, rejectSubmission } from '../../../services/api';
import SubmissionCard from '../../../components/SubmissionCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { Stack, useRouter } from 'expo-router';

export default function AdminSubmissionsList() {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-900">
      <Stack.Screen options={{ title: 'All Submissions', headerShown: true }} />
      <FlatList
        data={submissions}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16 }}
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
    </View>
  );
}
