import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useRouter } from 'expo-router';
import { getDomainColor } from '../../constants/domains';
import ThemeToggle from '../../components/ThemeToggle';

export default function UserLayout() {
  const clearAuth = useAuthStore(state => state.clearAuth);
  const user = useAuthStore(state => state.user);
  const router = useRouter();

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/(auth)/login');
  };

  const domainColorClass = getDomainColor(user?.domain || null);
  // Extract the color value for tinting tabs
  const getTintColor = () => {
    if (domainColorClass.includes('fuchsia')) return '#c026d3';
    if (domainColorClass.includes('green')) return '#22c55e';
    if (domainColorClass.includes('black')) return '#000000';
    if (domainColorClass.includes('indigo')) return '#6366f1';
    if (domainColorClass.includes('sky')) return '#38bdf8';
    if (domainColorClass.includes('purple')) return '#a855f7';
    return '#3b82f6';
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: getTintColor(),
        headerRight: () => (
          <View className="flex-row items-center gap-3 mr-4">
            <ThemeToggle />
            <TouchableOpacity onPress={handleLogout}>
              <MaterialIcons name="logout" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ),
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          headerShown: false,
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="submissions"
        options={{
          title: 'Submissions',
          headerShown: false,
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="send" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          headerShown: false,
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="calendar-today" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
