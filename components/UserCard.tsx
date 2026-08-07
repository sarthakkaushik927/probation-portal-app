import { View, Text, TouchableOpacity } from 'react-native';
import { User } from '../types';
import { getDomainColor } from '../constants/domains';

interface UserCardProps {
  user: User;
  onPress?: () => void;
}

export default function UserCard({ user, onPress }: UserCardProps) {
  const domainColor = getDomainColor(user.domain);
  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-3 flex-row items-center"
      disabled={!onPress}
    >
      <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${user.domain ? domainColor : 'bg-gray-400'}`}>
        <Text className="text-white text-xl font-bold">{initial}</Text>
      </View>
      
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">{user.name || 'Unknown User'}</Text>
        <Text className="text-sm text-gray-500 dark:text-slate-400 mb-2">{user.email}</Text>
        <View className="flex-row gap-2">
          <View className="bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
            <Text className="text-gray-600 dark:text-slate-300 text-xs font-semibold">{user.role}</Text>
          </View>
          <View className={`${domainColor} px-2 py-0.5 rounded opacity-90`}>
            <Text className="text-white text-xs font-semibold">{user.domain || 'UNASSIGNED'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
