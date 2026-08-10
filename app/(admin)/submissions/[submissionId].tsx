import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminSubmission, approveSubmission, rejectSubmission } from '../../../services/api';
import LoadingSpinner from '../../../components/LoadingSpinner';
import * as Linking from 'expo-linking';
import { MaterialIcons } from '@expo/vector-icons';
import DiscussionThread from '../../../components/DiscussionThread';
import { useTabBackHandler } from '../../../hooks/useTabBackHandler';
import { useColorScheme } from 'nativewind';
import Background from '../../../components/Background';
import GlassCard from '../../../components/GlassCard';
import * as Haptics from 'expo-haptics';

export default function SubmissionDetail() {
  const { submissionId } = useLocalSearchParams<{ submissionId: string }>();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#fff' : '#000';

  useTabBackHandler('/(admin)/submissions');

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
      case 'APPROVED': 
        return { view: 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800', text: 'text-zinc-900 dark:text-white' };
      case 'REJECTED': 
        return { view: 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800', text: 'text-zinc-500 dark:text-zinc-400' };
      default: 
        return { view: 'bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 backdrop-blur-md', text: 'text-zinc-900 dark:text-white' };
    }
  };

  const statusStyle = getStatusColor(submission.status);

  return (
    <Background>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ 
        title: 'Review Submission',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} className="mr-4 ml-1">
            <MaterialIcons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        )
      }} />
      
      <View className="p-5 pt-[130px]">        {/* User Info */}
        <GlassCard className="p-6 mb-5 items-center">
          <View className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full items-center justify-center mb-3 border border-zinc-300 dark:border-zinc-700">
            <Text className="text-zinc-700 dark:text-zinc-300 text-2xl font-bold">{submission.user?.name?.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{submission.user?.name}</Text>
          <Text className="text-gray-500 dark:text-zinc-400">{submission.user?.email}</Text>
        </GlassCard>


        {/* Links */}
        <GlassCard className="p-6 mb-5">
          <Text className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-xs mb-3">Links</Text>
          
          <TouchableOpacity 
            className="flex-row items-center p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-full border-0 mb-4"
            onPress={() => Linking.openURL(submission.githubLink)}
          >
            <View className="bg-zinc-200 dark:bg-zinc-700 p-1.5 rounded-full mr-3">
              <MaterialIcons name="code" size={20} color={isDark ? '#ffffff' : '#000000'} />
            </View>
            <Text className="text-zinc-800 dark:text-zinc-200 font-bold flex-1" numberOfLines={1}>{submission.githubLink}</Text>
            <MaterialIcons name="open-in-new" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-full border-0"
            onPress={() => Linking.openURL(submission.demoLink)}
          >
            <View className="bg-zinc-200 dark:bg-zinc-700 p-1.5 rounded-full mr-3">
              <MaterialIcons name="link" size={20} color={isDark ? '#ffffff' : '#000000'} />
            </View>
            <Text className="text-zinc-800 dark:text-zinc-200 font-bold flex-1" numberOfLines={1}>{submission.demoLink}</Text>
            <MaterialIcons name="open-in-new" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </GlassCard>

        {/* Remarks */}
        {submission.remarks ? (
          <GlassCard className="p-6 mb-5">
            <Text className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs mb-2 ml-1">Remarks</Text>
            <Text className="text-zinc-700 dark:text-zinc-300 italic">"{submission.remarks}"</Text>
          </GlassCard>
        ) : null}


        {/* Status & Actions */}
        <GlassCard className="p-6 mb-6 items-center">
          <Text className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs mb-3">Current Status</Text>
          <View className={`px-6 py-3 rounded-full mb-8 ${statusStyle.view}`}>
            <Text className={`text-sm font-black tracking-widest ${statusStyle.text}`}>{submission.status}</Text>
          </View>

          {submission.status === 'PENDING' && (
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity 
                className="flex-1 bg-transparent border-2 border-dashed border-zinc-400 dark:border-zinc-600 py-3 rounded-xl items-center justify-center"
                onPress={() => {
                  Alert.alert('Confirm', 'Reject this submission?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reject', style: 'destructive', onPress: () => rejectMutation.mutate() }
                  ]);
                }}
                disabled={rejectMutation.isPending || approveMutation.isPending}
              >
                <Text className="text-zinc-700 dark:text-zinc-300 font-black tracking-widest text-[10px]">REJECT</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-1 bg-black dark:bg-white py-3 rounded-xl items-center justify-center shadow-soft"
                onPress={() => {
                  Alert.alert('Confirm', 'Approve this submission?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Approve', style: 'default', onPress: () => approveMutation.mutate() }
                  ]);
                }}
                disabled={rejectMutation.isPending || approveMutation.isPending}
              >
                <Text className="text-white dark:text-black font-black tracking-widest text-[10px]">APPROVE</Text>
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>

        <TouchableOpacity 
          className="flex-row items-center justify-center bg-black dark:bg-white p-4 rounded-xl shadow-soft"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/(admin)/discussion/${submission.id}` as any);
          }}
        >
          <MaterialIcons name="forum" size={20} color={isDark ? '#000' : '#fff'} style={{ marginRight: 8 }} />
          <Text className="text-white dark:text-black font-bold uppercase tracking-widest text-xs">Discussion Room</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </Background>
  );
}
