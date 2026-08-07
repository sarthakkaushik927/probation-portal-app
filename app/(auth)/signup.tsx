import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { signup, sendOTP } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type SignupForm = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' }
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      const emailLower = data.email.trim().toLowerCase();
      // First signup the user
      await signup(data.name.trim(), emailLower, data.password);
      // Then send the OTP
      await sendOTP(emailLower);
      return emailLower;
    },
    onSuccess: (emailLower) => {
      Alert.alert('Success', 'Account created! Please check your email for the verification code.');
      router.push(`/(auth)/verify?email=${encodeURIComponent(emailLower)}`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || 'Signup failed. Please try again.';
      Alert.alert('Signup Error', msg);
    }
  });

  const onSubmit = (data: SignupForm) => {
    signupMutation.mutate(data);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <View className="mb-10">
            <Text className="text-4xl font-bold text-gray-900 mb-2">Create Account</Text>
            <Text className="text-lg text-gray-500">Join the Probation Portal today.</Text>
          </View>

          <View className="space-y-4 mb-8">
            <View>
              <Text className="text-gray-700 font-semibold mb-2 ml-1">Full Name</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`w-full bg-gray-50 p-4 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-200'} text-gray-900`}
                    placeholder="John Doe"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.name && <Text className="text-red-500 text-sm mt-1 ml-1">{errors.name.message}</Text>}
            </View>
            
            <View className="mt-4">
              <Text className="text-gray-700 font-semibold mb-2 ml-1">Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`w-full bg-gray-50 p-4 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} text-gray-900`}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.email && <Text className="text-red-500 text-sm mt-1 ml-1">{errors.email.message}</Text>}
            </View>

            <View className="mt-4">
              <Text className="text-gray-700 font-semibold mb-2 ml-1">Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`w-full bg-gray-50 p-4 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-200'} text-gray-900`}
                    placeholder="••••••••"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.password && <Text className="text-red-500 text-sm mt-1 ml-1">{errors.password.message}</Text>}
            </View>
          </View>

          <TouchableOpacity 
            className={`w-full p-4 rounded-xl items-center mb-6 shadow-sm ${signupMutation.isPending ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={handleSubmit(onSubmit)}
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? (
              <Text className="text-white text-lg font-bold">Creating Account...</Text>
            ) : (
              <Text className="text-white text-lg font-bold">Sign Up</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-500 text-base">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 font-bold text-base">Log In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
