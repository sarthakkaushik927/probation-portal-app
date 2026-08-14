import { Stack } from 'expo-router';
import { View } from 'react-native';
import Background from '../../components/Background';
import ChatRoom from '../../components/ChatRoom';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export default function UserChatScreen() {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <Background>
      <Stack.Screen options={{ title: 'Global Chat', headerShown: true }} />
      <View style={{ flex: 1, paddingTop: 100, paddingBottom: tabBarHeight + 10 }}>
        <ChatRoom channel="global-chat" />
      </View>
    </Background>
  );
}
