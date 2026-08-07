import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Task } from '../types';
import { getDomainColor } from '../constants/domains';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const domainColor = getDomainColor(task.domain);
  const formattedDate = new Date(task.deadline).toLocaleDateString();

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-3"
      disabled={!onPress}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="flex-1 text-lg font-bold text-gray-900 dark:text-white mr-2" numberOfLines={1}>
          {task.title}
        </Text>
        <View className={`${domainColor} px-2 py-1 rounded-md`}>
          <Text className="text-white text-xs font-bold">{task.domain}</Text>
        </View>
      </View>
      
      <Text className="text-gray-600 dark:text-slate-300 text-sm mb-4" numberOfLines={2}>
        {task.description}
      </Text>
      
      <View className="flex-row items-center pt-3 border-t border-gray-50 dark:border-slate-700">
        <MaterialIcons name="event" size={16} color="#6b7280" />
        <Text className="text-gray-500 dark:text-slate-400 text-xs ml-1 font-medium">Due: {formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
}
