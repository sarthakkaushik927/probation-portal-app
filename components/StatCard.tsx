import { View, Text } from 'react-native';
import GlassCard from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  colorClass?: string;
}

export default function StatCard({ title, value, icon, colorClass = "bg-blue-500" }: StatCardProps) {
  return (
    <View className="mb-3 w-full">
      <GlassCard className="p-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1 mr-2">
            <Text className="text-zinc-500 dark:text-zinc-400 font-mono text-xs font-bold uppercase tracking-wider leading-tight">
              {title}
            </Text>
          </View>
          {icon && (
            <View className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white">
              {icon}
            </View>
          )}
        </View>
        <Text className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">{value}</Text>
      </GlassCard>
    </View>
  );
}
