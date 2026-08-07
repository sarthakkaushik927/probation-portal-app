import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { verifyOTP, resendOTP } from '../../services/api';

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
    if (!otp) {
      Alert.alert('Error', 'Please enter the verification code');
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="mb-10">
          <Text className="text-4xl font-bold text-gray-900 mb-2">Verify Email</Text>
          <Text className="text-lg text-gray-500">We sent a verification code to {email}</Text>
        </View>

        <View className="mb-8">
          <Text className="text-gray-700 font-semibold mb-2 ml-1">Verification Code</Text>
          <TextInput
            className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-900 text-center text-2xl tracking-widest"
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
        </View>

        <TouchableOpacity 
          className={`w-full p-4 rounded-xl items-center mb-6 shadow-sm ${verifyMutation.isPending ? 'bg-blue-400' : 'bg-blue-600'}`}
          onPress={handleVerify}
          disabled={verifyMutation.isPending}
        >
          {verifyMutation.isPending ? (
            <Text className="text-white text-lg font-bold">Verifying...</Text>
          ) : (
            <Text className="text-white text-lg font-bold">Verify Account</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center items-center">
          <Text className="text-gray-500 text-base">Didn't receive the code? </Text>
          <TouchableOpacity 
            onPress={handleResend}
            disabled={timer > 0 || resendMutation.isPending}
          >
            <Text className={`font-bold text-base ${timer > 0 ? 'text-gray-400' : 'text-blue-600'}`}>
              {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
