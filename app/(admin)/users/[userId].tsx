import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminUser, updateUserDomain, exportUserDataCSV, deleteUser } from '../../../services/api';
import { DOMAINS } from '../../../constants/domains';
import LoadingSpinner from '../../../components/LoadingSpinner';
import StatCard from '../../../components/StatCard';
import GlassCard from '../../../components/GlassCard';
import Background from '../../../components/Background';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';


export default function UserDetail() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#fff' : '#000';
  const [selectedDomain, setSelectedDomain] = useState<string>('UNASSIGNED');

  const { data: user, isLoading } = useQuery({
    queryKey: ['adminUser', userId],
    queryFn: () => getAdminUser(userId).then(res => res.data.data),
  });

  const userData = user?.user;

  useEffect(() => {
    if (userData) {
      setSelectedDomain(userData.domain || 'UNASSIGNED');
    }
  }, [userData]);

  const updateDomainMutation = useMutation({
    mutationFn: (domain: string) => updateUserDomain(userId, domain === 'UNASSIGNED' ? null : domain),
    onSuccess: () => {
      Alert.alert('Success', 'Domain updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminUser', userId] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update domain');
    }
  });

  if (isLoading || !user) return <LoadingSpinner />;

  // Calculate attendance stats
  const totalDays = user.attendance?.length || 0;
  const presentDays = user.attendance?.filter((a: any) => a.status === 'PRESENT').length || 0;
  const absentDays = user.attendance?.filter((a: any) => a.status === 'ABSENT').length || 0;
  const leaveDays = user.attendance?.filter((a: any) => a.status === 'LEAVE').length || 0;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <ScrollView className="flex-1 bg-white dark:bg-zinc-950" contentContainerStyle={{ paddingTop: 130, paddingBottom: 140 }}>
      <Stack.Screen options={{ title: userData?.name || 'User Detail' }} />
      
      <View className="p-4">
        {/* User Info */}
        <GlassCard className="items-center mb-6 py-6 border-2">
          <View className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white rounded-full items-center justify-center mb-3">
            <Text className="text-zinc-900 dark:text-white text-3xl font-bold font-sans">{userData?.name?.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{userData?.name}</Text>
          <Text className="text-zinc-600 dark:text-zinc-400 mb-3">{userData?.email}</Text>
          <View className="bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white px-3 py-1 rounded-md">
            <Text className="text-zinc-600 dark:text-zinc-400 font-bold font-mono text-xs">{userData?.role}</Text>
          </View>
        </GlassCard>

        {/* Domain Assignment */}
        <Text className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3 ml-1">Domain Assignment</Text>
        <GlassCard className="mb-6 p-4">
          <View className="flex-row flex-wrap gap-2 mb-4">
            {['UNASSIGNED', ...DOMAINS].map((domain) => (
              <TouchableOpacity
                key={domain}
                onPress={() => setSelectedDomain(domain)}
                className={`px-4 py-2 rounded-full border ${
                  selectedDomain === domain 
                    ? 'bg-zinc-100 dark:bg-zinc-900 border-white' 
                    : 'bg-white dark:bg-zinc-950 border-black dark:border-white'
                }`}
              >
                <Text className={`${selectedDomain === domain ? 'text-zinc-900 dark:text-white font-bold' : 'text-zinc-500'} font-mono text-xs uppercase tracking-wider`}>
                  {domain}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity 
            className="w-full bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white p-4 rounded-xl items-center"
            onPress={() => updateDomainMutation.mutate(selectedDomain)}
            disabled={updateDomainMutation.isPending || selectedDomain === (userData?.domain || 'UNASSIGNED')}
          >
            <Text className="text-zinc-900 dark:text-white font-bold font-mono uppercase tracking-widest">Save Domain</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Attendance Stats */}
        <Text className="text-lg font-bold text-zinc-900 dark:text-white font-sans mb-3 ml-1">Attendance Stats</Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          <StatCard title="Rate" value={`${attendanceRate}%`} colorClass="bg-zinc-100 dark:bg-zinc-900" />
          <StatCard title="Present" value={presentDays} colorClass="bg-zinc-100 dark:bg-zinc-900" />
          <StatCard title="Absent" value={absentDays} colorClass="bg-zinc-100 dark:bg-zinc-900" />
          <StatCard title="Leave" value={leaveDays} colorClass="bg-zinc-100 dark:bg-zinc-900" />
        </View>

        {/* Attendance History */}
        <Text className="text-lg font-bold text-zinc-900 dark:text-white font-sans mb-3 ml-1">Attendance History</Text>
        {user.attendance && user.attendance.length > 0 ? (
          <GlassCard className="mb-6 p-0">
            {user.attendance.map((record: any, index: number) => (
              <View 
                key={record.id} 
                className={`flex-row justify-between p-4 ${index !== user.attendance.length - 1 ? 'border-b border-black dark:border-white' : ''}`}
              >
                <Text className="text-zinc-900 dark:text-white font-mono text-sm">{new Date(record.date).toLocaleDateString()}</Text>
                <Text className={`font-bold font-mono text-xs uppercase tracking-widest ${
                  record.status === 'PRESENT' ? 'text-zinc-900 dark:text-white' :
                  record.status === 'ABSENT' ? 'text-zinc-500' : 'text-zinc-600 dark:text-zinc-400'
                }`}>
                  {record.status}
                </Text>
              </View>
            ))}
          </GlassCard>
        ) : (
          <Text className="text-zinc-500 italic ml-1 mb-6">No attendance records found.</Text>
        )}

        {/* Actions */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            className="flex-1 bg-black dark:bg-white p-4 rounded-xl flex-row items-center justify-center"
            onPress={async () => {
              try {
                const res = await exportUserDataCSV(userId);
                const fileUri = FileSystem.documentDirectory + `user_${userId}.csv`;
                await FileSystem.writeAsStringAsync(fileUri, res.data);
                await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
              } catch { Alert.alert('Error', 'Failed to export user data'); }
            }}
          >
            <MaterialIcons name="file-download" size={18} color={isDark ? '#000' : '#fff'} />
            <Text className={`ml-2 font-bold text-xs uppercase tracking-widest ${isDark ? 'text-black' : 'text-white'}`}>Export CSV</Text>
          </TouchableOpacity>
          {userData?.role !== 'ADMIN' && (
            <TouchableOpacity
              className="flex-1 bg-red-500 p-4 rounded-xl flex-row items-center justify-center"
              onPress={() => {
                Alert.alert('Delete User', `Delete ${userData?.name || 'this user'}? This cannot be undone.`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                      await deleteUser(userId);
                      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
                      Alert.alert('Success', 'User deleted');
                      router.back();
                    } catch { Alert.alert('Error', 'Failed to delete user'); }
                  }}
                ]);
              }}
            >
              <MaterialIcons name="delete" size={18} color="#fff" />
              <Text className="ml-2 font-bold text-xs uppercase tracking-widest text-white">Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
