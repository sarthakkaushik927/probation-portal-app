import { View, Text, TouchableOpacity } from 'react-native';
import { Submission } from '../types';
import * as Linking from 'expo-linking';
import { MaterialIcons } from '@expo/vector-icons';

interface SubmissionCardProps {
  submission: Submission;
  onPress?: () => void;
  isAdmin?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

export default function SubmissionCard({ submission, onPress, isAdmin, onApprove, onReject }: SubmissionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const statusStyle = getStatusColor(submission.status);

  return (
    <View className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-3 overflow-hidden">
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={onPress}
        disabled={!onPress}
        className="p-4"
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-0.5">
              {submission.user?.name || 'Unknown User'}
            </Text>
            <Text className="text-lg font-bold text-gray-900 dark:text-white" numberOfLines={1}>
              {submission.task?.title || 'Unknown Task'}
            </Text>
          </View>
          <View className={`px-2 py-1 rounded border ${statusStyle.split(' ').slice(0, 3).join(' ')}`}>
            <Text className={`text-xs font-bold ${statusStyle.split(' ')[1]}`}>{submission.status}</Text>
          </View>
        </View>

        <View className="flex-row mt-2 gap-3">
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => Linking.openURL(submission.githubLink)}
          >
            <MaterialIcons name="code" size={16} color="#3b82f6" />
            <Text className="text-blue-500 dark:text-blue-400 text-sm font-medium ml-1">GitHub</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => Linking.openURL(submission.demoLink)}
          >
            <MaterialIcons name="link" size={16} color="#3b82f6" />
            <Text className="text-blue-500 dark:text-blue-400 text-sm font-medium ml-1">Demo</Text>
          </TouchableOpacity>
        </View>
        
        {submission.remarks && (
          <View className="mt-3 bg-gray-50 dark:bg-slate-700 p-2 rounded border border-gray-100 dark:border-slate-600">
            <Text className="text-gray-600 dark:text-slate-300 text-sm italic">"{submission.remarks}"</Text>
          </View>
        )}
      </TouchableOpacity>

      {isAdmin && submission.status === 'PENDING' && (
        <View className="flex-row border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
          <TouchableOpacity 
            className="flex-1 py-3 items-center border-r border-gray-100 dark:border-slate-700"
            onPress={onReject}
          >
            <Text className="text-red-500 font-bold">REJECT</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-1 py-3 items-center"
            onPress={onApprove}
          >
            <Text className="text-green-600 dark:text-green-400 font-bold">APPROVE</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
