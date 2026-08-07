import { Stack } from 'expo-router';
import { View } from 'react-native';
import Background from '../../components/Background';
import ChatRoom from '../../components/ChatRoom';

export default function UserChatScreen() {
  return (
    <Background>
      <Stack.Screen options={{ title: 'Global Chat', headerShown: true }} />
      <View style={{ flex: 1, paddingTop: 100 }}>
        <ChatRoom channel="global-chat" />
      </View>
    </Background>
  );
}
