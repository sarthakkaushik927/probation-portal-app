import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserTask, createSubmission } from '../../../services/api';
import { getDomainColor } from '../../../constants/domains';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function UserTaskDetail() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [githubLink, setGithubLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [remarks, setRemarks] = useState('');
  
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery({
    queryKey: ['userTask', taskId],
    queryFn: () => getUserTask(taskId).then(res => res.data.data),
  });

  const submitMutation = useMutation({
    mutationFn: () => createSubmission({ taskId, githubLink, demoLink, remarks }),
    onSuccess: () => {
      Alert.alert('Success', 'Task submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['userTask', taskId] });
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['userTasks'] }); // to update dashboard count
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit task');
    }
  });

  const handleSubmit = () => {
    if (!githubLink || !demoLink) {
      Alert.alert('Error', 'Please provide both GitHub and Demo links');
      return;
    }
    submitMutation.mutate();
  };

  if (isLoading || !result) return <LoadingSpinner />;

  const { task, submission } = result;
  const domainColorClass = getDomainColor(task.domain);
  const formattedDate = new Date(task.deadline).toLocaleDateString();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-slate-900"
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Stack.Screen options={{ title: 'Task Details' }} />
        
        {/* Task Info */}
        <View className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6">
          <View className="flex-row justify-between items-start mb-3">
            <View className={`px-2 py-1 rounded-md ${domainColorClass}`}>
              <Text className="text-white text-xs font-bold">{task.domain}</Text>
            </View>
            <Text className="text-gray-500 dark:text-slate-400 text-xs font-medium">Due: {formattedDate}</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</Text>
          <Text className="text-gray-700 dark:text-slate-300 text-base leading-relaxed">{task.description}</Text>
        </View>

        {/* Submission Section */}
        {submission ? (
          <View className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Submission</Text>
            
            <View className="mb-4">
              <Text className="text-gray-500 font-bold uppercase text-xs mb-1">Status</Text>
              <View className={`self-start px-3 py-1 rounded border ${
                submission.status === 'APPROVED' ? 'bg-green-100 border-green-200' :
                submission.status === 'REJECTED' ? 'bg-red-100 border-red-200' :
                'bg-yellow-100 border-yellow-200'
              }`}>
                <Text className={`font-bold ${
                  submission.status === 'APPROVED' ? 'text-green-800' :
                  submission.status === 'REJECTED' ? 'text-red-800' :
                  'text-yellow-800'
                }`}>{submission.status}</Text>
              </View>
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-500 dark:text-slate-400 font-bold uppercase text-xs mb-1">GitHub Link</Text>
              <Text className="text-blue-600 dark:text-blue-400 font-medium">{submission.githubLink}</Text>
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-500 dark:text-slate-400 font-bold uppercase text-xs mb-1">Demo Link</Text>
              <Text className="text-blue-600 dark:text-blue-400 font-medium">{submission.demoLink}</Text>
            </View>
            
            {submission.remarks && (
              <View>
                <Text className="text-gray-500 dark:text-slate-400 font-bold uppercase text-xs mb-1">Remarks</Text>
                <Text className="text-gray-700 dark:text-slate-300 italic">"{submission.remarks}"</Text>
              </View>
            )}
          </View>
        ) : (
          <View className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Submit Task</Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 dark:text-slate-300 font-semibold mb-2 ml-1">GitHub Repository Link <Text className="text-red-500">*</Text></Text>
              <TextInput
                className="w-full bg-gray-50 dark:bg-slate-700 p-4 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white"
                placeholder="https://github.com/..."
                placeholderTextColor="#9ca3af"
                keyboardType="url"
                autoCapitalize="none"
                value={githubLink}
                onChangeText={setGithubLink}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 dark:text-slate-300 font-semibold mb-2 ml-1">Live Demo Link <Text className="text-red-500">*</Text></Text>
              <TextInput
                className="w-full bg-gray-50 dark:bg-slate-700 p-4 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white"
                placeholder="https://your-demo-url.com"
                placeholderTextColor="#9ca3af"
                keyboardType="url"
                autoCapitalize="none"
                value={demoLink}
                onChangeText={setDemoLink}
              />
            </View>
            
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-slate-300 font-semibold mb-2 ml-1">Remarks (Optional)</Text>
              <TextInput
                className="w-full bg-gray-50 dark:bg-slate-700 p-4 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white min-h-[100px]"
                placeholder="Any additional notes..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
                value={remarks}
                onChangeText={setRemarks}
              />
            </View>
            
            <TouchableOpacity 
              className={`w-full p-4 rounded-xl items-center shadow-sm ${submitMutation.isPending ? 'bg-blue-400' : 'bg-blue-600'}`}
              onPress={handleSubmit}
              disabled={submitMutation.isPending}
            >
              <Text className="text-white text-lg font-bold">
                {submitMutation.isPending ? 'Submitting...' : 'Submit Task'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
