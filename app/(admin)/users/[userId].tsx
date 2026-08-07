import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminUser, updateUserDomain } from '../../../services/api';
import { DOMAINS } from '../../../constants/domains';
import LoadingSpinner from '../../../components/LoadingSpinner';
import StatCard from '../../../components/StatCard';
import { Picker } from '@react-native-picker/picker'; // We need to install this or build a custom one. Let's use a custom UI since we don't have it listed in prompt's deps

export default function UserDetail() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const [selectedDomain, setSelectedDomain] = useState<string>('UNASSIGNED');

  const { data: user, isLoading } = useQuery({
    queryKey: ['adminUser', userId],
    queryFn: () => getAdminUser(userId).then(res => res.data.data),
  });

  useEffect(() => {
    if (user) {
      setSelectedDomain(user.domain || 'UNASSIGNED');
    }
  }, [user]);

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
    <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <Stack.Screen options={{ title: user.name || 'User Detail' }} />
      
      <View className="p-4">
        {/* User Info */}
        <View className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 items-center">
          <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-3">
            <Text className="text-blue-600 text-3xl font-bold">{user.name?.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</Text>
          <Text className="text-gray-500 dark:text-slate-400 mb-3">{user.email}</Text>
          <View className="bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-md">
            <Text className="text-gray-700 dark:text-slate-300 font-bold text-xs">{user.role}</Text>
          </View>
        </View>

        {/* Domain Assignment */}
        <View className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Assign Domain</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {['UNASSIGNED', ...DOMAINS].map((domain) => (
              <TouchableOpacity
                key={domain}
                onPress={() => setSelectedDomain(domain)}
                className={`px-3 py-2 rounded-lg border ${
                  selectedDomain === domain 
                    ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500' 
                    : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600'
                }`}
              >
                <Text className={`${selectedDomain === domain ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-slate-400'}`}>
                  {domain}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity 
            className="w-full bg-blue-600 p-4 rounded-xl items-center"
            onPress={() => updateDomainMutation.mutate(selectedDomain)}
            disabled={updateDomainMutation.isPending || selectedDomain === (user.domain || 'UNASSIGNED')}
          >
            <Text className="text-white font-bold">Save Domain</Text>
          </TouchableOpacity>
        </View>

        {/* Attendance Stats */}
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 ml-1">Attendance Stats</Text>
        <View className="flex-col mb-6">
          <StatCard title="Rate" value={`${attendanceRate}%`} colorClass="bg-blue-500" />
          <StatCard title="Present" value={presentDays} colorClass="bg-green-500" />
          <StatCard title="Absent" value={absentDays} colorClass="bg-red-500" />
          <StatCard title="Leave" value={leaveDays} colorClass="bg-yellow-500" />
        </View>

        {/* Attendance History */}
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 ml-1">Attendance History</Text>
        {user.attendance && user.attendance.length > 0 ? (
          <View className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mb-6">
            {user.attendance.map((record: any, index: number) => (
              <View 
                key={record.id} 
                className={`flex-row justify-between p-4 ${index !== user.attendance.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''}`}
              >
                <Text className="text-gray-700 dark:text-slate-300">{new Date(record.date).toLocaleDateString()}</Text>
                <Text className={`font-bold ${
                  record.status === 'PRESENT' ? 'text-green-600' :
                  record.status === 'ABSENT' ? 'text-red-500' : 'text-yellow-600'
                }`}>
                  {record.status}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-gray-500 italic ml-1 mb-6">No attendance records found.</Text>
        )}
      </View>
    </ScrollView>
  );
}
