import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';

export default function TasksLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#09090b',
        },
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'My Tasks',
          headerTitleAlign: 'center',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[taskId]"
        options={{
          title: 'Task Details',
          headerTitleAlign: 'center',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
