import { Stack } from 'expo-router';
import { View, Keyboard } from 'react-native';
import { useState, useEffect } from 'react';
import Background from '../../components/Background';
import ChatRoom from '../../components/ChatRoom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UserChatScreen() {
  const insets = useSafeAreaInsets();
  const customTabBarHeight = Math.max(insets.bottom + 10, 24) + 60 + 20;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <Background>
      <Stack.Screen options={{ title: 'Global Chat', headerShown: true }} />
      <View style={{ flex: 1, paddingTop: 100, paddingBottom: isKeyboardVisible ? 0 : customTabBarHeight }}>
        <ChatRoom channel="global-chat" />
      </View>
    </Background>
  );
}
