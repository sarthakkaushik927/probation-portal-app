import { Drawer } from 'expo-router/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useRouter } from 'expo-router';
import ThemeToggle from '../../components/ThemeToggle';

export default function AdminLayout() {
  const clearAuth = useAuthStore(state => state.clearAuth);
  const router = useRouter();

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/(auth)/login');
  };

  return (
    <Drawer
      screenOptions={{
        headerRight: () => (
          <View className="flex-row items-center gap-3 mr-4">
            <ThemeToggle />
            <TouchableOpacity onPress={handleLogout}>
              <MaterialIcons name="logout" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ),
      }}>
      <Drawer.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="users/index"
        options={{
          title: 'Users',
          drawerIcon: ({ color }) => <MaterialIcons name="people" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="users/[userId]"
        options={{
          drawerItemStyle: { display: 'none' }, // Hide from drawer
          headerTitle: 'User Detail',
        }}
      />
      <Drawer.Screen
        name="tasks/index"
        options={{
          title: 'Tasks',
          drawerIcon: ({ color }) => <MaterialIcons name="assignment" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="tasks/create"
        options={{
          drawerItemStyle: { display: 'none' },
          headerTitle: 'Create Task',
        }}
      />
      <Drawer.Screen
        name="tasks/[taskId]"
        options={{
          drawerItemStyle: { display: 'none' },
          headerTitle: 'Edit Task',
        }}
      />
      <Drawer.Screen
        name="submissions/index"
        options={{
          title: 'Submissions',
          drawerIcon: ({ color }) => <MaterialIcons name="inbox" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="submissions/[submissionId]"
        options={{
          drawerItemStyle: { display: 'none' },
          headerTitle: 'Review Submission',
        }}
      />
      <Drawer.Screen
        name="attendance/index"
        options={{
          title: 'Attendance',
          drawerIcon: ({ color }) => <MaterialIcons name="event-available" size={24} color={color} />,
        }}
      />
    </Drawer>
  );
}
