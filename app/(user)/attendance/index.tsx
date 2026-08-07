import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getUserAttendance } from '../../../services/api';
import StatCard from '../../../components/StatCard';
import Skeleton from '../../../components/Skeleton';
import { Stack } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { useColorScheme } from 'nativewind';

export default function UserAttendance() {
  const { colorScheme } = useColorScheme();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['userAttendance'],
    queryFn: () => getUserAttendance().then(res => res.data.data),
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-slate-900 p-4">
        <Stack.Screen options={{ title: 'My Attendance', headerShown: true }} />
        <Skeleton width="100%" height={300} className="rounded-xl mb-6" />
        <Skeleton width="100%" height={80} className="mb-3" />
        <Skeleton width="100%" height={80} className="mb-3" />
      </View>
    );
  }

  const attendance = data?.attendance || [];
  const totalDays = attendance.length;
  const presentDays = attendance.filter((a: any) => a.status === 'PRESENT').length;
  const absentDays = attendance.filter((a: any) => a.status === 'ABSENT').length;
  const leaveDays = attendance.filter((a: any) => a.status === 'LEAVE').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const markedDates: any = {};
  attendance.forEach((record: any) => {
    const dateStr = record.date.split('T')[0];
    markedDates[dateStr] = {
      selected: true,
      selectedColor: record.status === 'PRESENT' ? '#16a34a' : record.status === 'ABSENT' ? '#ef4444' : '#eab308'
    };
  });

  const isDark = colorScheme === 'dark';

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 dark:bg-slate-900"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <Stack.Screen options={{ title: 'My Attendance', headerShown: true }} />
      
      <View className="p-4">
        <View className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mb-6 p-2">
          <Calendar
            markedDates={markedDates}
            theme={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              calendarBackground: isDark ? '#1e293b' : '#ffffff',
              textSectionTitleColor: isDark ? '#94a3b8' : '#b6c1cd',
              selectedDayBackgroundColor: '#3b82f6',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#3b82f6',
              dayTextColor: isDark ? '#f8fafc' : '#2d4150',
              textDisabledColor: isDark ? '#475569' : '#d9e1e8',
              dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              arrowColor: '#3b82f6',
              monthTextColor: isDark ? '#f8fafc' : '#1f2937',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
            }}
          />
        </View>

        <View className="flex-row justify-between mb-4 px-2">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-green-600 mr-2" />
            <Text className="text-gray-600 dark:text-slate-300 font-medium">Present</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
            <Text className="text-gray-600 dark:text-slate-300 font-medium">Absent</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
            <Text className="text-gray-600 dark:text-slate-300 font-medium">Leave</Text>
          </View>
        </View>

        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 ml-1 mt-4">Summary Stats</Text>
        <View className="flex-col mb-6">
          <StatCard title="Rate" value={`${attendanceRate}%`} colorClass="bg-blue-500" />
          <StatCard title="Total Days" value={totalDays} colorClass="bg-gray-500" />
          <StatCard title="Present" value={presentDays} colorClass="bg-green-500" />
          <StatCard title="Absent/Leave" value={absentDays + leaveDays} colorClass="bg-red-500" />
        </View>
      </View>
    </ScrollView>
  );
}
