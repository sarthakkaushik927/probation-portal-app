import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserTask, createSubmission, updateSubmission } from '../../../services/api';
import DomainSwatch from '../../../components/DomainSwatch';
import LoadingSpinner from '../../../components/LoadingSpinner';
import GlassCard from '../../../components/GlassCard';
import { MaterialIcons } from '@expo/vector-icons';
import Background from '../../../components/Background';
import DiscussionThread from '../../../components/DiscussionThread';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';

export default function UserTaskDetail() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [githubLink, setGithubLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{title: string, message: string, type: 'success' | 'error'} | null>(null);
  
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery({
    queryKey: ['userTask', taskId],
    queryFn: () => getUserTask(taskId).then(res => res.data.data),
    enabled: !!taskId,
  });

  const submitMutation = useMutation({
    mutationFn: () => createSubmission({ taskId, githubLink, demoLink, remarks }),
    onSuccess: () => {
      setToastMessage({ title: 'Success', message: 'Task submitted successfully!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['userTask', taskId] });
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['userTasks'] });
      setTimeout(() => setToastMessage(null), 3000);
    },
    onError: (error: any) => {
      const msg = typeof error.response?.data?.error === 'string' ? error.response.data.error : 'Failed to submit task';
      setToastMessage({ title: 'Error', message: msg, type: 'error' });
      setTimeout(() => setToastMessage(null), 3000);
    }
  });

  const updateMutation = useMutation({
    mutationFn: () => updateSubmission(taskId, { githubLink, demoLink, remarks }),
    onSuccess: () => {
      setToastMessage({ title: 'Success', message: 'Submission updated successfully!', type: 'success' });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['userTask', taskId] });
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      setTimeout(() => setToastMessage(null), 3000);
    },
    onError: (error: any) => {
      const msg = typeof error.response?.data?.error === 'string' ? error.response.data.error : 'Failed to update submission';
      setToastMessage({ title: 'Error', message: msg, type: 'error' });
      setTimeout(() => setToastMessage(null), 3000);
    }
  });

  const handleSubmit = () => {
    if (!githubLink || !demoLink) {
      setToastMessage({ title: 'Error', message: 'Please provide both GitHub and Demo links', type: 'error' });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    if (isEditing) {
      updateMutation.mutate();
    } else {
      submitMutation.mutate();
    }
  };

  if (isLoading || !result) return <LoadingSpinner />;

  const { task, submission } = result;
  const formattedDate = new Date(task.deadline).toLocaleDateString();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      {toastMessage && (
        <Animated.View 
          entering={FadeInUp.springify()} 
          exiting={FadeOutUp.duration(300)}
          className="absolute top-12 left-5 right-5 z-[999]"
          style={{ elevation: 99 }}
        >
          <GlassCard className={`flex-row items-center p-4 border-2 shadow-sm ${toastMessage.type === 'success' ? 'border-green-500' : toastMessage.type === 'error' ? 'border-red-500' : 'border-black dark:border-white'}`} intensity={90}>
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        className="flex-1"
      >
      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingTop: 90 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        contentInsetAdjustmentBehavior="never"
      >
        
        {/* Custom Back Button */}
        <View className="flex-row items-center mb-6 mt-4">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full border-2 border-black dark:border-white mr-4">
            <MaterialIcons name="arrow-back" size={18} color="#71717a" className="dark:text-zinc-400" />
            <Text className="ml-1 font-bold text-zinc-900 dark:text-white uppercase tracking-widest text-xs">Back</Text>
          </TouchableOpacity>
        </View>

        {/* Task Info */}
        <View className="bg-zinc-50 dark:bg-zinc-900 border-2 border-black dark:border-white p-5 rounded-xl mb-6">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-row items-center px-2 py-1 rounded-md border-2 border-black dark:border-white bg-white dark:bg-zinc-950">
              <DomainSwatch domain={task.domain} size={12} className="mr-1.5" />
              <Text className="text-xs font-bold uppercase tracking-widest text-zinc-300">{task.domain}</Text>
            </View>
            <View className="bg-white dark:bg-zinc-950 px-3 py-1 rounded-full border-2 border-black dark:border-white">
              <Text className="text-zinc-900 dark:text-white text-xs font-bold uppercase tracking-widest">
                {task.points} pts
              </Text>
            </View>
          </View>
          
          <Text className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            {task.title}
          </Text>
          <Text className="text-gray-400 text-sm leading-relaxed">{task.description}</Text>
        </View>

        {/* Submission Section */}
        {submission && !isEditing ? (
          <GlassCard className="p-6 mb-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-zinc-900 dark:text-white">Your Submission</Text>
              {submission.status === 'PENDING' && (
                <TouchableOpacity 
                  className="bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white px-3 py-1.5 rounded-lg flex-row items-center"
                  onPress={() => {
                    setGithubLink(submission.githubLink);
                    setDemoLink(submission.demoLink);
                    setRemarks(submission.remarks || '');
                    setIsEditing(true);
                  }}
                >
                  <MaterialIcons name="edit" size={14} color="#71717a" className="mr-1 dark:text-zinc-400" />
                  <Text className="text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-widest">Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View className="mb-4">
              <Text className="text-zinc-500 font-bold uppercase text-xs mb-2">Status</Text>
              <View className={`self-start flex-row items-center px-4 py-2 rounded-md border ${
                submission.status === 'APPROVED' ? 'border-solid border-white' :
                submission.status === 'REJECTED' ? 'border-dashed border-zinc-500' :
                'border-dotted border-zinc-500'
              }`}>
                <MaterialIcons 
                  name={submission.status === 'APPROVED' ? 'check' : submission.status === 'REJECTED' ? 'close' : 'schedule'} 
                  size={14} 
                  color={submission.status === 'APPROVED' ? '#FFFFFF' : submission.status === 'REJECTED' ? '#71717a' : '#71717a'} 
                  className="mr-2" 
                />
                <Text className={`font-mono tracking-widest uppercase text-[10px] ${
                  submission.status === 'APPROVED' ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                }`}>{submission.status}</Text>
              </View>
            </View>
            
            <View className="mb-4">
              <Text className="text-zinc-500 font-bold uppercase text-xs mb-1">GitHub Link</Text>
              <TouchableOpacity onPress={() => {
                const url = submission.githubLink;
                const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
                Linking.openURL(formattedUrl).catch(err => console.error("An error occurred", err));
              }}>
                <Text className="text-blue-500 dark:text-blue-400 font-medium underline">{submission.githubLink}</Text>
              </TouchableOpacity>
            </View>
            
            <View className="mb-4">
              <Text className="text-zinc-500 font-bold uppercase text-xs mb-1">Demo Link</Text>
              <TouchableOpacity onPress={() => {
                const url = submission.demoLink;
                const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
                Linking.openURL(formattedUrl).catch(err => console.error("An error occurred", err));
              }}>
                <Text className="text-blue-500 dark:text-blue-400 font-medium underline">{submission.demoLink}</Text>
              </TouchableOpacity>
            </View>
            
            {submission.remarks ? (
              <View>
                <Text className="text-zinc-500 font-bold uppercase text-xs mb-1">Remarks</Text>
                <Text className="text-zinc-300 italic">"{submission.remarks}"</Text>
              </View>
            ) : null}
          </GlassCard>
        ) : (
          <GlassCard className="p-6 mb-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-zinc-900 dark:text-white">
                {isEditing ? 'Edit Submission' : 'Submit Task'}
              </Text>
              {isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <MaterialIcons name="close" size={24} color="#71717a" />
                </TouchableOpacity>
              )}
            </View>
            
            <View className="mb-5">
              <Text className="text-zinc-500 font-bold uppercase text-xs tracking-wider mb-2 ml-1">GitHub Link <Text className="text-red-500">*</Text></Text>
              <TextInput
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white px-5 py-4 rounded-xl text-zinc-900 dark:text-white font-medium focus:border-zinc-500"
                placeholder="https://github.com/..."
                placeholderTextColor="#9ca3af"
                keyboardType="url"
                autoCapitalize="none"
                value={githubLink}
                onChangeText={setGithubLink}
              />
            </View>
            
            <View className="mb-5">
              <Text className="text-zinc-500 font-bold uppercase text-xs tracking-wider mb-2 ml-1">Live Demo <Text className="text-red-500">*</Text></Text>
              <TextInput
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white px-5 py-4 rounded-xl text-zinc-900 dark:text-white font-medium focus:border-zinc-500"
                placeholder="https://your-demo-url.com"
                placeholderTextColor="#9ca3af"
                keyboardType="url"
                autoCapitalize="none"
                value={demoLink}
                onChangeText={setDemoLink}
              />
            </View>
            
            <View className="mb-8">
              <Text className="text-zinc-500 font-bold uppercase text-xs tracking-wider mb-2 ml-1">Remarks (Optional)</Text>
              <TextInput
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white px-5 py-4 rounded-xl text-zinc-900 dark:text-white font-medium min-h-[120px] focus:border-zinc-500"
                placeholder="Any additional notes..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
                value={remarks}
                onChangeText={setRemarks}
              />
            </View>
            
            <TouchableOpacity 
              className={`w-full py-4 px-6 rounded-xl items-center ${submitMutation.isPending || updateMutation.isPending ? 'bg-zinc-800 dark:bg-zinc-700' : 'bg-white dark:bg-zinc-200'} flex-row justify-center`}
              onPress={handleSubmit}
              disabled={submitMutation.isPending || updateMutation.isPending}
            >
              {submitMutation.isPending || updateMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text className="text-black text-sm font-bold font-mono uppercase tracking-widest mr-2">
                    {isEditing ? 'Update Submission' : 'Submit Task'}
                  </Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#000000" />
                </>
              )}
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Discussion Link */}
        {submission && (
          <TouchableOpacity 
            className="bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white p-5 rounded-xl mb-6 flex-row items-center justify-between"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/discussion/${submission.id}` as any);
            }}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="forum" size={24} color="#71717a" className="mr-3 dark:text-zinc-400" />
              <View>
                <Text className="text-zinc-900 dark:text-white font-bold text-base">Discussion & Feedback</Text>
                <Text className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">View comments and feedback from admins</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#71717a" />
          </TouchableOpacity>
        )}

        <View className="h-24" />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
