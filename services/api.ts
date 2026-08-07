import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { Platform } from 'react-native';

const ENV_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.109:4000';
// Force the IP address instead of 10.0.2.2 so both real phones and emulators work
const BASE_URL = Platform.OS === 'web' 
  ? ENV_URL.replace('10.0.2.2', 'localhost') 
  : ENV_URL.replace('10.0.2.2', '192.168.0.109');

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  let token = null;
  if (Platform.OS === 'web') {
    token = localStorage.getItem('auth_token');
  } else {
    token = await SecureStore.getItemAsync('auth_token');
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log(`❌ ${error.response?.status || 'NETWORK'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.message);
    return Promise.reject(error);
  }
);

// Auth
export const signup = (name: string, email: string, password: string) =>
  api.post('/api/auth/signup', { name, email, password });
export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password });
export const sendOTP = (email: string) =>
  api.post('/api/auth/send-otp', { email });
export const verifyOTP = (email: string, otp: string) =>
  api.post('/api/auth/verify-otp', { email, otp });
export const resendOTP = (email: string) =>
  api.post('/api/auth/resend-otp', { email });

// User
export const getMe = () => api.get('/api/user/me');
export const getUserTasks = () => api.get('/api/user/tasks');
export const getUserTask = (taskId: string) => api.get(`/api/user/tasks/${taskId}`);
export const getUserSubmissions = () => api.get('/api/user/submissions');
export const createSubmission = (data: object) => api.post('/api/user/submissions', data);
export const getUserAttendance = () => api.get('/api/user/attendance');

// Admin
export const getAdminDashboard = () => api.get('/api/admin/dashboard');
export const getAdminUsers = () => api.get('/api/admin/users');
export const getAdminUser = (userId: string) => api.get(`/api/admin/users/${userId}`);
export const updateUserDomain = (userId: string, domain: string | null) =>
  api.patch(`/api/admin/users/${userId}/domain`, { domain });
export const getAdminTasks = () => api.get('/api/admin/tasks');
export const createTask = (data: object) => api.post('/api/admin/tasks', data);
export const updateTask = (taskId: string, data: object) =>
  api.patch(`/api/admin/tasks/${taskId}`, data);
export const getAdminSubmissions = () => api.get('/api/admin/submissions');
export const getAdminSubmission = (id: string) => api.get(`/api/admin/submissions/${id}`);
export const approveSubmission = (id: string) =>
  api.patch(`/api/admin/submissions/${id}/approve`);
export const rejectSubmission = (id: string) =>
  api.patch(`/api/admin/submissions/${id}/reject`);
export const getAdminAttendanceUsers = () => api.get('/api/admin/attendance');
export const saveAttendance = (date: string, records: object[]) =>
  api.post('/api/admin/attendance', { date, records });

export default api;
