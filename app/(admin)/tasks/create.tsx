import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask } from '../../../services/api';
import { DOMAINS } from '../../../constants/domains';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('COMMON');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => createTask({ title, description, domain, deadline: deadline.toISOString() }),
    onSuccess: () => {
      Alert.alert('Success', 'Task created successfully');
      queryClient.invalidateQueries({ queryKey: ['adminTasks'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create task');
    }
  });

  const handleCreate = () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    createMutation.mutate();
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900 p-4">
      <Stack.Screen options={{ title: 'Create Task' }} />
      
      <View className="mb-4">
        <Text className="text-gray-700 dark:text-slate-300 font-semibold mb-2 ml-1">Title</Text>
        <TextInput
          className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
          placeholder="Task title"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 dark:text-slate-300 font-semibold mb-2 ml-1">Description</Text>
        <TextInput
          className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white min-h-[100px]"
          placeholder="Detailed task description..."
          placeholderTextColor="#9ca3af"
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 dark:text-slate-300 font-semibold mb-2 ml-1">Domain</Text>
        <View className="flex-row flex-wrap gap-2">
          {DOMAINS.map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDomain(d)}
              className={`px-3 py-2 rounded-lg border ${
                domain === d 
                  ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500' 
                  : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700'
              }`}
            >
              <Text className={`${domain === d ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-slate-400'}`}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-gray-700 dark:text-slate-300 font-semibold mb-2 ml-1">Deadline</Text>
        <TouchableOpacity 
          className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700"
          onPress={() => setShowDatePicker(true)}
        >
          <Text className="text-gray-900 dark:text-white">{deadline.toLocaleDateString()} {deadline.toLocaleTimeString()}</Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={deadline}
            mode="datetime"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDeadline(selectedDate);
            }}
          />
        )}
      </View>

      <TouchableOpacity 
        className={`w-full p-4 rounded-xl items-center mb-6 shadow-sm ${createMutation.isPending ? 'bg-blue-400' : 'bg-blue-600'}`}
        onPress={handleCreate}
        disabled={createMutation.isPending}
      >
        <Text className="text-white text-lg font-bold">
          {createMutation.isPending ? 'Creating...' : 'Create Task'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
