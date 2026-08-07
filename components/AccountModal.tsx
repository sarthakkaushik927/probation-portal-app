import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Easing, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import GlassCard from './GlassCard';
import { Image } from 'expo-image';

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AccountModal({ visible, onClose }: AccountModalProps) {
  const user = useAuthStore(state => state.user);
  const clearAuth = useAuthStore(state => state.clearAuth);
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  const [confirmLogout, setConfirmLogout] = useState(false);
  const confirmFadeAnim = useRef(new Animated.Value(0)).current;

  // ASMR Animation - Smooth, long durations with satisfying easing
  const asmrEasing = Easing.bezier(0.25, 1, 0.25, 1); // Extra smooth decelerating curve

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: asmrEasing,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          easing: asmrEasing,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ]).start(() => setConfirmLogout(false));
    }
  }, [visible]);

  useEffect(() => {
    if (confirmLogout) {
      Animated.timing(confirmFadeAnim, {
        toValue: 1,
        duration: 400,
        easing: asmrEasing,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(confirmFadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [confirmLogout]);

  const handleClose = () => {
    onClose();
  };

  const handleLogoutPress = () => {
    setConfirmLogout(true);
  };

  const executeLogout = async () => {
    handleClose();
    setTimeout(async () => {
      await clearAuth();
      router.replace('/(auth)/login');
    }, 400); // Wait for fade out
  };

  if (!visible && fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) as any === 0) {
    return null; // Don't render when fully closed
  }

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        
        <View className="flex-1 justify-center items-center px-4" pointerEvents="box-none">
          <Animated.View 
            style={{ 
              transform: [{ scale: scaleAnim }],
              width: '100%',
              maxWidth: 400,
            }}
            pointerEvents="box-none"
          >
            <GlassCard className="rounded-2xl border-2 border-black dark:border-white p-6 relative">
              <TouchableOpacity 
                onPress={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full items-center justify-center bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white"
              >
                <MaterialIcons name="close" size={16} color={isDark ? "#ffffff" : "#000000"} />
              </TouchableOpacity>
                
                {/* Account Details */}
                <View className="items-center mb-8 mt-2">
                  <View className="w-20 h-20 rounded-full border border-black dark:border-white bg-zinc-100 dark:bg-zinc-900 items-center justify-center mb-4 overflow-hidden">
                    {user?.avatarData ? (
                      <Image source={{ uri: user.avatarData }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    ) : (
                      <Text className="text-3xl font-bold font-sans text-zinc-900 dark:text-white">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </Text>
                    )}
                  </View>
                  <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{user?.name || 'User'}</Text>
                  <Text className="text-xs font-mono tracking-widest uppercase text-zinc-600 dark:text-zinc-400">
                    {user?.domain || 'UNASSIGNED'} • {user?.role || 'MEMBER'}
                  </Text>
                </View>

                {/* Main Action Menu (Fades out when confirming logout) */}
                <Animated.View style={{ 
                  opacity: confirmFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0]
                  }),
                  transform: [{
                    translateY: confirmFadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20]
                    })
                  }],
                  display: confirmLogout ? 'none' : 'flex'
                }}>
                  <TouchableOpacity 
                    className="flex-row items-center p-4 mb-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-transparent dark:border-zinc-800"
                    onPress={() => {
                      handleClose();
                      router.push(`/${user?.role === 'ADMIN' ? '(admin)' : '(user)'}/profile` as any);
                    }}
                  >
                    <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                      <MaterialIcons name="person" size={20} color="#3b82f6" />
                    </View>
                    <Text className="flex-1 text-base font-bold font-sans text-zinc-900 dark:text-white">Edit Profile</Text>
                    <MaterialIcons name="chevron-right" size={24} color={isDark ? "#a1a1aa" : "#71717a"} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="flex-row items-center p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-transparent dark:border-red-900/30"
                    onPress={handleLogoutPress}
                  >
                    <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mr-3">
                      <MaterialIcons name="logout" size={20} color="#ef4444" />
                    </View>
                    <Text className="flex-1 text-base font-bold font-sans text-red-600 dark:text-red-400">Sign Out</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </Animated.View>

                {/* Logout Confirmation Dialog (Fades in) */}
                <Animated.View style={{ 
                  opacity: confirmFadeAnim,
                  display: confirmLogout ? 'flex' : 'none' 
                }}>
                  <View className="p-4 rounded-xl border border-black dark:border-white bg-zinc-100 dark:bg-zinc-900/50">
                    <Text className="text-zinc-900 dark:text-white text-center font-bold mb-2">Sign out of {user?.name}?</Text>
                    <Text className="text-zinc-600 dark:text-zinc-400 text-center text-xs mb-6 px-4">You will need to re-authenticate to access NextGen.</Text>
                    
                    <View className="flex-row gap-3">
                      <TouchableOpacity 
                        className="flex-1 py-3 rounded-lg border border-black dark:border-white bg-zinc-100 dark:bg-zinc-900 items-center justify-center"
                        onPress={() => setConfirmLogout(false)}
                      >
                        <Text className="text-zinc-300 font-mono tracking-widest text-[10px] uppercase">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="flex-1 py-3 rounded-lg border-2 border-white bg-white dark:bg-zinc-950 items-center justify-center flex-row"
                        onPress={executeLogout}
                      >
                        <MaterialIcons name="logout" size={12} color="#FFFFFF" className="mr-2" />
                        <Text className="text-zinc-900 dark:text-white font-mono font-bold tracking-widest text-[10px] uppercase">Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>

            </GlassCard>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}
