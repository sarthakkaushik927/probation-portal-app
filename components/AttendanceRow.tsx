import { View, Text, TouchableOpacity } from 'react-native';
import { User, AttendanceStatus } from '../types';
import DomainSwatch from './DomainSwatch';

interface AttendanceRowProps {
  user: User;
  status: AttendanceStatus | null;
  onStatusChange: (userId: string, status: AttendanceStatus) => void;
}

export default function AttendanceRow({ user, status, onStatusChange }: AttendanceRowProps) {

  const StatusButton = ({ type, label, borderStyle }: { type: AttendanceStatus, label: string, borderStyle: string }) => {
    const isActive = status === type;
    return (
      <TouchableOpacity
        onPress={() => onStatusChange(user.id, type)}
        className={`flex-1 py-3 items-center justify-center border-t-2 border-l-2 border-black dark:border-white ${isActive ? 'bg-black dark:bg-white' : 'bg-white dark:bg-zinc-950'}`}
      >
        <Text className={`text-[10px] uppercase tracking-widest font-black ${isActive ? 'text-white dark:text-black' : 'text-zinc-500 dark:text-zinc-400'}`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-white dark:bg-zinc-950 border-2 border-black dark:border-white mb-4 overflow-hidden rounded-xl">
      <View className="p-4 flex-row items-center border-b-2 border-black dark:border-white bg-zinc-100 dark:bg-zinc-900">
        <View className="flex-1">
          <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-1">{user.name || 'Unknown'}</Text>
          <View className="flex-row items-center">
            <View className="relative w-3 h-3 rounded-full mr-2 border border-black dark:border-white bg-white dark:bg-zinc-950 overflow-hidden">
              {user.domain && <DomainSwatch domain={user.domain} size={12} className="absolute inset-0" />}
            </View>
            <Text className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-300">{user.domain || 'UNASSIGNED'}</Text>
          </View>
        </View>
      </View>
      
      <View className="flex-row">
        <StatusButton type="PRESENT" label="PRESENT" borderStyle="" />
        <StatusButton type="ABSENT" label="ABSENT" borderStyle="" />
        <StatusButton type="LEAVE" label="LEAVE" borderStyle="" />
      </View>
    </View>
  );
}
