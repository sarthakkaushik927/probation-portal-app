import { View, Text, TouchableOpacity } from 'react-native';
import { User, AttendanceStatus } from '../types';
import { getDomainColor } from '../constants/domains';

interface AttendanceRowProps {
  user: User;
  status: AttendanceStatus | null;
  onStatusChange: (userId: string, status: AttendanceStatus) => void;
}

export default function AttendanceRow({ user, status, onStatusChange }: AttendanceRowProps) {
  const domainColor = getDomainColor(user.domain);

  const StatusButton = ({ type, label, colorClass }: { type: AttendanceStatus, label: string, colorClass: string }) => {
    const isActive = status === type;
    return (
      <TouchableOpacity
        onPress={() => onStatusChange(user.id, type)}
        className={`flex-1 py-2 items-center justify-center border-l border-gray-100 dark:border-slate-700 ${isActive ? colorClass : 'bg-gray-50 dark:bg-slate-700'}`}
      >
        <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-400 dark:text-slate-400'}`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-3 overflow-hidden">
      <View className="p-4 flex-row items-center border-b border-gray-100 dark:border-slate-700">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-0.5">{user.name || 'Unknown'}</Text>
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full ${user.domain ? domainColor : 'bg-gray-400'} mr-1`} />
            <Text className="text-xs text-gray-500 dark:text-slate-400">{user.domain || 'UNASSIGNED'}</Text>
          </View>
        </View>
      </View>
      
      <View className="flex-row">
        <StatusButton type="PRESENT" label="PRESENT" colorClass="bg-green-500" />
        <StatusButton type="ABSENT" label="ABSENT" colorClass="bg-red-500" />
        <StatusButton type="LEAVE" label="LEAVE" colorClass="bg-yellow-500" />
      </View>
    </View>
  );
}
