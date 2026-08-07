import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';

export default function AttendanceLayout() {
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
          title: 'My Attendance',
          headerTitleAlign: 'center',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
