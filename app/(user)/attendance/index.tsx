import { View, Text, ScrollView, RefreshControl } from 'react-native';
import Background from '../../../components/Background';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getUserAttendance } from '../../../services/api';
import StatCard from '../../../components/StatCard';
import Skeleton from '../../../components/Skeleton';
import GlassCard from '../../../components/GlassCard';
import { Stack } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';

export default function UserAttendance() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['userAttendance'],
    queryFn: () => getUserAttendance().then(res => res.data.data),
  });

  if (isLoading) {
    return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      <Stack.Screen options={{ title: 'Attendance', headerShown: false }} />
      <View className="flex-1 p-4">
        <Skeleton width="100%" height={300} className="rounded-xl mb-6" />
        <Skeleton width="100%" height={80} className="mb-3" />
        <Skeleton width="100%" height={80} className="mb-3" />
      </View>
    </SafeAreaView>
    );
  }

  const attendance = data?.records || [];
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
      selectedColor: record.status === 'PRESENT' ? (isDark ? '#ffffff' : '#09090b') : record.status === 'ABSENT' ? (isDark ? '#71717a' : '#a1a1aa') : (isDark ? '#a1a1aa' : '#d4d4d8')
    };
  });

  if (markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selectedColor: markedDates[selectedDate].selectedColor, 
      selected: true,
    };
  } else {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: isDark ? '#27272a' : '#e4e4e7'
    };
  }

  const selectedRecord = attendance.find((a: any) => a.date.startsWith(selectedDate));

  return (
    <Background>
      <ScrollView 
        className="flex-1"
      contentContainerStyle={{ paddingBottom: 140, paddingTop: 130 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <Stack.Screen options={{ title: 'My Attendance', headerShown: false }} />
      
      <View className="p-4">
        <GlassCard className="mb-6 p-2">
          <Calendar
            key={colorScheme}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: isDark ? '#71717a' : '#52525b',
              selectedDayBackgroundColor: isDark ? '#ffffff' : '#09090b',
              selectedDayTextColor: isDark ? '#09090b' : '#ffffff',
              todayTextColor: isDark ? '#ffffff' : '#09090b',
              dayTextColor: isDark ? '#e4e4e7' : '#27272a',
              textDisabledColor: isDark ? '#3f3f46' : '#a1a1aa',
              monthTextColor: isDark ? '#ffffff' : '#09090b',
              arrowColor: isDark ? '#ffffff' : '#09090b',
              textDayFontFamily: 'sans-serif',
              textMonthFontFamily: 'sans-serif-medium',
              textDayHeaderFontFamily: 'monospace',
              textMonthFontWeight: 'bold',
            }}
          />
        </GlassCard>

        <View className="flex-row justify-between mb-4 px-2">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-white mr-2 border border-black dark:border-white" />
            <Text className="text-zinc-500 dark:text-zinc-400 font-mono font-medium tracking-widest uppercase text-xs">Present</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-zinc-500 mr-2 border border-black dark:border-white" />
            <Text className="text-zinc-500 dark:text-zinc-400 font-mono font-medium tracking-widest uppercase text-xs">Absent</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-zinc-400 mr-2 border border-black dark:border-white" />
            <Text className="text-zinc-500 dark:text-zinc-400 font-mono font-medium tracking-widest uppercase text-xs">Leave</Text>
          </View>
        </View>

        <View className="bg-zinc-50 dark:bg-zinc-900 border-2 border-black dark:border-white rounded-2xl p-4 mb-6 mt-2">
          <Text className="text-lg font-bold font-sans text-zinc-900 dark:text-white mb-2">
            Details for <Text className="font-mono text-zinc-900 dark:text-white">{selectedDate}</Text>
          </Text>
          {selectedRecord ? (
            <View className="flex-row items-center">
              <Text className="text-zinc-500 dark:text-zinc-400 font-sans mr-2">Status:</Text>
              <View className={`px-3 py-1 rounded-full border-2 bg-white dark:bg-zinc-950 ${
                selectedRecord.status === 'PRESENT' ? 'border-solid border-white' :
                selectedRecord.status === 'ABSENT' ? 'border-dashed border-zinc-500' : 'border-dotted border-zinc-600'
              }`}>
                <Text className={`font-bold font-mono tracking-widest text-xs ${
                  selectedRecord.status === 'PRESENT' ? 'text-zinc-900 dark:text-white' :
                  selectedRecord.status === 'ABSENT' ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-300'
                }`}>
                  {selectedRecord.status}
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-zinc-500 dark:text-zinc-400 italic">No attendance record found for this date.</Text>
          )}
        </View>

        <Text className="text-lg font-bold text-zinc-900 dark:text-white font-sans mb-3 ml-1">Summary Stats</Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          <View className="w-[48%]">
            <StatCard title="Rate" value={`${attendanceRate}%`} />
          </View>
          <View className="w-[48%]">
            <StatCard title="Total Days" value={totalDays} />
          </View>
          <View className="w-[48%] mt-4">
            <StatCard title="Present" value={presentDays} />
          </View>
          <View className="w-[48%] mt-4">
            <StatCard title="Absent/Leave" value={absentDays + leaveDays} />
          </View>
        </View>

        {/* Attendance History */}
        <Text className="text-lg font-bold text-zinc-900 dark:text-white font-sans mb-3 ml-1 mt-2">Attendance History</Text>
        {attendance && attendance.length > 0 ? (
          <GlassCard className="mb-6 p-0">
            {attendance.map((record: any, index: number) => (
              <View 
                key={record.id || index} 
                className={`flex-row justify-between p-4 ${index !== attendance.length - 1 ? 'border-b border-black dark:border-white' : ''}`}
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
      </View>
    </ScrollView>
    </Background>
  );
}
