import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Submission } from '../types';
import * as Linking from 'expo-linking';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';
import { Image } from 'expo-image';

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

  const openLink = (url: string) => {
    if (!url) return;
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    Linking.openURL(formattedUrl).catch(err => console.error("An error occurred", err));
  };

  const isLate = Boolean(submission.task?.deadline) && new Date(submission.createdAt) > new Date(submission.task!.deadline!);

  return (
    <View className="rounded-xl border-[3px] border-black dark:border-white mb-4 overflow-hidden relative">
      <BlurView tint={isDark ? "dark" : "light"} intensity={40} style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.1)' : 'rgba(255, 255, 255, 0.2)' }]} />
      
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
            <View className="flex-row items-center">
              <Text className="text-lg font-bold font-sans text-zinc-900 dark:text-white flex-1" numberOfLines={1}>
                {submission.task?.title || 'Unknown Task'}
              </Text>
              {Boolean(isLate) ? (
                <View className="bg-red-600 dark:bg-red-500 px-1.5 py-0.5 rounded ml-2 shadow-sm">
                  <Text className="text-white font-black text-[9px] tracking-widest uppercase">LATE</Text>
                </View>
              ) : null}
            </View>
            <View className="flex-row items-center mt-0.5">
              {submission.user?.avatarData ? (
                <Image source={{ uri: submission.user.avatarData }} style={{ width: 16, height: 16, borderRadius: 8, marginRight: 4 }} />
              ) : (
                <MaterialIcons name="person" size={14} color="#71717a" style={{ marginRight: 4 }} />
              )}
              <Text className="text-xs font-mono text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">
                {submission.user?.name || 'Unknown User'}
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#A1A1AA" />
        </View>

        <View className="flex-col mt-2 gap-2 mb-3">
          <TouchableOpacity 
            className="flex-row items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg"
            onPress={() => openLink(submission.githubLink)}
          >
            <MaterialIcons name="code" size={18} color={isDark ? '#FFFFFF' : '#000000'} style={{ marginRight: 10 }} />
            <View className="flex-1">
              <Text className="text-zinc-900 dark:text-white font-mono text-[10px] font-bold uppercase tracking-widest">GitHub</Text>
              <Text className="text-blue-500 dark:text-blue-400 text-xs mt-0.5" numberOfLines={1}>{submission.githubLink}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-row items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg"
            onPress={() => openLink(submission.demoLink)}
          >
            <MaterialIcons name="link" size={18} color={isDark ? '#FFFFFF' : '#000000'} style={{ marginRight: 10 }} />
            <View className="flex-1">
              <Text className="text-zinc-900 dark:text-white font-mono text-[10px] font-bold uppercase tracking-widest">Demo</Text>
              <Text className="text-blue-500 dark:text-blue-400 text-xs mt-0.5" numberOfLines={1}>{submission.demoLink}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {submission.remarks ? (
          <View className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg border border-[#333]">
            <Text className="text-zinc-500 dark:text-zinc-400 font-sans text-sm font-medium leading-relaxed">"{submission.remarks}"</Text>
          </View>
        ) : null}
      </TouchableOpacity>


    </View>
  );
}
