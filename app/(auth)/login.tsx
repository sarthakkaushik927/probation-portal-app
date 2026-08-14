import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
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
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string; type: 'success' | 'error' | 'default' } | null>(null);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'default' = 'default') => {
    setToastMessage({ title, message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => login(data.email.trim().toLowerCase(), data.password),
    onSuccess: async (res) => {
      if (res.data.success) {
        showToast('Success', 'Login successful!', 'success');
        await setAuth(res.data.data.token, res.data.data.user);
      }
    },
    onError: (error: any) => {
      const msg = typeof error.response?.data?.error === 'string' ? error.response.data.error : 'Login failed. Please check your credentials.';
      showToast('Login Error', msg, 'error');
    }
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <Background>
      <SafeAreaView className="flex-1">
        {toastMessage && (
          <Animated.View 
            entering={FadeInUp.springify()} 
            exiting={FadeOutUp.duration(300)}
            className="absolute top-12 left-5 right-5 z-[999]"
            style={{ elevation: 99 }}
          >
            <GlassCard className={`flex-row items-center p-4 border-2 shadow-sm ${toastMessage.type === 'success' ? 'border-green-500' : toastMessage.type === 'error' ? 'border-red-500' : 'border-black dark:border-white'}`} intensity={90}>
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 border-2 ${toastMessage.type === 'success' ? 'border-green-500 bg-green-500/20' : 'border-red-500 bg-red-500/20'}`}>
                <MaterialIcons name={toastMessage.type === 'success' ? 'check' : 'error-outline'} size={24} color={toastMessage.type === 'success' ? '#10b981' : '#ef4444'} />
              </View>
              <View className="flex-1">
                <Text className="text-zinc-900 dark:text-white font-bold font-sans text-base">{toastMessage.title}</Text>
                <Text className="text-zinc-500 dark:text-zinc-400 font-sans text-sm">{toastMessage.message}</Text>
              </View>
            </GlassCard>
          </Animated.View>
        )}
        <View className="absolute top-12 right-6 z-50 w-12 h-12 bg-white/50 dark:bg-black/30 rounded-full items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <ThemeToggle />
        </View>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 100 }}>
            <View className="items-center mb-8 mt-10">
              <AnimatedLogo />
              <Text className="text-zinc-500 dark:text-zinc-400 font-sans text-xs text-center px-6 mt-2 mb-6 leading-relaxed">
                The ultimate portal for seamless collaboration, task management, and domain tracking.
              </Text>
              
              <View className="mt-2 items-center">
                <Text className="text-2xl font-bold font-sans text-zinc-900 dark:text-white mb-1 tracking-tight">Welcome Back</Text>
                <Text className="text-zinc-500 dark:text-zinc-400 font-sans text-sm">Log in to continue</Text>
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
        <View className="absolute bottom-2 right-4 pointer-events-none">
          <Text className="text-zinc-400 dark:text-zinc-600 text-xs font-sans font-medium">v1.4.3</Text>
        </View>
      </SafeAreaView>
    </Background>
  );
}
