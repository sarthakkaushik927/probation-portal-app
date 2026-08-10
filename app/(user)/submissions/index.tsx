import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getUserSubmissions } from '../../../services/api';
import SubmissionCard from '../../../components/SubmissionCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { Stack, useRouter } from 'expo-router';
import Background from '../../../components/Background';


export default function UserSubmissionsList() {
  const router = useRouter();
  const { data: submissions, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['userSubmissions'],
    queryFn: () => getUserSubmissions().then(res => res.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Background>
      <Stack.Screen options={{ title: 'My Submissions', headerShown: false }} />
      <FlatList
        data={submissions}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 140, paddingTop: 130 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={<EmptyState title="No submissions yet" message="You haven't submitted any tasks." />}
        renderItem={({ item }: { item: any }) => (
          <SubmissionCard 
            submission={item} 
            isAdmin={false}
            onPress={() => router.push(`/(user)/tasks/${item.taskId}` as any)}
          />
        )}
      />
    </Background>
  );
}
