import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform, ActivityIndicator, TextInput } from 'react-native';
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
import GlassCard from '../../../components/GlassCard';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';


export default function AdminAttendance() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [records, setRecords] = useState<{ userId: string; status: AttendanceStatus }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#ffffff' : '#000000';
  
  const queryClient = useQueryClient();

  const [toastMessage, setToastMessage] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (title: string, message: string, type: 'success' | 'error') => {
    setToastMessage({ title, message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminAttendanceUsers', date.toISOString().split('T')[0]],
    queryFn: () => getAdminAttendanceUsers(date.toISOString()).then(res => res.data.data),
  });

  // Initialize records from fetched data or default to ABSENT
  useEffect(() => {
    if (users) {
      setRecords(users.map((u: any) => ({ 
        userId: u.id, 
        status: (u.attendance && u.attendance.length > 0) ? u.attendance[0].status : ('ABSENT' as AttendanceStatus)
      })));
    }
  }, [users]);

  const filteredUsers = users?.filter((u: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.domain && u.domain.toLowerCase().includes(q))
    );
  });

  const handleStatusChange = (userId: string, status: AttendanceStatus) => {
    setRecords(prev => prev.map(r => r.userId === userId ? { ...r, status } : r));
  };

  const saveMutation = useMutation({
    mutationFn: () => saveAttendance(date.toISOString(), records),
    onSuccess: () => {
      showToast('Saved', 'Attendance saved successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminUser'] });
    },
    onError: (error: any) => {
      showToast('Error', error.response?.data?.error || 'Failed to save attendance', 'error');
    }
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Background>
      <Stack.Screen options={{ title: 'Mark Attendance' }} />

      {/* Toast Notification */}
      {toastMessage && (
        <Animated.View 
          entering={FadeInUp.springify()} 
          exiting={FadeOutUp.duration(300)}
          className="absolute top-32 left-5 right-5 z-[999]"
          style={{ elevation: 99 }}
        >
          <GlassCard className={`flex-row items-center p-4 border-2 shadow-sm ${toastMessage.type === 'success' ? 'border-green-500' : 'border-red-500'}`} intensity={90}>
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 border-2 ${toastMessage.type === 'success' ? 'border-green-500 bg-green-500/20' : 'border-red-500 bg-red-500/20'}`}>
              <MaterialIcons name={toastMessage.type === 'success' ? 'check' : 'error-outline'} size={24} color={toastMessage.type === 'success' ? '#10b981' : '#ef4444'} />
            </View>
            <View className="flex-1">
              <Text className="text-zinc-900 dark:text-white font-bold font-sans text-base">{toastMessage.title}</Text>
              <Text className="text-zinc-500 dark:text-zinc-400 font-sans text-sm">{toastMessage.message}</Text>
            </View>
          </GlassCard>
        </Animated.View>
      )}
      
      <View style={{ paddingTop: 130 }}>
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

      {/* Search Bar */}
      <View className="px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border-b-2 border-black dark:border-white">
        <View className="flex-row items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2">
          <MaterialIcons name="search" size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
          <TextInput
            className="flex-1 ml-2 text-zinc-900 dark:text-white text-sm"
            placeholder="Search by name, email, domain..."
            placeholderTextColor="#a1a1aa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
            </TouchableOpacity>
          )}
        </View>
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
        data={filteredUsers}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        renderItem={({ item }: { item: any }) => {
          const currentRecord = records.find(r => r.userId === item.id);
          return (
            <AttendanceRow 
              user={item} 
              status={currentRecord?.status || 'ABSENT'}
              onStatusChange={handleStatusChange}
            />
          );
        }}
      />
      </View>
    </Background>
  );
}
