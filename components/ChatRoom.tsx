import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../store/auth';
import { useRealtime } from '../hooks/useRealtime';
import axios from 'axios';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, runOnJS } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

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
    onSuccess: () => {
      setMessage('');
      // scroll to show the new message (inverted list -> offset 0)
      try {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      } catch (e) {
        // ignore
      }
    },
  });

  const reactMutation = useMutation({
    mutationFn: (type: string) => axios.post(`${API_URL}/chat/react`, { type }, { headers: { Authorization: `Bearer ${token}` } }),
  });

  const handleSend = () => {
    const text = message.trim();
    if (!text || sendMutation.isPending) return;
    sendMutation.mutate(text);
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
    <KeyboardAvoidingView 
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
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
      <View className="m-4 overflow-hidden rounded-full border-2 border-black dark:border-white">
        <BlurView pointerEvents="none" intensity={80} tint={isDark ? "dark" : "light"} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isDark ? 'rgba(9, 9, 11, 0.6)' : 'rgba(255, 255, 255, 0.6)' }} />
        <View className="flex-row items-center p-2">
        <TextInput
          className="flex-1 h-12 px-4 text-base text-zinc-900 dark:text-white"
          placeholder="Type a message... (Use @ to tag)"
          placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
          value={message}
          onChangeText={setMessage}
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
            disabled={!message.trim() || sendMutation.isPending}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Send message"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: message.trim() ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb'),
              opacity: (!message.trim() || sendMutation.isPending) ? 0.6 : 1,
            }}
          >
            <MaterialIcons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </KeyboardAvoidingView>
  );
}
