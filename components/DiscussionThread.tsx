import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubmissionComments, addSubmissionComment } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../store/auth';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';

interface Comment {
  id: string;
  message: string;
  createdAt: string;
  status?: 'sending' | 'sent' | 'failed';
  user: {
    id: string;
    name: string | null;
    role: string;
    avatarData: string | null;
  };
}

export default function DiscussionThread({ submissionId, fullScreen = false }: { submissionId: string, fullScreen?: boolean }) {
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentUser = useAuthStore(s => s.user);
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', submissionId],
    queryFn: () => getSubmissionComments(submissionId).then(r => r.data.data as Comment[]),
    enabled: !!submissionId,
  });

  const addMutation = useMutation({
    mutationFn: (msg: string) => addSubmissionComment(submissionId, msg),
    onMutate: async (newMsg) => {
      await queryClient.cancelQueries({ queryKey: ['comments', submissionId] });
      const previousComments = queryClient.getQueryData(['comments', submissionId]);

      const optimisticComment: Comment = {
        id: Math.random().toString(),
        message: newMsg,
        createdAt: new Date().toISOString(),
        status: 'sending',
        user: {
          id: currentUser?.id || '',
          name: currentUser?.name || '',
          role: currentUser?.role || 'USER',
          avatarData: currentUser?.avatarData || null,
        }
      };

      queryClient.setQueryData(['comments', submissionId], (old: Comment[] = []) => [...old, optimisticComment]);
      return { previousComments };
    },
    onError: (err, newMsg, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', submissionId], context.previousComments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', submissionId] });
    },
  });

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessage('');
    addMutation.mutate(trimmed);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isMe = item.user.id === currentUser?.id;
    const isAdmin = item.user.role === 'ADMIN';

    const isSending = item.status === 'sending';
    const isSent = item.status === 'sent' || !item.status;

    return (
      <View className={`mb-3 flex-row ${isMe ? 'justify-end' : 'justify-start'} ${isSending ? 'opacity-70' : ''}`}>
        {!isMe && (
          <View className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center mr-2 mt-1 overflow-hidden border border-zinc-300 dark:border-zinc-700">
            {item.user.avatarData ? (
              <Image source={{ uri: item.user.avatarData }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Text className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{(item.user.name || '?').charAt(0).toUpperCase()}</Text>
            )}
          </View>
        )}
        <View className="max-w-[75%] rounded-2xl overflow-hidden border border-black/10 dark:border-white/20 shadow-sm">
          <BlurView 
            tint={isDark ? 'dark' : 'light'} 
            intensity={60} 
            style={{ backgroundColor: isDark ? (isMe ? 'rgba(255, 255, 255, 0.1)' : 'rgba(9, 9, 11, 0.4)') : (isMe ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.6)') }}
            className="px-4 py-3"
          >
            <View className="flex-row items-center gap-2 mb-1">
              <Text className={`text-xs font-bold ${isMe ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {item.user.name || 'User'}
              </Text>
              {isAdmin && (
                <View className={`px-1.5 py-0.5 rounded ${isMe ? 'bg-black/10 dark:bg-white/20' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                  <Text className={`text-[10px] font-bold font-mono ${isMe ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-600 dark:text-zinc-400'}`}>ADMIN</Text>
                </View>
              )}
            </View>
            <Text className={`text-sm ${isMe ? 'text-zinc-900 dark:text-white' : 'text-zinc-900 dark:text-white'}`}>
              {item.message}
            </Text>
            
            <View className="flex-row justify-end items-center mt-1">
              <Text className={`text-[10px] ${isMe ? 'text-zinc-500 dark:text-zinc-500' : 'text-zinc-400 dark:text-zinc-500'} mr-1`}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {isMe && (
                <MaterialIcons 
                  name={isSending ? "schedule" : (isSent ? "done-all" : "error-outline")} 
                  size={12} 
                  color={isSending ? "#9ca3af" : (isSent ? "#3b82f6" : "#ef4444")} 
                />
              )}
            </View>
          </BlurView>
        </View>
        {isMe && (
          <View className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center ml-2 mt-1 overflow-hidden border border-zinc-300 dark:border-zinc-700">
            {item.user.avatarData ? (
              <Image source={{ uri: item.user.avatarData }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Text className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{(item.user.name || '?').charAt(0).toUpperCase()}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className={fullScreen ? "flex-1" : "mt-6 border-t-2 border-zinc-200 dark:border-zinc-800 pt-4"}>
      {!fullScreen && (
        <Text className="text-lg font-bold font-sans text-zinc-900 dark:text-white mb-4">
          <MaterialIcons name="forum" size={18} color={isDark ? '#fff' : '#000'} /> Discussion & Feedback
        </Text>
      )}

      {isLoading ? (
        <ActivityIndicator className="py-8" />
      ) : comments && comments.length > 0 ? (
        fullScreen ? (
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 mb-4" 
            contentContainerStyle={{ paddingVertical: 10 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {comments.map(comment => (
              <View key={comment.id}>{renderComment({ item: comment })}</View>
            ))}
          </ScrollView>
        ) : (
          <View className="mb-4">
            {comments.map(comment => (
              <View key={comment.id}>{renderComment({ item: comment })}</View>
            ))}
          </View>
        )
      ) : (
        <View className={`${fullScreen ? 'flex-1 justify-center' : 'py-8'} items-center`}>
          <MaterialIcons name="chat-bubble-outline" size={32} color="#a1a1aa" />
          <Text className="text-zinc-400 mt-2 font-sans">No comments yet. Start the discussion!</Text>
        </View>
      )}

      {/* Input */}
      <View className="rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 shadow-sm mt-2 mb-[100px]">
        <BlurView 
          tint={isDark ? 'dark' : 'light'} 
          intensity={60} 
          style={{ backgroundColor: isDark ? 'rgba(24, 24, 27, 0.5)' : 'rgba(255, 255, 255, 0.6)' }}
          className="flex-row items-center gap-2 px-4 py-2"
        >
          <TextInput
            className="flex-1 text-zinc-900 dark:text-white font-sans text-sm py-2"
            placeholder="Write a comment..."
            placeholderTextColor="#a1a1aa"
            value={message}
            onChangeText={setMessage}
            multiline
            editable={!addMutation.isPending}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={addMutation.isPending || !message.trim()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            className={`w-10 h-10 rounded-full items-center justify-center ${message.trim() ? 'bg-black dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700/50'}`}
          >
            {addMutation.isPending ? (
              <ActivityIndicator size="small" color={isDark ? '#000' : '#fff'} />
            ) : (
              <MaterialIcons name="send" size={18} color={message.trim() ? (isDark ? '#000' : '#fff') : (isDark ? '#52525b' : '#a1a1aa')} />
            )}
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}
