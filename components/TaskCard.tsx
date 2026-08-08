import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';
import { Task } from '../types';
import DomainSwatch from './DomainSwatch';
import * as Haptics from 'expo-haptics';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const formattedDate = new Date(task.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <TouchableOpacity 
      className="rounded-xl border-[3px] border-black dark:border-white mb-4 overflow-hidden relative"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onPress) onPress();
      }}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <BlurView tint={isDark ? "dark" : "light"} intensity={40} style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.1)' : 'rgba(255, 255, 255, 0.2)' }]} />
      <View className="p-4 relative z-10 w-full h-full">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold font-sans text-zinc-900 dark:text-white" numberOfLines={1}>
              {task.title}
            </Text>
            <View className="flex-row items-center mt-1">
              <DomainSwatch domain={task.domain} size={12} className="mr-2" />
              <Text className="text-[10px] font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {task.domain}
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#A1A1AA" />
        </View>
        
        <Text className="text-zinc-500 dark:text-zinc-400 font-sans text-sm leading-snug mb-3" numberOfLines={2}>
          {task.description}
        </Text>
        
        <View className="flex-row items-center justify-between pt-3 border-t border-black dark:border-white">
          <View className="flex-row items-center">
            <MaterialIcons name="event" size={14} color="#A1A1AA" />
            <Text className="text-zinc-900 dark:text-white font-mono text-sm ml-1.5 font-medium">{formattedDate}</Text>
          </View>
          <View className="flex-row items-center px-3 py-1.5 rounded-md border border-black dark:border-white bg-white dark:bg-zinc-950/50">
            <Text className="text-zinc-900 dark:text-white font-mono text-[10px] font-bold uppercase tracking-widest">Details</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
