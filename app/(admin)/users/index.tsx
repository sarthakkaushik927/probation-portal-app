import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAdminUsers } from '../../../services/api';
import UserCard from '../../../components/UserCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { Stack, useRouter } from 'expo-router';

export default function AdminUsersList() {
  const router = useRouter();
  const { data: users, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => getAdminUsers().then(res => res.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-900">
      <Stack.Screen options={{ title: 'All Users', headerShown: true }} />
      <FlatList
        data={users}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={<EmptyState title="No users found" message="There are no users registered yet." />}
        renderItem={({ item }: { item: any }) => (
          <UserCard 
            user={item} 
            onPress={() => router.push(`/(admin)/users/${item.id}`)}
          />
        )}
      />
    </View>
  );
}
