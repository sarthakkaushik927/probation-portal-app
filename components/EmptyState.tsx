import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export default function EmptyState({ title, message, icon = 'inbox' }: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center p-8 mt-10">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <MaterialIcons name={icon} size={40} color="#9ca3af" />
      </View>
      <Text className="text-xl font-semibold text-gray-800 mb-2 text-center">{title}</Text>
      {message && (
        <Text className="text-gray-500 text-center">{message}</Text>
      )}
    </View>
  );
}
