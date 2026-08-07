import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminAttendanceUsers, saveAttendance } from '../../../services/api';
import { AttendanceStatus } from '../../../types';
import AttendanceRow from '../../../components/AttendanceRow';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminAttendance() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [records, setRecords] = useState<{ userId: string; status: AttendanceStatus }[]>([]);
  
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminAttendanceUsers'],
    queryFn: () => getAdminAttendanceUsers().then(res => res.data.data),
  });

  // Initialize records to all PRESENT if not set yet
  useEffect(() => {
    if (users && records.length === 0) {
      setRecords(users.map((u: any) => ({ userId: u.id, status: 'PRESENT' as AttendanceStatus })));
    }
  }, [users, records]);

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
    <View className="flex-1 bg-gray-50 dark:bg-slate-900">
      <Stack.Screen options={{ title: 'Mark Attendance' }} />
      
      <View className="p-4 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 z-10 shadow-sm flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Date</Text>
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-lg font-bold text-gray-900 dark:text-white mr-2">{date.toDateString()}</Text>
            <MaterialIcons name="edit-calendar" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          className={`px-4 py-3 rounded-lg flex-row items-center shadow-sm ${saveMutation.isPending ? 'bg-blue-400' : 'bg-blue-600'}`}
          onPress={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          <MaterialIcons name="save" size={18} color="white" />
          <Text className="text-white font-bold ml-2">Save</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
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
        contentContainerStyle={{ padding: 16 }}
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
  );
}
