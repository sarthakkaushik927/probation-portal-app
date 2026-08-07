import { Stack } from 'expo-router';
import NotificationCenter from '../../components/NotificationCenter';
import { View } from 'react-native';
import Background from '../../components/Background';


export default function AdminNotifications() {
  return (
    <Background>
      <Stack.Screen options={{ title: 'Notifications', headerShown: true }} />
      <NotificationCenter />
    </Background>
  );
}
