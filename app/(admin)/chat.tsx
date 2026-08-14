import { Stack } from 'expo-router';
import { View } from 'react-native';
import Background from '../../components/Background';
import ChatRoom from '../../components/ChatRoom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminChatScreen() {
  const insets = useSafeAreaInsets();
  const customTabBarHeight = Math.max(insets.bottom + 10, 24) + 72 + 20;

  return (
    <Background>
      <Stack.Screen options={{ title: 'Global Chat', headerShown: true }} />
      <View style={{ flex: 1, paddingTop: 100, paddingBottom: customTabBarHeight }}>
        <ChatRoom channel="global-chat" />
      </View>
    </Background>
  );
}
