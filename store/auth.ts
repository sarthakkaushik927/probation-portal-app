import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '../types';

interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  setAuth: async (token, user) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
    }
    set({ token, user });
  },
  clearAuth: async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } else {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
    }
    set({ token: null, user: null });
  },
  loadFromStorage: async () => {
    let token = null;
    let userStr = null;
    if (Platform.OS === 'web') {
      token = localStorage.getItem('auth_token');
      userStr = localStorage.getItem('auth_user');
    } else {
      token = await SecureStore.getItemAsync('auth_token');
      userStr = await SecureStore.getItemAsync('auth_user');
    }
    if (token && userStr) {
      try {
        set({ token, user: JSON.parse(userStr) });
      } catch (e) {
        console.error("Failed to parse user from storage", e);
      }
    }
  },
}));
