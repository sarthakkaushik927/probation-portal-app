import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAdminDashboard } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import StatCard from '../../components/StatCard';
import Skeleton from '../../components/Skeleton';
import { MotiView } from 'moti';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const user = useAuthStore(state => state.user);
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => getAdminDashboard().then(res => res.data.data),
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 p-6">
        <Skeleton width="60%" height={36} className="mb-2 mt-4" />
        <Skeleton width="80%" height={20} className="mb-8" />
        <Skeleton width="40%" height={24} className="mb-4" />
        <View className="flex-col">
          <Skeleton width="100%" height={100} className="mb-3 rounded-xl" />
          <Skeleton width="100%" height={100} className="mb-3 rounded-xl" />
          <Skeleton width="100%" height={100} className="mb-3 rounded-xl" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 dark:bg-slate-900"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hello, {user?.name?.split(' ')[0] || 'Admin'} 👋
        </Text>
        <Text className="text-gray-500 dark:text-slate-400 mb-8">Here is what's happening today.</Text>

        <Text className="text-lg font-bold text-gray-800 dark:text-slate-200 mb-4">Overview</Text>
        
        <MotiView 
          className="flex-col"
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <StatCard 
            title="Total Users" 
            value={data?.totalUsers || 0} 
            icon={<MaterialIcons name="people" size={24} color="#3b82f6" />}
            colorClass="bg-blue-500"
          />
          <StatCard 
            title="Active Tasks" 
            value={data?.activeTasks || 0} 
            icon={<MaterialIcons name="assignment" size={24} color="#10b981" />}
            colorClass="bg-green-500"
          />
          <StatCard 
            title="Pending Reviews" 
            value={data?.pendingReviews || 0} 
            icon={<MaterialIcons name="rate-review" size={24} color="#f59e0b" />}
            colorClass="bg-yellow-500"
          />
        </MotiView>
      </View>
    </ScrollView>
  );
}
