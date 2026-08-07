import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminAttendanceUsers, saveAttendance } from '../../../services/api';
import { AttendanceStatus } from '../../../types';
import AttendanceRow from '../../../components/AttendanceRow';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Background from '../../../components/Background';


export default function AdminAttendance() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [records, setRecords] = useState<{ userId: string; status: AttendanceStatus }[]>([]);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#ffffff' : '#000000';
  
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminAttendanceUsers', date.toISOString().split('T')[0]],
    queryFn: () => getAdminAttendanceUsers(date.toISOString()).then(res => res.data.data),
  });

  // Initialize records from fetched data or default to PRESENT
  useEffect(() => {
    if (users) {
      setRecords(users.map((u: any) => ({ 
        userId: u.id, 
        status: (u.attendance && u.attendance.length > 0) ? u.attendance[0].status : ('PRESENT' as AttendanceStatus)
      })));
    }
  }, [users]);

  const handleStatusChange = (userId: string, status: AttendanceStatus) => {
    setRecords(prev => prev.map(r => r.userId === userId ? { ...r, status } : r));
  };

  const saveMutation = useMutation({
    mutationFn: () => saveAttendance(date.toISOString(), records),
    onSuccess: () => {
      Alert.alert('Success', 'Attendance saved successfully');
      queryClient.invalidateQueries({ queryKey: ['adminUser'] }); // Invalidate user details
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save attendance');
    }
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Background>
      <Stack.Screen options={{ title: 'Mark Attendance' }} />
      
      <View style={{ paddingTop: 90 }}>
        <View className="p-4 bg-zinc-100 dark:bg-zinc-900 border-b-2 border-black dark:border-white z-10 flex-row items-center justify-between">
          <View className="flex-1">
          <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase mb-1">Date</Text>
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-xl font-black text-zinc-900 dark:text-white mr-2">{date.toDateString()}</Text>
            <MaterialIcons name="edit-calendar" size={24} color={saveMutation.isPending ? "#71717a" : iconColor} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          className={`px-5 py-3 rounded-full flex-row items-center border-2 border-black dark:border-white ${saveMutation.isPending ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-black dark:bg-white'}`}
          onPress={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator size="small" color="#71717a" />
          ) : (
            <MaterialIcons name="save" size={18} color="gray" />
          )}
          <Text className={`font-black uppercase tracking-widest ml-2 text-xs ${saveMutation.isPending ? 'text-zinc-500' : 'text-white dark:text-black'}`}>Save</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'web' ? (
        <View className="px-4 py-2 border-b-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-900">
          <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase mb-1">Select Date</Text>
          <input
            type="date"
            value={date.toISOString().split('T')[0]}
            onChange={(e) => {
              if (e.target.value) setDate(new Date(e.target.value));
            }}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '2px solid ' + (isDark ? '#ffffff' : '#000000'),
              backgroundColor: isDark ? '#000000' : '#ffffff',
              color: isDark ? '#ffffff' : '#000000',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              width: '100%',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </View>
      ) : showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <FlatList
        data={users}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        renderItem={({ item }: { item: any }) => {
          const currentRecord = records.find(r => r.userId === item.id);
          return (
            <AttendanceRow 
              user={item} 
              status={currentRecord?.status || 'PRESENT'}
              onStatusChange={handleStatusChange}
            />
          );
        }}
      />
      </View>
    </Background>
  );
}
