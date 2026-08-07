import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { verifyOTP, resendOTP } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Background from '../../components/Background';
import GlassCard from '../../components/GlassCard';
import AnimatedLogo from '../../components/AnimatedLogo';
import ThemeToggle from '../../components/ThemeToggle';

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const router = useRouter();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const verifyMutation = useMutation({
    mutationFn: () => verifyOTP(email, otp),
    onSuccess: () => {
      Alert.alert('Success', 'Email verified successfully! You can now log in.');
      router.replace('/(auth)/login');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || 'Verification failed. Invalid or expired OTP.';
      Alert.alert('Error', msg);
    }
  });

  const resendMutation = useMutation({
    mutationFn: () => resendOTP(email),
    onSuccess: () => {
      Alert.alert('OTP Sent', 'A new verification code has been sent to your email.');
      setTimer(60);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || 'Failed to resend OTP.';
      Alert.alert('Error', msg);
    }
  });

  const handleVerify = () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }
    verifyMutation.mutate();
  };

  const handleResend = () => {
    if (timer === 0) {
      resendMutation.mutate();
    }
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
                <Text className="text-4xl font-black font-sans text-zinc-900 dark:text-white mb-2 tracking-tighter text-center">Verify Email</Text>
                <Text className="text-zinc-500 dark:text-zinc-400 font-sans text-lg text-center">We sent a code to {email}</Text>
              </View>
            </View>

            <GlassCard className="p-2 mb-8">
              <View>
                <View className="mb-4">
                  <View className={`flex-row items-center bg-white/50 dark:bg-black/30 border border-zinc-300 dark:border-zinc-800 rounded-2xl px-4 h-16`}>
                    <MaterialIcons name="security" size={22} color="#71717a" style={{ marginRight: 12 }} />
                    <TextInput
                      className="flex-1 text-zinc-900 dark:text-white font-sans text-2xl tracking-[0.5em] text-center"
                      placeholder="••••••"
                      placeholderTextColor="#71717a"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={otp}
                      onChangeText={setOtp}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  className={`h-16 rounded-2xl items-center justify-center flex-row shadow-sm mt-4 ${verifyMutation.isPending ? 'bg-zinc-800' : 'bg-zinc-900 dark:bg-white'}`}
                  onPress={handleVerify}
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? (
                    <ActivityIndicator color={verifyMutation.isPending ? "#fff" : "#000"} />
                  ) : (
                    <>
                      <Text className="text-white dark:text-black font-bold font-sans text-lg mr-2">Verify Account</Text>
                      <MaterialIcons name="check-circle" size={20} color="dark:text-black text-white" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </GlassCard>

            <View className="flex-row justify-center mt-4">
              <Text className="text-zinc-500 dark:text-zinc-400 font-sans text-base">Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResend} disabled={timer > 0 || resendMutation.isPending}>
                <Text className={`font-bold font-sans text-base ${timer > 0 ? 'text-zinc-400 dark:text-zinc-600' : 'text-blue-600 dark:text-blue-400'}`}>
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Background>
  );
}
