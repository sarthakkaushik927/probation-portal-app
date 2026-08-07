import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getMe, getUserTasks, getUserSubmissions } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import StatCard from '../../components/StatCard';
import Skeleton from '../../components/Skeleton';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDomainColor } from '../../constants/domains';
import { MaterialIcons } from '@expo/vector-icons';

export default function UserDashboard() {
  const { user } = useAuthStore();
  
  const { data: me, isLoading: loadingMe, refetch: refetchMe, isRefetching: isRefetchingMe } = useQuery({
    queryKey: ['me'],
    queryFn: () => getMe().then(res => res.data.data),
  });

  const { data: tasks, isLoading: loadingTasks, refetch: refetchTasks, isRefetching: isRefetchingTasks } = useQuery({
    queryKey: ['userTasks'],
    queryFn: () => getUserTasks().then(res => res.data.data),
  });

  const { data: submissions, isLoading: loadingSubs, refetch: refetchSubs, isRefetching: isRefetchingSubs } = useQuery({
    queryKey: ['userSubmissions'],
    queryFn: () => getUserSubmissions().then(res => res.data.data),
  });

  const handleRefresh = () => {
    refetchMe();
    refetchTasks();
    refetchSubs();
  };

  if (loadingMe || loadingTasks || loadingSubs) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
        <View className="pt-12 pb-16 px-6 bg-blue-200/50 dark:bg-slate-800 rounded-b-[40px]">
          <Skeleton width="50%" height={36} className="mb-2" />
          <Skeleton width="30%" height={24} className="rounded-full" />
        </View>
        <View className="p-6 -mt-10">
          <Skeleton width="100%" height={100} className="rounded-2xl" />
        </View>
      </SafeAreaView>
    );
  }

  const isRefreshing = isRefetchingMe || isRefetchingTasks || isRefetchingSubs;
  const domainColorClass = getDomainColor(me?.domain || null);
  
  const totalTasks = tasks?.length || 0;
  const totalSubmitted = submissions?.length || 0;
  const pendingTasks = totalTasks - totalSubmitted;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <View className={`${domainColorClass} pt-12 pb-16 px-6 rounded-b-[40px] shadow-sm`}>
        <Text className="text-3xl font-bold text-white mb-2 shadow-sm">
          Hello, {me?.name?.split(' ')[0] || 'User'}
        </Text>
        <View className="flex-row items-center">
          <View className="bg-white/20 px-3 py-1 rounded-full">
            <Text className="text-white font-bold">{me?.domain || 'UNASSIGNED'}</Text>
          </View>
        </View>
      </View>

      <View className="p-6 -mt-10">
        <View className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 flex-row justify-around items-center">
          <View className="items-center">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">{totalTasks}</Text>
            <Text className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Total Tasks</Text>
          </View>
          <View className="w-px h-12 bg-gray-200 dark:bg-slate-700" />
          <View className="items-center">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">{totalSubmitted}</Text>
            <Text className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Submitted</Text>
          </View>
          <View className="w-px h-12 bg-gray-200 dark:bg-slate-700" />
          <View className="items-center">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">{pendingTasks > 0 ? pendingTasks : 0}</Text>
            <Text className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Pending</Text>
          </View>
        </View>
      </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
