import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { useAuthStore } from '../store/auth';
import { useMutation } from '@tanstack/react-query';
import { updateProfile, changePassword, updateAvatar } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import GlassCard from './GlassCard';

export default function ProfileScreenComponent({ isDark }: { isDark: boolean }) {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();
  const [avatar, setAvatar] = useState<string | null>(user?.avatarData || null);
  const [name, setName] = useState(user?.name || '');
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{title: string, message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const avatarMutation = useMutation({
    mutationFn: async (base64: string) => {
      await updateAvatar(base64);
      return base64;
    },
    onSuccess: (newAvatar) => {
      if (user && token) {
        setAuth(token, { ...user, avatarData: newAvatar });
      }
      showToast('Success', 'Profile photo updated!');
    },
    onError: () => {
      showToast('Error', 'Failed to update profile photo.', 'error');
    }
  });

  const nameMutation = useMutation({
    mutationFn: async (newName: string) => {
      await updateProfile({ name: newName });
      return newName;
    },
    onSuccess: (newName) => {
      if (user && token) {
        setAuth(token, { ...user, name: newName });
      }
      setIsNameEditing(false);
      showToast('Success', 'Name updated successfully!');
    },
    onError: () => {
      showToast('Error', 'Failed to update name.', 'error');
    }
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      await changePassword(data.currentPassword, data.newPassword);
    },
    onSuccess: () => {
      showToast('Success', 'Password updated successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || 'Failed to update password.';
      showToast('Error', msg, 'error');
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

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      showToast('Error', 'Please fill in all fields.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Error', 'New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Error', 'New passwords do not match.', 'error');
      return;
    }
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          clearAuth();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  const iconColor = isDark ? '#ffffff' : '#000000';

  return (
    <>
      {toastMessage && (
        <Animated.View 
          entering={FadeInUp.springify()} 
          exiting={FadeOutUp.duration(300)}
          className="absolute top-12 left-5 right-5 z-50"
        >
          <GlassCard className="flex-row items-center p-4 border-2 border-black dark:border-white shadow-sm" intensity={90}>
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
      </View>

      {/* Profile Info Section */}
      <View className="mb-6">
        <GlassCard>
          <View className="p-5">
            <Text className="text-lg font-bold font-sans text-zinc-900 dark:text-white mb-5">Profile Information</Text>

            {/* Name */}
            <View className="mb-4">
              <Text className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">Name</Text>
              {isNameEditing ? (
                <View className="flex-row items-center gap-2">
                  <TextInput
                    className="flex-1 h-12 bg-white dark:bg-zinc-950 border-2 border-black dark:border-white rounded-xl px-4 text-zinc-900 dark:text-white font-sans"
                    value={name}
                    onChangeText={setName}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => nameMutation.mutate(name)} disabled={nameMutation.isPending} className="bg-black dark:bg-white px-4 h-12 rounded-xl items-center justify-center">
                    {nameMutation.isPending ? (
                      <ActivityIndicator size="small" color={isDark ? '#000' : '#fff'} />
                    ) : (
                      <MaterialIcons name="check" size={20} color={isDark ? '#000' : '#fff'} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setIsNameEditing(false); setName(user?.name || ''); }} className="h-12 px-3 items-center justify-center">
                    <MaterialIcons name="close" size={20} color={iconColor} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setIsNameEditing(true)} className="flex-row items-center justify-between h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl px-4 border border-zinc-200 dark:border-zinc-800">
                  <Text className="text-base font-sans text-zinc-900 dark:text-white">{user?.name || 'Not set'}</Text>
                  <MaterialIcons name="edit" size={16} color="#a1a1aa" />
                </TouchableOpacity>
              )}
            </View>

            {/* Email (read-only) */}
            <View className="mb-4">
              <Text className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">Email</Text>
              <View className="h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl px-4 justify-center border border-zinc-200 dark:border-zinc-800">
                <Text className="text-base font-sans text-zinc-500 dark:text-zinc-400">{user?.email}</Text>
              </View>
            </View>

            {/* Domain (read-only) */}
            <View className="mb-4">
              <Text className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">Domain</Text>
              <View className="h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl px-4 justify-center border border-zinc-200 dark:border-zinc-800">
                <Text className="text-base font-sans text-zinc-500 dark:text-zinc-400">{user?.domain || 'Not assigned'}</Text>
              </View>
            </View>

            {/* Role badge */}
            <View className="flex-row items-center gap-2">
              <Text className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Role</Text>
              <View className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-full border border-black dark:border-white">
                <Text className="text-xs font-bold font-mono text-zinc-900 dark:text-white tracking-widest uppercase">{user?.role}</Text>
              </View>
            </View>
          </View>
        </GlassCard>
      </View>

      {/* Security Section */}
      <View className="mb-6">
        <GlassCard>
          <View className="p-5">
            <Text className="text-lg font-bold font-sans text-zinc-900 dark:text-white mb-5">Security</Text>
            <TouchableOpacity
              className="h-14 rounded-xl items-center justify-center flex-row border-2 border-black dark:border-white bg-zinc-100 dark:bg-zinc-900"
              onPress={() => setShowPasswordModal(true)}
            >
              <MaterialIcons name="lock" size={20} color={iconColor} />
              <Text className="ml-2 font-bold font-sans text-zinc-900 dark:text-white">Change Password</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>

      {/* Logout */}
      <TouchableOpacity
        className="h-14 rounded-xl items-center justify-center flex-row bg-red-500 border-2 border-red-600 mb-8"
        onPress={handleLogout}
      >
        <MaterialIcons name="logout" size={20} color="#ffffff" />
        <Text className="ml-2 font-bold font-sans text-white uppercase tracking-widest text-xs">Logout</Text>
      </TouchableOpacity>

      <View className="h-24" />
    </ScrollView>

    {/* Change Password Modal */}
    <Modal visible={showPasswordModal} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-zinc-950 rounded-t-3xl p-6 border-t-2 border-black dark:border-white">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold font-sans text-zinc-900 dark:text-white">Change Password</Text>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <MaterialIcons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-xs font-bold font-mono text-zinc-500 uppercase tracking-widest mb-2">Current Password</Text>
            <TextInput
              className="h-14 bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-800 rounded-xl px-4 text-zinc-900 dark:text-white font-sans"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••••"
              placeholderTextColor="#a1a1aa"
            />
          </View>

          <View className="mb-4">
            <Text className="text-xs font-bold font-mono text-zinc-500 uppercase tracking-widest mb-2">New Password</Text>
            <TextInput
              className="h-14 bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-800 rounded-xl px-4 text-zinc-900 dark:text-white font-sans"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              placeholderTextColor="#a1a1aa"
            />
          </View>

          <View className="mb-6">
            <Text className="text-xs font-bold font-mono text-zinc-500 uppercase tracking-widest mb-2">Confirm New Password</Text>
            <TextInput
              className="h-14 bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-800 rounded-xl px-4 text-zinc-900 dark:text-white font-sans"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor="#a1a1aa"
            />
          </View>

          <TouchableOpacity
            className={`h-14 rounded-xl items-center justify-center border-2 border-black dark:border-white ${passwordMutation.isPending ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-black dark:bg-white'}`}
            onPress={handleChangePassword}
            disabled={passwordMutation.isPending}
          >
            {passwordMutation.isPending ? (
              <ActivityIndicator color={isDark ? '#000000' : '#ffffff'} />
            ) : (
              <Text className={`font-black uppercase tracking-widest text-xs ${isDark ? 'text-black' : 'text-white'}`}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}
