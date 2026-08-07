import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMe, getUserTasks, getUserSubmissions } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import { BlurView } from 'expo-blur';
import StatCard from '../../components/StatCard';
import Skeleton from '../../components/Skeleton';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import Background from '../../components/Background';
import { StatPieChart } from '../../components/ChartComponents';
import DomainSwatch from '../../components/DomainSwatch';
import GlassCard from '../../components/GlassCard';
import { useColorScheme } from 'nativewind';

export default function UserDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#ffffff' : '#000000';
  
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
      <View className="flex-1 bg-white dark:bg-zinc-950">
        <View className="pt-8 pb-16 px-6 bg-zinc-100 dark:bg-zinc-900 border-b border-black dark:border-white rounded-b-[40px]">
          <Skeleton width="50%" height={36} className="mb-2" />
          <Skeleton width="30%" height={24} className="rounded-full" />
        </View>
        <View className="p-6 -mt-10">
          <Skeleton width="100%" height={100} className="rounded-2xl" />
        </View>
      </View>
    );
  }

  const isRefreshing = isRefetchingMe || isRefetchingTasks || isRefetchingSubs;
  
  const totalTasks = tasks?.length || 0;
  const totalSubmitted = submissions?.length || 0;
  const pendingTasks = totalTasks - totalSubmitted;

  return (
    <Background>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 130 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          {/* Premium Large Header */}
          <View className="border-2 border-black dark:border-white rounded-b-[40px] overflow-hidden -mt-2">
            <BlurView tint={isDark ? 'dark' : 'light'} intensity={80} className="px-5 pt-4 pb-4 flex-row justify-between items-end">
            <View>
              <Text className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mb-1 text-xs">
                Welcome Back
              </Text>
              <Text className="text-[42px] leading-[48px] font-black font-sans text-zinc-900 dark:text-white mb-2 tracking-tighter">
                {me?.name?.split(' ')[0] || 'User'}
              </Text>
              <View className="flex-row items-center mt-2">
                <Text className="text-zinc-900 dark:text-white font-sans font-black mr-3 text-sm uppercase tracking-widest">Team</Text>
                <View className="relative px-4 py-1.5 rounded-full border-2 border-black dark:border-white bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
                  {me?.domain && <DomainSwatch domain={me.domain} />}
                  <Text className="text-zinc-900 dark:text-white text-xs font-black font-mono uppercase tracking-widest relative z-10">
                    {me?.domain || 'UNASSIGNED'}
                  </Text>
                </View>
              </View>
            </View>
            </BlurView>
          </View>

          {/* Icon Grid */}
          <View className="flex-row justify-between mb-8 px-5 mt-8">
            <TouchableOpacity onPress={() => router.push('/(user)/tasks')} className="flex-1 items-center">
              <View className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 rounded-2xl items-center justify-center mb-1 border-2 border-black dark:border-white">
                <MaterialIcons name="assignment" size={26} color={iconColor} />
              </View>
              <Text className="text-xs font-bold font-mono tracking-widest text-zinc-900 dark:text-white uppercase">Tasks</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('/(user)/submissions')} className="flex-1 items-center">
              <View className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 rounded-2xl items-center justify-center mb-1 border-2 border-black dark:border-white">
                <MaterialIcons name="rocket-launch" size={26} color={iconColor} />
              </View>
              <Text className="text-xs font-bold font-mono tracking-widest text-zinc-900 dark:text-white uppercase">Submit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('/(user)/attendance')} className="flex-1 items-center">
              <View className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 rounded-2xl items-center justify-center mb-1 border-2 border-black dark:border-white">
                <MaterialIcons name="event" size={26} color={iconColor} />
              </View>
              <Text className="text-xs font-bold font-mono tracking-widest text-zinc-900 dark:text-white uppercase">Cal</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Stats Section */}
          <View className="px-5 mb-2">
            <Text className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Your Progress</Text>
          </View>
          
          <View className="px-5 mb-8">
            <GlassCard className="p-0">
              <View className="flex-row justify-between items-center p-4 border-b border-black dark:border-white">
                <View className="flex-row items-center">
                  <MaterialIcons name="assignment" size={22} color={iconColor} />
                  <Text className="ml-3 text-base text-zinc-900 dark:text-white font-medium">Total Tasks</Text>
                </View>
                <Text className="text-lg font-bold font-mono text-zinc-500 dark:text-zinc-400">{totalTasks}</Text>
              </View>
              <View className="flex-row justify-between items-center p-4 border-b border-black dark:border-white">
                <View className="flex-row items-center">
                  <MaterialIcons name="check-circle" size={22} color={iconColor} />
                  <Text className="ml-3 text-base text-zinc-900 dark:text-white font-medium">Completed</Text>
                </View>
                <Text className="text-lg font-bold font-mono text-zinc-500 dark:text-zinc-400">{totalSubmitted}</Text>
              </View>
              <View className="flex-row justify-between items-center p-4">
                <View className="flex-row items-center">
                  <MaterialIcons name="pending-actions" size={22} color={iconColor} />
                  <Text className="ml-3 text-base text-zinc-900 dark:text-white font-medium">Pending</Text>
                </View>
                <Text className="text-lg font-bold font-mono text-zinc-500 dark:text-zinc-400">{pendingTasks > 0 ? pendingTasks : 0}</Text>
              </View>
            </GlassCard>
          </View>

          {/* Charts Section */}
          <View className="px-5 mb-2">
            <Text className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Analytics</Text>
          </View>
          <View className="px-5 mb-8">
            <StatPieChart 
              title="Tasks Overview" 
              data={[
                { name: 'Completed', population: totalSubmitted, color: '#10b981', legendFontColor: isDark ? '#fff' : '#000' },
                { name: 'Pending', population: pendingTasks > 0 ? pendingTasks : 0, color: '#f59e0b', legendFontColor: isDark ? '#fff' : '#000' },
              ]} 
            />
          </View>

        </Animated.View>
      </ScrollView>
    </Background>
  );
}
