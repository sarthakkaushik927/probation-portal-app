import { View, Text, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAdminDashboard, getAdminSubmissions, approveSubmission, rejectSubmission, broadcastNotification, exportAttendanceCSV, exportSubmissionsCSV, exportUsersCSV } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import Skeleton from '../../components/Skeleton';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import SubmissionCard from '../../components/SubmissionCard';
import { useRouter, Link } from 'expo-router';
import GlassCard from '../../components/GlassCard';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import Background from '../../components/Background';
import { StatPieChart } from '../../components/ChartComponents';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function AdminDashboard() {
  const user = useAuthStore(state => state.user);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#ffffff' : '#000000';
  
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => getAdminDashboard().then(res => res.data.data),
  });

  const { data: submissions, isLoading: submissionsLoading, refetch: refetchSubmissions, isRefetching: isRefetchingSubs } = useQuery({
    queryKey: ['adminSubmissions'],
    queryFn: () => getAdminSubmissions().then(res => res.data.data),
  });

  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastMessage) {
      Alert.alert('Error', 'Please enter a title and message');
      return;
    }
    try {
      setIsBroadcasting(true);
      await broadcastNotification(broadcastTitle, broadcastMessage);
      Alert.alert('Success', 'Broadcast notification sent to all users!');
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchSubmissions()]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-zinc-950 p-6">
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
    <Background>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 130 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching || isRefetchingSubs} onRefresh={handleRefresh} />}
      >
        <Animated.View entering={FadeInDown.duration(500)}>


          {/* Icon Grid */}
          <View className="flex-row justify-between mb-8 px-5 mt-4">
            <Link href="/(admin)/users" asChild>
              <TouchableOpacity className="items-center">
                <View className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 rounded-2xl items-center justify-center mb-1 border border-black dark:border-white">
                  <MaterialIcons name="people" size={26} color={iconColor} />
                </View>
                <Text className="text-xs font-medium text-zinc-900 dark:text-white">Users</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(admin)/tasks" asChild>
              <TouchableOpacity className="items-center">
                <View className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 rounded-2xl items-center justify-center mb-1 border border-black dark:border-white">
                  <MaterialIcons name="assignment" size={26} color={iconColor} />
                </View>
                <Text className="text-xs font-medium text-zinc-900 dark:text-white">Tasks</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(admin)/submissions" asChild>
              <TouchableOpacity className="items-center">
                <View className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 rounded-2xl items-center justify-center mb-1 border border-black dark:border-white">
                  <MaterialIcons name="rate-review" size={26} color={iconColor} />
                </View>
                <Text className="text-xs font-medium text-zinc-900 dark:text-white">Reviews</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(admin)/attendance" asChild>
              <TouchableOpacity className="items-center">
                <View className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 rounded-2xl items-center justify-center mb-1 border border-black dark:border-white">
                  <MaterialIcons name="calendar-month" size={26} color={iconColor} />
                </View>
                <Text className="text-xs font-medium text-zinc-900 dark:text-white">Attendance</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Quick Stats Section */}
          <View className="px-5 mb-2">
            <Text className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Platform Stats</Text>
          </View>
          
          <View className="px-5 mb-8">
            <GlassCard className="p-0">
              <View className="flex-row justify-between items-center p-4 border-b border-black dark:border-white">
                <View className="flex-row items-center">
                  <MaterialIcons name="people" size={22} color={iconColor} />
                  <Text className="ml-3 text-base text-zinc-900 dark:text-white font-medium">Total Users</Text>
                </View>
                <Text className="text-lg font-bold font-mono text-zinc-500 dark:text-zinc-400">{data?.totalUsers || 0}</Text>
              </View>
              <View className="flex-row justify-between items-center p-4 border-b border-black dark:border-white">
                <View className="flex-row items-center">
                  <MaterialIcons name="assignment" size={22} color={iconColor} />
                  <Text className="ml-3 text-base text-zinc-900 dark:text-white font-medium">Active Tasks</Text>
                </View>
                <Text className="text-lg font-bold font-mono text-zinc-500 dark:text-zinc-400">{data?.activeTasks || 0}</Text>
              </View>
              <View className="flex-row justify-between items-center p-4">
                <View className="flex-row items-center">
                  <MaterialIcons name="rate-review" size={22} color={iconColor} />
                  <Text className="ml-3 text-base text-zinc-900 dark:text-white font-medium">Pending Reviews</Text>
                </View>
                <Text className="text-lg font-bold font-mono text-zinc-500 dark:text-zinc-400">{data?.pendingReviews || 0}</Text>
              </View>
            </GlassCard>
          </View>

          {/* Charts Section */}
          <View className="px-5 mb-2">
            <Text className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Analytics</Text>
          </View>
          <View className="px-5 mb-8">
            <StatPieChart 
              title="Submission Status" 
              data={[
                { name: 'Pending', population: data?.pendingReviews || 0, color: '#f59e0b', legendFontColor: isDark ? '#fff' : '#000' },
                { name: 'Approved', population: 5, color: '#10b981', legendFontColor: isDark ? '#fff' : '#000' },
                { name: 'Rejected', population: 2, color: '#ef4444', legendFontColor: isDark ? '#fff' : '#000' },
              ]} 
            />
          </View>

          <View className="px-5 mb-2 mt-4">
            <Text className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Broadcast Notification</Text>
          </View>

          <View className="px-5 mb-8">
            <GlassCard className="p-4">
              <View className="mb-4">
                <Text className="text-zinc-900 dark:text-white font-bold mb-2">Title</Text>
                <TextInput
                  value={broadcastTitle}
                  onChangeText={setBroadcastTitle}
                  placeholder="E.g., Meeting at 5 PM"
                  placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                  className="bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-medium"
                />
              </View>
              <View className="mb-4">
                <Text className="text-zinc-900 dark:text-white font-bold mb-2">Message</Text>
                <TextInput
                  value={broadcastMessage}
                  onChangeText={setBroadcastMessage}
                  placeholder="Enter your notification message here..."
                  placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                  multiline
                  numberOfLines={3}
                  className="bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-medium"
                  style={{ textAlignVertical: 'top' }}
                />
              </View>
              <TouchableOpacity 
                onPress={handleBroadcast}
                disabled={isBroadcasting}
                className={`py-4 rounded-xl items-center border-2 border-black dark:border-white flex-row justify-center ${isBroadcasting ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-black dark:bg-white'}`}
              >
                <MaterialIcons name="campaign" size={20} color={isBroadcasting ? (isDark ? "#a1a1aa" : "#71717a") : (isDark ? "#000000" : "#ffffff")} className="mr-2" />
                <Text className={`font-black uppercase tracking-widest ml-2 ${isBroadcasting ? 'text-zinc-500 dark:text-zinc-400' : 'text-white dark:text-black'}`}>
                  {isBroadcasting ? 'Sending...' : 'Send to All Users'}
                </Text>
              </TouchableOpacity>
            </GlassCard>
          </View>

          {/* Export Data Section */}
          <View className="px-5 mb-2 mt-4">
            <Text className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Export Data</Text>
          </View>
          <View className="px-5 mb-8">
            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white p-4 rounded-xl items-center"
                onPress={async () => {
                  try {
                    const res = await exportAttendanceCSV();
                    const fileUri = FileSystem.documentDirectory + 'attendance.csv';
                    await FileSystem.writeAsStringAsync(fileUri, res.data);
                    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
                  } catch (e) { Alert.alert('Error', 'Failed to export attendance'); }
                }}
              >
                <MaterialIcons name="event-available" size={28} color={iconColor} />
                <Text className="text-xs font-bold text-zinc-900 dark:text-white mt-2 text-center">Attendance CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white p-4 rounded-xl items-center"
                onPress={async () => {
                  try {
                    const res = await exportSubmissionsCSV();
                    const fileUri = FileSystem.documentDirectory + 'submissions.csv';
                    await FileSystem.writeAsStringAsync(fileUri, res.data);
                    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
                  } catch (e) { Alert.alert('Error', 'Failed to export submissions'); }
                }}
              >
                <MaterialIcons name="description" size={28} color={iconColor} />
                <Text className="text-xs font-bold text-zinc-900 dark:text-white mt-2 text-center">Submissions CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white p-4 rounded-xl items-center"
                onPress={async () => {
                  try {
                    const res = await exportUsersCSV();
                    const fileUri = FileSystem.documentDirectory + 'users.csv';
                    await FileSystem.writeAsStringAsync(fileUri, res.data);
                    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
                  } catch (e) { Alert.alert('Error', 'Failed to export users'); }
                }}
              >
                <MaterialIcons name="people" size={28} color={iconColor} />
                <Text className="text-xs font-bold text-zinc-900 dark:text-white mt-2 text-center">Users CSV</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pending Reviews Section */}
          <View className="flex-row justify-between items-end mb-4 px-5">
            <Text className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Needs Review</Text>
            <Text 
              className="text-sm font-bold text-zinc-900 dark:text-white"
              onPress={() => router.push('/(admin)/submissions')}
            >
              See All
            </Text>
          </View>

          <View className="px-5 mb-8">
            {submissionsLoading ? (
              <Skeleton width="100%" height={100} className="mb-3 rounded-[24px]" />
            ) : (
              submissions?.filter((s: any) => s.status === 'PENDING').slice(0, 3).length > 0 ? (
                submissions?.filter((s: any) => s.status === 'PENDING').slice(0, 3).map((submission: any) => (
                  <View key={submission.id} className="mb-3">
                    <SubmissionCard 
                      submission={submission}
                      onPress={() => router.push(`/(admin)/submissions/${submission.id}`)}
                    />
                  </View>
                ))
              ) : (
                <GlassCard className="items-center justify-center py-8">
                  <View className="border-2 border-black dark:border-white w-16 h-16 rounded-full items-center justify-center mb-4">
                    <MaterialIcons name="done-all" size={32} color={iconColor} />
                  </View>
                  <Text className="text-zinc-900 dark:text-white font-bold text-lg mb-1">All Caught Up!</Text>
                  <Text className="text-zinc-500 dark:text-zinc-400 text-center">No pending submissions to review right now.</Text>
                </GlassCard>
            )
          )}
          </View>

        </Animated.View>
      </ScrollView>
    </Background>
  );
}
