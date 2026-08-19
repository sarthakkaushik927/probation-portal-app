import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, TouchableOpacity, Keyboard, Platform, KeyboardAvoidingView } from 'react-native';
import { useState, useEffect } from 'react';
import DiscussionThread from '../../../components/DiscussionThread';
import Background from '../../../components/Background';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DiscussionScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { submissionId } = useLocalSearchParams<{ submissionId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const customTabBarHeight = Math.max(insets.bottom + 10, 24) + 60 + 20;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const content = (
    <View className="flex-1 px-2 pb-2">
      <DiscussionThread submissionId={submissionId} fullScreen={true} />
    </View>
  );

  return (
    <Background>
      <Stack.Screen options={{ 
        title: 'Discussion', 
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} className="mr-4 ml-1">
            <MaterialIcons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        )
      }} />
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView 
          style={{ flex: 1, paddingTop: 100, paddingBottom: customTabBarHeight }}
          behavior="padding"
          keyboardVerticalOffset={90}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1, paddingTop: 100, paddingBottom: isKeyboardVisible ? 0 : customTabBarHeight }}>
          {content}
        </View>
      )}
    </Background>
  );
}
