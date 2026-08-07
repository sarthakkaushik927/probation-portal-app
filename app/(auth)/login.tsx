import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { login } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Background from '../../components/Background';
import GlassCard from '../../components/GlassCard';
import AnimatedLogo from '../../components/AnimatedLogo';
import ThemeToggle from '../../components/ThemeToggle';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => login(data.email.trim().toLowerCase(), data.password),
    onSuccess: async (res) => {
      if (res.data.success) {
        await setAuth(res.data.data.token, res.data.data.user);
        if (res.data.data.user.role === 'ADMIN') {
          router.replace('/(admin)/dashboard');
        } else {
          router.replace('/(user)/dashboard');
        }
      }
    },
    onError: (error: any) => {
      const msg = typeof error.response?.data?.error === 'string' ? error.response.data.error : 'Login failed. Please check your credentials.';
      Alert.alert('Login Error', msg);
    }
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <Background>
      <SafeAreaView className="flex-1">
        <View className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/50 dark:bg-black/30 rounded-full items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <ThemeToggle />
        </View>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
            <View className="items-center mb-10 mt-6">
              <AnimatedLogo size={100} />
              <View className="mt-6 items-center">
                <Text className="text-4xl font-black font-sans text-zinc-900 dark:text-white mb-2 tracking-tighter">Welcome Back</Text>
                <Text className="text-zinc-500 dark:text-zinc-400 font-sans text-lg">Log in to your account</Text>
              </View>
            </View>

            <GlassCard className="p-2 mb-8">
              <View>
                <View className="mb-4">
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className={`flex-row items-center bg-white/50 dark:bg-black/30 border ${errors.email ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-800'} rounded-2xl px-4 h-16`}>
                        <MaterialIcons name="email" size={22} color={errors.email ? "#ef4444" : "#71717a"} style={{ marginRight: 12 }} />
                        <TextInput
                          className="flex-1 text-zinc-900 dark:text-white font-sans text-base"
                          placeholder="Email address"
                          placeholderTextColor="#71717a"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      </View>
                    )}
                  />
                  {errors.email && <Text className="text-red-500 text-sm mt-1 ml-2 font-medium">{errors.email.message}</Text>}
                </View>

                <View className="mb-2">
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className={`flex-row items-center bg-white/50 dark:bg-black/30 border ${errors.password ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-800'} rounded-2xl px-4 h-16`}>
                        <MaterialIcons name="lock" size={22} color={errors.password ? "#ef4444" : "#71717a"} style={{ marginRight: 12 }} />
                        <TextInput
                          className="flex-1 text-zinc-900 dark:text-white font-sans text-base"
                          placeholder="Password"
                          placeholderTextColor="#71717a"
                          secureTextEntry
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      </View>
                    )}
                  />
                  {errors.password && <Text className="text-red-500 text-sm mt-1 ml-2 font-medium">{errors.password.message}</Text>}
                </View>

                <View className="items-end mt-1 mb-2">
                  <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password' as any)}>
                    <Text className="text-blue-600 dark:text-blue-400 font-sans font-semibold text-sm">Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  className={`h-16 rounded-2xl items-center justify-center flex-row shadow-sm mt-2 ${loginMutation.isPending ? 'bg-zinc-800' : 'bg-zinc-900 dark:bg-white'}`}
                  onPress={handleSubmit(onSubmit)}
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <ActivityIndicator color={loginMutation.isPending ? "#fff" : "#000"} />
                  ) : (
                    <>
                      <Text className="text-white dark:text-black font-bold font-sans text-lg mr-2">Sign In</Text>
                      <MaterialIcons name="arrow-forward" size={20} color="dark:text-black text-white" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </GlassCard>

            <View className="flex-row justify-center mt-4">
              <Text className="text-zinc-500 dark:text-zinc-400 font-sans text-base">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text className="text-blue-600 dark:text-blue-400 font-bold font-sans text-base">Sign up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Background>
  );
}
