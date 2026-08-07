import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getUserSubmissions } from '../../../services/api';
import SubmissionCard from '../../../components/SubmissionCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { Stack } from 'expo-router';

export default function UserSubmissionsList() {
  const { data: submissions, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['userSubmissions'],
    queryFn: () => getUserSubmissions().then(res => res.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-900">
      <Stack.Screen options={{ title: 'My Submissions', headerShown: true }} />
      <FlatList
        data={submissions}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={<EmptyState title="No submissions yet" message="You haven't submitted any tasks." />}
        renderItem={({ item }: { item: any }) => (
          <SubmissionCard 
            submission={item} 
            isAdmin={false}
          />
        )}
      />
    </View>
  );
}
