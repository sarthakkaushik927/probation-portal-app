import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminTasks, updateTask } from '../../../services/api';
import { DOMAINS } from '../../../constants/domains';
import DateTimePicker from '@react-native-community/datetimepicker';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Background from '../../../components/Background';
import { useTabBackHandler } from '../../../hooks/useTabBackHandler';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

export default function EditTask() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('COMMON');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#fff' : '#000';

  useTabBackHandler('/(admin)/tasks');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['adminTasks'],
    queryFn: () => getAdminTasks().then(res => res.data.data),
  });

  useEffect(() => {
    if (tasks) {
      const task = tasks.find((t: any) => t.id === taskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setDomain(task.domain);
        setDeadline(new Date(task.deadline));
      }
    }
  }, [tasks, taskId]);

  const updateMutation = useMutation({
    mutationFn: () => updateTask(taskId, { title, description, domain, deadline: deadline.toISOString() }),
    onSuccess: () => {
      Alert.alert('Success', 'Task updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminTasks'] });
      router.replace('/(admin)/tasks');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update task');
    }
  });

  const handleUpdate = () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    updateMutation.mutate();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Background>
      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 130, paddingBottom: 100 }}
      >
        <Stack.Screen options={{ title: 'Edit Task' }} />
        
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => router.replace('/(admin)/tasks')}
          className="flex-row items-center mb-6 bg-zinc-100 dark:bg-zinc-900 self-start px-3 py-2 rounded-full border border-black dark:border-white"
        >
          <MaterialIcons name="arrow-back" size={18} color={iconColor} />
          <Text className="ml-1.5 font-bold text-xs uppercase tracking-widest text-zinc-900 dark:text-white">Back to Tasks</Text>
        </TouchableOpacity>

        <View className="mb-5">
          <Text className="text-gray-600 dark:text-slate-400 font-bold uppercase text-xs tracking-wider mb-2 ml-1">Title</Text>
          <TextInput
            className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border-[3px] border-black dark:border-white text-zinc-900 dark:text-white font-mono"
            placeholder="Task title"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="mb-5">
          <Text className="text-gray-600 dark:text-slate-400 font-bold uppercase text-xs tracking-wider mb-2 ml-1">Description</Text>
          <TextInput
            className="w-full bg-white dark:bg-zinc-900 p-5 rounded-xl border-[3px] border-black dark:border-white text-zinc-900 dark:text-white font-mono min-h-[120px]"
            placeholder="Detailed task description..."
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-600 dark:text-slate-400 font-bold uppercase text-xs tracking-wider mb-3 ml-1">Domain</Text>
          <View className="flex-row flex-wrap gap-3">
            {DOMAINS.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDomain(d)}
                className={`px-4 py-2.5 rounded-xl border-[3px] border-black dark:border-white ${
                  domain === d 
                    ? 'bg-blue-500' 
                    : 'bg-white dark:bg-zinc-900'
                }`}
              >
                <Text className={`font-mono font-bold text-xs uppercase tracking-wider ${domain === d ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-gray-600 dark:text-slate-400 font-bold uppercase text-xs tracking-wider mb-2 ml-1">Deadline</Text>
          {Platform.OS === 'web' ? (
            <View className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border-[3px] border-black dark:border-white items-center flex-row justify-center">
              {/* @ts-ignore */}
              <input
                type="datetime-local"
                value={new Date(deadline.getTime() - deadline.getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                onChange={(e: any) => {
                  if (e.target.value) {
                    setDeadline(new Date(e.target.value));
                  }
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: isDark ? '#ffffff' : '#000000',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  outline: 'none',
                  fontSize: 16,
                }}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity 
                className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border-[3px] border-black dark:border-white items-center flex-row justify-center"
                onPress={() => {
                  setPickerMode('date');
                  setShowDatePicker(true);
                }}
              >
                <Text className="text-zinc-900 dark:text-white font-mono font-bold uppercase tracking-widest">{deadline.toLocaleDateString()} {deadline.toLocaleTimeString()}</Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={deadline}
                  mode={Platform.OS === 'ios' ? 'datetime' : pickerMode}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') {
                      if (event.type === 'set' && selectedDate) {
                        setDeadline(selectedDate);
                        if (pickerMode === 'date') {
                          setPickerMode('time');
                        } else {
                          setShowDatePicker(false);
                        }
                      } else {
                        setShowDatePicker(false);
                      }
                    } else {
                      setShowDatePicker(false);
                      if (selectedDate) setDeadline(selectedDate);
                    }
                  }}
                />
              )}
            </>
          )}
        </View>

        <TouchableOpacity 
          className={`w-full py-4 px-6 rounded-xl items-center mb-12 border-[3px] border-black dark:border-white ${updateMutation.isPending ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-[#e0e7ff] dark:bg-blue-900'} flex-row justify-center`}
          onPress={handleUpdate}
          disabled={updateMutation.isPending}
        >
          <Text className="text-zinc-900 dark:text-white font-mono text-lg font-bold uppercase tracking-widest mr-2">
            {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
          </Text>
          {!updateMutation.isPending && (
            <View className="bg-white/20 rounded-full p-1">
              <Text className="text-zinc-900 dark:text-white font-black text-xs">→</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </Background>
  );
}
