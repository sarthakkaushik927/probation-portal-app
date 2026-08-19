import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../store/auth';
import { useRealtime } from '../hooks/useRealtime';
import axios from 'axios';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, runOnJS } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { getUserDirectory } from '../services/api';
import * as Haptics from 'expo-haptics';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

// A single Flying Emoji component
const FlyingEmoji = ({ id, type, onComplete }: { id: string, type: string, onComplete: (id: string) => void }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withTiming(1.2, { duration: 200 });
    translateY.value = withTiming(-300, { duration: 1500 });
    opacity.value = withSequence(
      withTiming(1, { duration: 1000 }),
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished) runOnJS(onComplete)(id);
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const icon = type === 'heart' ? 'favorite' : 'thumb-up';
  const color = type === 'heart' ? '#ef4444' : '#3b82f6';

  return (
    <Animated.View style={[animatedStyle, { position: 'absolute', bottom: 50, right: 20, zIndex: 100 }]}>
      <MaterialIcons name={icon} size={32} color={color} />
    </Animated.View>
  );
};

export default function ChatRoom({ channel = 'global-chat' }) {
  const { user, token } = useAuthStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const queryClient = useQueryClient();
  const { subscribe } = useRealtime();

  const [message, setMessage] = useState('');
  const [flyingEmojis, setFlyingEmojis] = useState<{ id: string, type: string }[]>([]);
  const flatListRef = useRef<FlatList<any> | null>(null);

  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  // Fetch initial history
  const { data: history } = useQuery({
    queryKey: ['chat', channel],
    queryFn: () => axios.get(`${API_URL}/chat`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data.data),
  });

  const { data: directory } = useQuery({
    queryKey: ['userDirectory'],
    queryFn: () => getUserDirectory().then(res => res.data.data),
  });

  // Real-time subscriptions
  useEffect(() => {
    const unsubMessage = subscribe(channel, 'new_message', (newMsg) => {
      queryClient.setQueryData(['chat', channel], (old: any) => {
        if (!old) return [newMsg];
        // Ensure no duplicates
        if (old.find((m: any) => m.id === newMsg.id)) return old;
        return [newMsg, ...old].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
    });

    const unsubReact = subscribe(channel, 'flying_emoji', (reaction) => {
      triggerFlyingEmoji(reaction.type);
    });

    return () => {
      unsubMessage();
      unsubReact();
    };
  }, [channel, subscribe, queryClient]);

  const triggerFlyingEmoji = (type: string) => {
    const newEmoji = { id: Math.random().toString(), type };
    setFlyingEmojis(prev => [...prev, newEmoji]);
  };

  const removeFlyingEmoji = (id: string) => {
    setFlyingEmojis(prev => prev.filter(e => e.id !== id));
  };

  const sendMutation = useMutation({
    mutationFn: (newMsg: { content: string, tempId: string }) => 
      axios.post(`${API_URL}/chat`, { content: newMsg.content }, { headers: { Authorization: `Bearer ${token}` } }),
    onMutate: async (newMsg) => {
      await queryClient.cancelQueries({ queryKey: ['chat', channel] });
      const previousMessages = queryClient.getQueryData(['chat', channel]);
      
      const optimisticMsg = {
        id: newMsg.tempId,
        content: newMsg.content,
        userId: user?.id,
        user: user, // local user object
        createdAt: new Date().toISOString(),
        status: 'sending'
      };
      
      queryClient.setQueryData(['chat', channel], (old: any) => {
        return [optimisticMsg, ...(old || [])];
      });
      
      return { previousMessages, tempId: newMsg.tempId };
    },
    onError: (err, newMsg, context: any) => {
      queryClient.setQueryData(['chat', channel], (old: any) => {
        return old.map((m: any) => m.id === context.tempId ? { ...m, status: 'failed' } : m);
      });
    },
    onSuccess: (data, variables, context: any) => {
      const realMsg = data.data.data;
      queryClient.setQueryData(['chat', channel], (old: any) => {
        const filtered = old.filter((m: any) => m.id !== context.tempId);
        if (filtered.find((m: any) => m.id === realMsg.id)) return filtered;
        return [{ ...realMsg, status: 'sent' }, ...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
    }
  });

  const reactMutation = useMutation({
    mutationFn: (type: string) => axios.post(`${API_URL}/chat/react`, { type }, { headers: { Authorization: `Bearer ${token}` } }),
  });

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const tempId = `temp-${Date.now()}`;
    sendMutation.mutate({ content: text, tempId });
    setMessage('');
    try {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (e) {}
  };

  const retryMessage = (msg: any) => {
    queryClient.setQueryData(['chat', channel], (old: any) => old.filter((m: any) => m.id !== msg.id));
    const tempId = `temp-${Date.now()}`;
    sendMutation.mutate({ content: msg.content, tempId });
  };

  const handleReact = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    triggerFlyingEmoji(type); // Optimistic local UI
    reactMutation.mutate(type); // Send to others
  };

  const handleTextChange = (text: string) => {
    setMessage(text);
    
    // Check for @mention
    const words = text.split(' ');
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith('@')) {
      setMentionQuery(lastWord.substring(1).toLowerCase());
    } else {
      setMentionQuery(null);
    }
  };

  const handleMentionSelect = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const words = message.split(' ');
    words.pop();
    const newText = [...words, `@${name} `].join(' ');
    setMessage(newText.replace(/^\s+/, ''));
    setMentionQuery(null);
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.userId === user?.id;
    const isAdmin = item.user?.role === 'ADMIN';

    const isSending = item.status === 'sending';
    const isFailed = item.status === 'failed';
    const isSent = item.status === 'sent' || (!isSending && !isFailed);

    // Advanced @mention highlighting supporting spaces (e.g. @Satyam Agarwal)
    const renderContent = (text: string) => {
      let regex = /(@\w+)/g; // Fallback
      if (directory && directory.length > 0) {
        // Build regex matching exactly the names in the directory, longest first to avoid partial matches
        const sortedNames = [...directory].map((u: any) => u.name).sort((a, b) => b.length - a.length);
        const escapedNames = sortedNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        if (escapedNames) {
          regex = new RegExp(`(@(?:${escapedNames}))`, 'gi');
        }
      }

      const parts = text.split(regex);
      return parts.map((part, i) => {
        if (part.startsWith('@')) {
          const namePart = part.substring(1).toLowerCase();
          const isRealUser = directory?.some((u: any) => u.name.toLowerCase() === namePart);
          if (isRealUser || regex.source === '(@\\w+)') { // if fallback or real user
            return <Text key={i} className="text-blue-500 font-bold">{part}</Text>;
          }
        }
        return <Text key={i}>{part}</Text>;
      });
    };

    return (
      <View className={`mb-4 w-full ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <Text className={`text-xs mb-1 ml-1 font-bold ${isAdmin ? 'text-purple-500' : 'text-zinc-500'}`}>
            {item.user?.name || 'Unknown'} {isAdmin && ' (Admin)'}
          </Text>
        )}
        <View className={`max-w-[80%] rounded-2xl overflow-hidden shadow-sm border ${isFailed ? 'border-red-500' : 'border-black/10 dark:border-white/20'} ${isMe ? 'rounded-br-none' : 'rounded-bl-none'} ${isSending ? 'opacity-70' : ''}`}>
          <BlurView 
            tint={isDark ? 'dark' : 'light'} 
            intensity={60} 
            style={{ backgroundColor: isDark ? (isMe ? (isFailed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)') : 'rgba(9, 9, 11, 0.4)') : (isMe ? (isFailed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 0, 0, 0.05)') : 'rgba(255, 255, 255, 0.6)') }}
            className="p-3"
          >
            <Text className={`text-base ${isMe ? 'text-zinc-900 dark:text-white' : 'text-zinc-900 dark:text-white'}`}>
              {renderContent(item.content)}
            </Text>
          </BlurView>
        </View>
        <View className={`flex-row items-center mt-1 mx-1 gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <Text className={`text-[10px] ${isMe ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400'}`}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isMe && (
            <>
              {isSending && <MaterialIcons name="schedule" size={10} color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} />}
              {isSent && <MaterialIcons name="check" size={14} color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} />}
              {isFailed && (
                <TouchableOpacity onPress={() => retryMessage(item)} className="flex-row items-center gap-1 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                  <MaterialIcons name="refresh" size={12} color="#ef4444" />
                  <Text className="text-[10px] text-red-500 font-bold">Retry</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  const filteredUsers = directory?.filter((u: any) => u.name.toLowerCase().includes(mentionQuery || '')) || [];

  const renderContent = () => (
    <React.Fragment>
      <FlatList
        ref={flatListRef}
        data={history || []}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      {/* Flying Emojis Overlay */}
      {flyingEmojis.map(emoji => (
        <FlyingEmoji key={emoji.id} id={emoji.id} type={emoji.type} onComplete={removeFlyingEmoji} />
      ))}

      {/* Input Area with Mentions */}
      <View className="relative">
        {mentionQuery !== null && filteredUsers.length > 0 && (
          <View className="absolute bottom-full left-4 right-4 mb-2 max-h-48 rounded-xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-700" style={{ backgroundColor: isDark ? '#18181b' : '#ffffff' }}>
            <FlatList
              data={filteredUsers.slice(0, 5)}
              keyExtractor={item => item.id}
              keyboardShouldPersistTaps="always"
              renderItem={({ item }) => (
                <TouchableOpacity 
                  className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex-row items-center"
                  onPress={() => handleMentionSelect(item.name)}
                >
                  <View className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 mr-3 items-center justify-center">
                    <Text className="text-zinc-500 font-bold">{item.name[0]}</Text>
                  </View>
                  <Text className="text-base text-zinc-900 dark:text-white font-bold">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View className="mx-4 mb-2 overflow-hidden rounded-full border-2 border-black dark:border-white">
          <BlurView pointerEvents="none" intensity={80} tint={isDark ? "dark" : "light"} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isDark ? 'rgba(9, 9, 11, 0.6)' : 'rgba(255, 255, 255, 0.6)' }} />
          <View className="flex-row items-center p-2">
            <TextInput
              className="flex-1 h-12 px-4 text-base text-zinc-900 dark:text-white"
              placeholder="Type a message... (Use @ to tag)"
              placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
              value={message}
              onChangeText={handleTextChange}
              onSubmitEditing={handleSend}
              multiline
              maxLength={500}
            />
            <View className="flex-row items-center pr-2 gap-1">
              <TouchableOpacity onPress={() => handleReact('heart')} className="p-2">
                <MaterialIcons name="favorite-border" size={24} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSend}
                disabled={!message.trim()}
                activeOpacity={0.8}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                accessibilityLabel="Send message"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: message.trim() ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb'),
                  opacity: (!message.trim()) ? 0.6 : 1,
                }}
              >
                <MaterialIcons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </React.Fragment>
  );

  return (
    <KeyboardAvoidingView 
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
    >
      {renderContent()}
    </KeyboardAvoidingView>
  );
}
