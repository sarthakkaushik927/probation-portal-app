import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword, resetPassword } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const resetSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [savedEmail, setSavedEmail] = useState('');

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' }
  });

  const resetForm = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: '', newPassword: '' }
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const emailLower = data.email.trim().toLowerCase();
      await forgotPassword(emailLower);
      return emailLower;
    },
    onSuccess: (emailLower) => {
      setSavedEmail(emailLower);
      setStep(2);
      Alert.alert('Success', 'OTP sent to your email.');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || 'Failed to send OTP.';
      Alert.alert('Error', msg);
    }
  });

  const resetMutation = useMutation({
    mutationFn: async (data: { otp: string, newPassword: string }) => {
      await resetPassword(savedEmail, data.otp.trim(), data.newPassword);
    },
    onSuccess: () => {
      Alert.alert('Success', 'Password reset successfully! You can now log in.');
      router.replace('/(auth)/login');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || 'Failed to reset password.';
      Alert.alert('Error', msg);
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white rounded-full items-center justify-center mb-6">
              <MaterialIcons name="lock-reset" size={40} color="#000000" style={{ color: 'gray' }} />
            </View>
            <Text className="text-3xl font-bold font-sans text-zinc-900 dark:text-white mb-2 tracking-tight">Reset Password</Text>
            <Text className="text-zinc-500 dark:text-zinc-400 text-center font-sans">
              {step === 1 ? 'Enter your email to receive a reset code.' : 'Enter the code and your new password.'}
            </Text>
          </View>

          {step === 1 ? (
            <View className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-3xl border-2 border-black dark:border-white">
              <View className="mb-6">
                <Text className="text-zinc-900 dark:text-white font-bold font-sans mb-2 ml-1 text-sm uppercase tracking-widest">Email Address</Text>
                <Controller
                  control={emailForm.control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <View className={`h-14 bg-white dark:bg-zinc-950 border-2 rounded-xl flex-row items-center px-4 ${emailForm.formState.errors.email ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-800 focus:border-black dark:focus:border-white'}`}>
                      <MaterialIcons name="email" size={20} color="#71717a" className="mr-3" />
                      <TextInput className="flex-1 text-zinc-900 dark:text-white font-sans text-base h-full outline-none" placeholder="john@example.com" placeholderTextColor="#a1a1aa" autoCapitalize="none" keyboardType="email-address" value={value} onChangeText={onChange} editable={!sendOtpMutation.isPending} />
                    </View>
                  )}
                />
                {emailForm.formState.errors.email && <Text className="text-red-500 text-sm mt-1 ml-1">{emailForm.formState.errors.email.message}</Text>}
              </View>

              <TouchableOpacity className={`h-14 rounded-xl items-center justify-center flex-row ${sendOtpMutation.isPending ? 'bg-zinc-800' : 'bg-black dark:bg-white'}`} onPress={emailForm.handleSubmit((data) => sendOtpMutation.mutate(data))} disabled={sendOtpMutation.isPending}>
                {sendOtpMutation.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-white dark:text-black font-bold font-sans text-base mr-2">Send Code</Text>
                    <MaterialIcons name="send" size={18} color="#ffffff" style={{ color: 'white' }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-3xl border-2 border-black dark:border-white">
              <View className="mb-4">
                <Text className="text-zinc-900 dark:text-white font-bold font-sans mb-2 ml-1 text-sm uppercase tracking-widest">Reset Code</Text>
                <Controller
                  control={resetForm.control}
                  name="otp"
                  render={({ field: { onChange, value } }) => (
                    <View className={`h-14 bg-white dark:bg-zinc-950 border-2 rounded-xl flex-row items-center px-4 ${resetForm.formState.errors.otp ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-800 focus:border-black dark:focus:border-white'}`}>
                      <MaterialIcons name="pin" size={20} color="#71717a" className="mr-3" />
                      <TextInput className="flex-1 text-zinc-900 dark:text-white font-mono text-base h-full outline-none tracking-widest" placeholder="123456" placeholderTextColor="#a1a1aa" keyboardType="number-pad" value={value} onChangeText={onChange} editable={!resetMutation.isPending} />
                    </View>
                  )}
                />
                {resetForm.formState.errors.otp && <Text className="text-red-500 text-sm mt-1 ml-1">{resetForm.formState.errors.otp.message}</Text>}
              </View>

              <View className="mb-6">
                <Text className="text-zinc-900 dark:text-white font-bold font-sans mb-2 ml-1 text-sm uppercase tracking-widest">New Password</Text>
                <Controller
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field: { onChange, value } }) => (
                    <View className={`h-14 bg-white dark:bg-zinc-950 border-2 rounded-xl flex-row items-center px-4 ${resetForm.formState.errors.newPassword ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-800 focus:border-black dark:focus:border-white'}`}>
                      <MaterialIcons name="lock" size={20} color="#71717a" className="mr-3" />
                      <TextInput className="flex-1 text-zinc-900 dark:text-white font-sans text-base h-full outline-none" placeholder="••••••••" placeholderTextColor="#a1a1aa" secureTextEntry value={value} onChangeText={onChange} editable={!resetMutation.isPending} />
                    </View>
                  )}
                />
                {resetForm.formState.errors.newPassword && <Text className="text-red-500 text-sm mt-1 ml-1">{resetForm.formState.errors.newPassword.message}</Text>}
              </View>

              <TouchableOpacity className={`h-14 rounded-xl items-center justify-center flex-row ${resetMutation.isPending ? 'bg-zinc-800' : 'bg-black dark:bg-white'}`} onPress={resetForm.handleSubmit((data) => resetMutation.mutate(data))} disabled={resetMutation.isPending}>
                {resetMutation.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-white dark:text-black font-bold font-sans text-base mr-2">Reset Password</Text>
                    <MaterialIcons name="check" size={18} color="#ffffff" style={{ color: 'white' }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row justify-center mt-8">
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="text-zinc-900 dark:text-white font-bold font-sans">Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
