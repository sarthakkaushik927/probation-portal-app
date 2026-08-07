import { View, Text } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  colorClass?: string;
}

export default function StatCard({ title, value, icon, colorClass = "bg-blue-500" }: StatCardProps) {
  return (
    <View className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-3 w-full">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1 mr-2">
          <Text className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider leading-tight">
            {title}
          </Text>
        </View>
        {icon && (
          <View className={`p-2 rounded-full ${colorClass} bg-opacity-20`}>
            {icon}
          </View>
        )}
      </View>
      <Text className="text-3xl font-bold text-gray-900 dark:text-white">{value}</Text>
    </View>
  );
}
