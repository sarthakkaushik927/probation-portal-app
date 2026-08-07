import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubmissionComments, addSubmissionComment } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../store/auth';
import { Image } from 'expo-image';

interface Comment {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    role: string;
    avatarData: string | null;
  };
}

export default function DiscussionThread({ submissionId }: { submissionId: string }) {
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentUser = useAuthStore(s => s.user);
  const [message, setMessage] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', submissionId],
    queryFn: () => getSubmissionComments(submissionId).then(r => r.data.data as Comment[]),
    enabled: !!submissionId,
  });

  const addMutation = useMutation({
    mutationFn: (msg: string) => addSubmissionComment(submissionId, msg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', submissionId] });
      setMessage('');
    },
  });

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    addMutation.mutate(trimmed);
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isMe = item.user.id === currentUser?.id;
    const isAdmin = item.user.role === 'ADMIN';

    return (
      <View className={`mb-3 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <View className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center mr-2 mt-1 overflow-hidden border border-zinc-300 dark:border-zinc-700">
            {item.user.avatarData ? (
              <Image source={{ uri: item.user.avatarData }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Text className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{(item.user.name || '?').charAt(0).toUpperCase()}</Text>
            )}
          </View>
        )}
        <View className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMe ? 'bg-black dark:bg-white' : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'}`}>
          <View className="flex-row items-center gap-2 mb-1">
            <Text className={`text-xs font-bold ${isMe ? 'text-white/70 dark:text-black/70' : 'text-zinc-500 dark:text-zinc-400'}`}>
              {item.user.name || 'User'}
            </Text>
            {isAdmin && (
              <View className={`px-1.5 py-0.5 rounded ${isMe ? 'bg-white/20 dark:bg-black/20' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                <Text className={`text-[10px] font-bold font-mono ${isMe ? 'text-white/80 dark:text-black/80' : 'text-zinc-600 dark:text-zinc-400'}`}>ADMIN</Text>
              </View>
            )}
          </View>
          <Text className={`text-sm ${isMe ? 'text-white dark:text-black' : 'text-zinc-900 dark:text-white'}`}>
            {item.message}
          </Text>
          <Text className={`text-[10px] mt-1 ${isMe ? 'text-white/50 dark:text-black/50' : 'text-zinc-400 dark:text-zinc-600'}`}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
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
    <View className="mt-6 border-t-2 border-zinc-200 dark:border-zinc-800 pt-4">
      <Text className="text-lg font-bold font-sans text-zinc-900 dark:text-white mb-4">
        <MaterialIcons name="forum" size={18} color={isDark ? '#fff' : '#000'} /> Discussion & Feedback
      </Text>

      {isLoading ? (
        <ActivityIndicator className="py-8" />
      ) : comments && comments.length > 0 ? (
        <View className="mb-4">
          {comments.map(comment => (
            <View key={comment.id}>{renderComment({ item: comment })}</View>
          ))}
        </View>
      ) : (
        <View className="py-8 items-center">
          <MaterialIcons name="chat-bubble-outline" size={32} color="#a1a1aa" />
          <Text className="text-zinc-400 mt-2 font-sans">No comments yet. Start the discussion!</Text>
        </View>
      )}

      {/* Input */}
      <View className="flex-row items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-4 py-2 border-2 border-zinc-200 dark:border-zinc-800">
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
          className={`w-10 h-10 rounded-full items-center justify-center ${message.trim() ? 'bg-black dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'}`}
        >
          {addMutation.isPending ? (
            <ActivityIndicator size="small" color={isDark ? '#000' : '#fff'} />
          ) : (
            <MaterialIcons name="send" size={18} color={message.trim() ? (isDark ? '#000' : '#fff') : '#a1a1aa'} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
