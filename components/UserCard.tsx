import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User } from '../types';
import DomainSwatch from './DomainSwatch';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';

interface UserCardProps {
  user: User;
  onPress?: () => void;
}

export default function UserCard({ user, onPress }: UserCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      className="bg-transparent dark:bg-transparent border-[3px] border-black dark:border-white rounded-xl mb-3 overflow-hidden relative"
      disabled={!onPress}
    >
      <BlurView tint={isDark ? "dark" : "light"} intensity={40} style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.1)' : 'rgba(255, 255, 255, 0.2)' }]} />
      <View className="flex-row items-center p-4 relative z-10 w-full">
      <View className="relative w-12 h-12 rounded-full items-center justify-center mr-4 border-[3px] border-black dark:border-white bg-white dark:bg-zinc-950 overflow-hidden">
        {user.avatarData ? (
          <Image source={{ uri: user.avatarData }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <>
            {user.domain && <DomainSwatch domain={user.domain} size={48} className="absolute inset-0" />}
            <Text className="text-xl font-bold font-sans text-zinc-900 dark:text-white relative z-10">{initial}</Text>
          </>
        )}
      </View>
      
      <View className="flex-1">
        <Text className="text-lg font-bold font-sans text-zinc-900 dark:text-white mb-0.5">{user.name || 'Unknown User'}</Text>
        <Text className="text-sm font-sans text-zinc-500 dark:text-zinc-400 mb-2">{user.email}</Text>
        <View className="flex-row gap-2">
          <View className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-black dark:border-white">
            <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-bold font-mono uppercase tracking-widest">{user.role}</Text>
          </View>
          <View className="flex-row items-center px-2 py-0.5 rounded border border-black dark:border-white bg-white dark:bg-zinc-950">
            {user.domain && <DomainSwatch domain={user.domain} size={10} className="mr-1.5" />}
            <Text className="text-zinc-900 dark:text-white text-[10px] font-bold font-mono uppercase tracking-widest">{user.domain || 'UNASSIGNED'}</Text>
          </View>
        </View>
      </View>
      </View>
    </TouchableOpacity>
  );
}
