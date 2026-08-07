import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { signup, sendOTP } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Background from '../../components/Background';
import GlassCard from '../../components/GlassCard';

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
      router.push(`/(auth)/verify?email=${encodeURIComponent(emailLower)}` as any);
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
    <Background>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
            <View className="items-center mb-8">
              <View className="w-24 h-24 bg-white/10 dark:bg-black/20 rounded-[32px] items-center justify-center mb-6 border border-black/10 dark:border-white/10 shadow-sm overflow-hidden">
                <GlassCard intensity={80} className="w-full h-full absolute top-0 left-0 border-0 rounded-[32px]" />
                <View className="absolute z-10 w-full h-full items-center justify-center">
                  <MaterialIcons name="person-add" size={48} color="#a855f7" />
                </View>
              </View>
              <Text className="text-4xl font-black font-sans text-zinc-900 dark:text-white mb-2 tracking-tighter">Create Account</Text>
              <Text className="text-zinc-500 dark:text-zinc-400 font-sans text-lg">Join the probation portal</Text>
            </View>

            <GlassCard className="p-2 mb-8">
              <View>
                <View className="mb-4">
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className={`flex-row items-center bg-white/50 dark:bg-black/30 border ${errors.name ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-800'} rounded-2xl px-4 h-16`}>
                        <MaterialIcons name="person" size={22} color={errors.name ? "#ef4444" : "#71717a"} style={{ marginRight: 12 }} />
                        <TextInput
                          className="flex-1 text-zinc-900 dark:text-white font-sans text-base"
                          placeholder="Full Name"
                          placeholderTextColor="#71717a"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      </View>
                    )}
                  />
                  {errors.name && <Text className="text-red-500 text-sm mt-1 ml-2 font-medium">{errors.name.message}</Text>}
                </View>
                
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

                <TouchableOpacity 
                  className={`h-16 rounded-2xl items-center justify-center flex-row shadow-sm mt-4 ${signupMutation.isPending ? 'bg-zinc-800' : 'bg-zinc-900 dark:bg-white'}`}
                  onPress={handleSubmit(onSubmit)}
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? (
                    <ActivityIndicator color={signupMutation.isPending ? "#fff" : "#000"} />
                  ) : (
                    <>
                      <Text className="text-white dark:text-black font-bold font-sans text-lg mr-2">Create Account</Text>
                      <MaterialIcons name="arrow-forward" size={20} color="dark:text-black text-white" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </GlassCard>

            <View className="flex-row justify-center mt-4">
              <Text className="text-zinc-500 dark:text-zinc-400 font-sans text-base">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 dark:text-blue-400 font-bold font-sans text-base">Log In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Background>
  );
}
