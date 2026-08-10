import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, TouchableOpacity, Text, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import DiscussionThread from '../../../components/DiscussionThread';
import Background from '../../../components/Background';
import { MaterialIcons } from '@expo/vector-icons';
import GlassCard from '../../../components/GlassCard';
import { useColorScheme } from 'nativewind';

export default function DiscussionScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { submissionId } = useLocalSearchParams<{ submissionId: string }>();
  const router = useRouter();

  return (
    <Background>
      <Stack.Screen options={{ 
        title: 'Discussion', 
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.replace(`/(admin)/submissions/${submissionId}` as any)} className="mr-4 ml-1">
            <MaterialIcons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        )
      }} />
      <View style={{ flex: 1, paddingTop: 100, paddingBottom: 10 }}>
        <KeyboardAvoidingView 
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
          className="flex-1 px-2 pb-2"
        >
          <DiscussionThread submissionId={submissionId} fullScreen={true} />
        </KeyboardAvoidingView>
      </View>
    </Background>
  );
}
