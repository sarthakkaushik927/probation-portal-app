import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminSubmission, approveSubmission, rejectSubmission } from '../../../services/api';
import LoadingSpinner from '../../../components/LoadingSpinner';
import * as Linking from 'expo-linking';
import { MaterialIcons } from '@expo/vector-icons';

export default function SubmissionDetail() {
  const { submissionId } = useLocalSearchParams<{ submissionId: string }>();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: submission, isLoading } = useQuery({
    queryKey: ['adminSubmission', submissionId],
    queryFn: () => getAdminSubmission(submissionId).then(res => res.data.data),
  });

  const approveMutation = useMutation({
    mutationFn: () => approveSubmission(submissionId),
    onSuccess: () => {
      Alert.alert('Success', 'Submission approved');
      queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['adminSubmission', submissionId] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to approve');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectSubmission(submissionId),
    onSuccess: () => {
      Alert.alert('Success', 'Submission rejected');
      queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['adminSubmission', submissionId] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to reject');
    }
  });

  if (isLoading || !submission) return <LoadingSpinner />;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const statusStyle = getStatusColor(submission.status);

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <Stack.Screen options={{ title: 'Review Submission' }} />
      
      <View className="p-4">
        {/* User Info */}
        <View className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-4 items-center">
          <View className="w-16 h-16 bg-blue-100 dark:bg-slate-700 rounded-full items-center justify-center mb-3">
            <Text className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{submission.user?.name?.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1">{submission.user?.name}</Text>
          <Text className="text-gray-500 dark:text-slate-400">{submission.user?.email}</Text>
        </View>

        {/* Task Info */}
        <View className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-4">
          <Text className="text-gray-500 dark:text-slate-400 font-bold uppercase text-xs mb-1">Task</Text>
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">{submission.task?.title}</Text>
          <Text className="text-gray-700 dark:text-slate-300">{submission.task?.description}</Text>
        </View>

        {/* Links */}
        <View className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-4">
          <Text className="text-gray-500 dark:text-slate-400 font-bold uppercase text-xs mb-3">Links</Text>
          
          <TouchableOpacity 
            className="flex-row items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 mb-3"
            onPress={() => Linking.openURL(submission.githubLink)}
          >
            <MaterialIcons name="code" size={24} color="#3b82f6" />
            <Text className="text-gray-800 dark:text-slate-200 font-bold ml-3 flex-1" numberOfLines={1}>{submission.githubLink}</Text>
            <MaterialIcons name="open-in-new" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600"
            onPress={() => Linking.openURL(submission.demoLink)}
          >
            <MaterialIcons name="link" size={24} color="#3b82f6" />
            <Text className="text-blue-600 dark:text-blue-400 font-bold ml-3 flex-1" numberOfLines={1}>{submission.demoLink}</Text>
            <MaterialIcons name="open-in-new" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Remarks */}
        {submission.remarks && (
          <View className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-4">
            <Text className="text-gray-500 dark:text-slate-400 font-bold uppercase text-xs mb-2">Remarks</Text>
            <Text className="text-gray-700 dark:text-slate-300 italic">"{submission.remarks}"</Text>
          </View>
        )}

        {/* Status & Actions */}
        <View className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 items-center">
          <Text className="text-gray-500 dark:text-slate-400 font-bold uppercase text-xs mb-2">Current Status</Text>
          <View className={`px-4 py-2 rounded-lg border mb-6 ${statusStyle.split(' ').slice(0, 3).join(' ')}`}>
            <Text className={`text-lg font-bold ${statusStyle.split(' ')[1]}`}>{submission.status}</Text>
          </View>

          {submission.status === 'PENDING' && (
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity 
                className="flex-1 bg-white dark:bg-slate-800 border-2 border-red-500 p-4 rounded-xl items-center"
                onPress={() => {
                  Alert.alert('Confirm', 'Reject this submission?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reject', style: 'destructive', onPress: () => rejectMutation.mutate() }
                  ]);
                }}
                disabled={rejectMutation.isPending || approveMutation.isPending}
              >
                <Text className="text-red-500 font-bold text-base">Reject</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-green-500 p-4 rounded-xl items-center shadow-sm"
                onPress={() => {
                  Alert.alert('Confirm', 'Approve this submission?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Approve', style: 'default', onPress: () => approveMutation.mutate() }
                  ]);
                }}
                disabled={rejectMutation.isPending || approveMutation.isPending}
              >
                <Text className="text-white font-bold text-base">Approve</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
