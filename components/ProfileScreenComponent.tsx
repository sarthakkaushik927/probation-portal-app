import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useAuthStore } from '../store/auth';
import { useMutation } from '@tanstack/react-query';
import { updatePassword, updateAvatar } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function ProfileScreenComponent({ isDark }: { isDark: boolean }) {
  const { user, token, setAuth } = useAuthStore();
  const [avatar, setAvatar] = useState<string | null>(user?.avatarData || null);

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '' }
  });

  const avatarMutation = useMutation({
    mutationFn: async (base64: string) => {
      await updateAvatar(base64);
      return base64;
    },
    onSuccess: (newAvatar) => {
      if (user && token) {
        setAuth(token, { ...user, avatarData: newAvatar });
      }
      Alert.alert('Success', 'Profile photo updated!');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update profile photo.');
    }
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: { newPassword: string }) => {
      await updatePassword(data.newPassword);
    },
    onSuccess: () => {
      Alert.alert('Success', 'Password updated successfully!');
      passwordForm.reset();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update password.');
    }
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatar(base64Image);
      avatarMutation.mutate(base64Image);
    }
  };

  const iconColor = isDark ? '#ffffff' : '#000000';

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      
      {/* Avatar Section */}
      <View className="items-center mb-10 mt-4">
        <TouchableOpacity onPress={pickImage} disabled={avatarMutation.isPending} className="relative">
          <View className="w-32 h-32 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 border-[3px] border-black dark:border-white items-center justify-center">
            {avatar ? (
              <Image source={{ uri: avatar }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Text className="text-4xl font-bold font-sans text-zinc-900 dark:text-white uppercase">{user?.name?.charAt(0) || 'U'}</Text>
            )}
          </View>
          <View className="absolute bottom-0 right-0 bg-black dark:bg-white w-10 h-10 rounded-full items-center justify-center border-2 border-white dark:border-zinc-950">
            {avatarMutation.isPending ? (
              <ActivityIndicator size="small" color={isDark ? '#000000' : '#ffffff'} />
            ) : (
              <MaterialIcons name="edit" size={20} color={isDark ? '#000000' : '#ffffff'} />
            )}
          </View>
        </TouchableOpacity>
        <Text className="text-2xl font-bold font-sans text-zinc-900 dark:text-white mt-4">{user?.name}</Text>
        <Text className="text-sm font-sans text-zinc-500 dark:text-zinc-400">{user?.email}</Text>
        <View className="mt-2 px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-full border border-black dark:border-white">
          <Text className="text-xs font-bold font-mono text-zinc-900 dark:text-white tracking-widest uppercase">{user?.role}</Text>
        </View>
      </View>

      {/* Password Reset Section */}
      <View className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-3xl border-2 border-black dark:border-white mb-8">
        <Text className="text-lg font-bold font-sans text-zinc-900 dark:text-white mb-6">Security</Text>
        
        <View className="mb-6">
          <Text className="text-zinc-900 dark:text-white font-bold font-sans mb-2 ml-1 text-sm uppercase tracking-widest">New Password</Text>
          <Controller
            control={passwordForm.control}
            name="newPassword"
            render={({ field: { onChange, value } }) => (
              <View className={`h-14 bg-white dark:bg-zinc-950 border-2 rounded-xl flex-row items-center px-4 ${passwordForm.formState.errors.newPassword ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-800 focus:border-black dark:focus:border-white'}`}>
                <MaterialIcons name="lock" size={20} color="#71717a" className="mr-3" />
                <TextInput className="flex-1 text-zinc-900 dark:text-white font-sans text-base h-full outline-none" placeholder="••••••••" placeholderTextColor="#a1a1aa" secureTextEntry value={value} onChangeText={onChange} editable={!passwordMutation.isPending} />
              </View>
            )}
          />
          {passwordForm.formState.errors.newPassword && <Text className="text-red-500 text-sm mt-1 ml-1">{passwordForm.formState.errors.newPassword.message}</Text>}
        </View>

        <TouchableOpacity 
          className={`h-14 rounded-xl items-center justify-center flex-row border-2 border-black dark:border-white ${passwordMutation.isPending ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-black dark:bg-white'}`}
          onPress={passwordForm.handleSubmit((data) => passwordMutation.mutate(data))}
          disabled={passwordMutation.isPending}
        >
          {passwordMutation.isPending ? (
            <ActivityIndicator color={isDark ? '#000000' : '#ffffff'} />
          ) : (
            <Text className={`font-black uppercase tracking-widest text-xs ${isDark ? 'text-black' : 'text-white'}`}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
      <View className="h-20" />
    </ScrollView>
  );
}
