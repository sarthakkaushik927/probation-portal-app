import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../store/auth';
import { useRealtime } from '../hooks/useRealtime';
import axios from 'axios';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, runOnJS } from 'react-native-reanimated';
import GlassCard from './GlassCard';

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

  // Fetch initial history
  const { data: history } = useQuery({
    queryKey: ['chat', channel],
    queryFn: () => axios.get(`${API_URL}/chat`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data.data),
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
    mutationFn: (content: string) => axios.post(`${API_URL}/chat`, { content }, { headers: { Authorization: `Bearer ${token}` } }),
    onSuccess: () => setMessage(''),
  });

  const reactMutation = useMutation({
    mutationFn: (type: string) => axios.post(`${API_URL}/chat/react`, { type }, { headers: { Authorization: `Bearer ${token}` } }),
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message.trim());
  };

  const handleReact = (type: string) => {
    triggerFlyingEmoji(type); // Optimistic local UI
    reactMutation.mutate(type); // Send to others
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.userId === user?.id;
    const isAdmin = item.user.role === 'ADMIN';

    // Basic @mention highlighting (e.g. @Sarthak)
    const renderContent = (text: string) => {
      const parts = text.split(/(@\w+)/g);
      return parts.map((part, i) => {
        if (part.startsWith('@')) {
          return <Text key={i} className="text-blue-500 font-bold">{part}</Text>;
        }
        return <Text key={i}>{part}</Text>;
      });
    };

    return (
      <View className={`mb-4 w-full ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <Text className={`text-xs mb-1 ml-1 font-bold ${isAdmin ? 'text-purple-500' : 'text-zinc-500'}`}>
            {item.user.name} {isAdmin && ' (Admin)'}
          </Text>
        )}
        <View className={`p-3 rounded-2xl max-w-[80%] ${isMe ? 'bg-blue-600 rounded-br-none' : 'bg-zinc-200 dark:bg-zinc-800 rounded-bl-none'}`}>
          <Text className={`text-base ${isMe ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
            {renderContent(item.content)}
          </Text>
        </View>
        <Text className="text-[10px] text-zinc-400 mt-1 mx-1">
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <FlatList
        data={history || []}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Flying Emojis Overlay */}
      {flyingEmojis.map(emoji => (
        <FlyingEmoji key={emoji.id} id={emoji.id} type={emoji.type} onComplete={removeFlyingEmoji} />
      ))}

      {/* Input Area */}
      <GlassCard className="m-4 p-2 flex-row items-center border border-zinc-200 dark:border-zinc-800 rounded-full" intensity={80}>
        <TextInput
          className="flex-1 h-12 px-4 text-base text-zinc-900 dark:text-white"
          placeholder="Type a message... (Use @ to tag)"
          placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <View className="flex-row items-center pr-2 gap-1">
          <TouchableOpacity onPress={() => handleReact('heart')} className="p-2">
            <MaterialIcons name="favorite-border" size={24} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSend} 
            disabled={!message.trim() || sendMutation.isPending}
            className={`w-10 h-10 rounded-full items-center justify-center ${message.trim() ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
          >
            <MaterialIcons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </GlassCard>
    </View>
  );
}
