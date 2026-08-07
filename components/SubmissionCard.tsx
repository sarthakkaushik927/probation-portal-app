import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Submission } from '../types';
import * as Linking from 'expo-linking';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';

interface SubmissionCardProps {
  submission: Submission;
  onPress?: () => void;
  isAdmin?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

export default function SubmissionCard({ submission, onPress, isAdmin, onApprove, onReject }: SubmissionCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getStatusStyle = () => {
    switch(submission.status) {
      case 'APPROVED': return { borderStyle: 'border-solid border-white', icon: 'check-circle' };
      case 'REJECTED': return { borderStyle: 'border-dashed border-zinc-500', icon: 'cancel' };
      default: return { borderStyle: 'border-dotted border-zinc-600', icon: 'schedule' };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <View className="rounded-xl border-[3px] border-black dark:border-white mb-4 overflow-hidden relative">
      <BlurView tint={isDark ? "dark" : "light"} intensity={60} style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.5)' : 'rgba(255, 255, 255, 0.5)' }]} />
      
      <TouchableOpacity 
        className="p-4 relative z-10 w-full"
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        <View className="flex-row items-center mb-3">
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 border bg-white dark:bg-zinc-950 ${statusStyle.borderStyle}`}>
            <MaterialIcons name={statusStyle.icon as any} size={20} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold font-sans text-zinc-900 dark:text-white" numberOfLines={1}>
              {submission.task?.title || 'Unknown Task'}
            </Text>
            <Text className="text-xs font-mono text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider mt-0.5">
              {submission.user?.name || 'Unknown User'}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#A1A1AA" />
        </View>

        <View className="flex-row mt-1 gap-2 mb-3">
          <TouchableOpacity 
            className="flex-row items-center bg-white dark:bg-zinc-950 border border-zinc-500 px-3 py-1.5 rounded"
            onPress={() => Linking.openURL(submission.githubLink)}
          >
            <MaterialIcons name="code" size={16} color="#FFFFFF" />
            <Text className="text-zinc-900 dark:text-white font-mono text-xs font-bold uppercase tracking-widest ml-1.5">GitHub</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-row items-center bg-white dark:bg-zinc-950 border border-zinc-500 px-3 py-1.5 rounded"
            onPress={() => Linking.openURL(submission.demoLink)}
          >
            <MaterialIcons name="link" size={16} color="#FFFFFF" />
            <Text className="text-zinc-900 dark:text-white font-mono text-xs font-bold uppercase tracking-widest ml-1.5">Demo</Text>
          </TouchableOpacity>
        </View>
        
        {submission.remarks && (
          <View className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg border border-[#333]">
            <Text className="text-zinc-500 dark:text-zinc-400 font-sans text-sm font-medium leading-relaxed">"{submission.remarks}"</Text>
          </View>
        )}
      </TouchableOpacity>

      {isAdmin && submission.status === 'PENDING' && (
        <View className="flex-row gap-3 mt-4 pt-4 border-t border-black dark:border-white">
          <TouchableOpacity 
            className="flex-1 flex-row justify-center items-center py-2 rounded-md border border-solid border-white"
            onPress={onApprove}
          >
            <MaterialIcons name="check" size={14} color="#FFFFFF" className="mr-2" />
            <Text className="text-zinc-900 dark:text-white font-mono tracking-widest text-[10px] uppercase">APPROVE</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-1 flex-row justify-center items-center py-2 rounded-md border border-dashed border-zinc-500"
            onPress={onReject}
          >
            <MaterialIcons name="close" size={14} color="#71717a" className="mr-2" />
            <Text className="text-zinc-600 dark:text-zinc-400 font-mono tracking-widest text-[10px] uppercase">REJECT</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
