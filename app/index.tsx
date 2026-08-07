import { View, Text, TouchableOpacity } from "react-native";
import { Link, Redirect } from "expo-router";
import { useAuthStore } from "../store/auth";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { token, user } = useAuthStore();

  if (token && user) {
    if (user.role === 'ADMIN') return <Redirect href="/(admin)/dashboard" />;
    return <Redirect href="/(user)/dashboard" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center p-6">
        <View className="w-24 h-24 bg-blue-500 rounded-2xl mb-8 items-center justify-center shadow-lg shadow-blue-200">
          <Text className="text-zinc-900 dark:text-white text-5xl font-bold">P</Text>
        </View>
        
        <Text className="text-4xl font-bold text-gray-900 mb-2 text-center">
          Probation Portal
        </Text>
        <Text className="text-lg text-gray-500 mb-12 text-center">
          Track tasks, manage domains, and submit your work.
        </Text>

        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity className="w-full bg-blue-600 p-4 rounded-xl items-center mb-4 shadow-md shadow-blue-200">
            <Text className="text-zinc-900 dark:text-white text-lg font-bold">Get Started</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="w-full bg-gray-100 p-4 rounded-xl items-center border border-gray-200">
            <Text className="text-gray-900 text-lg font-bold">Log In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
