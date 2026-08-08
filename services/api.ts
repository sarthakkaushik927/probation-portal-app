import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { Platform } from 'react-native';

const BASE_URL = 'https://probation-portal-backend.vercel.app';

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
export const signup = (name: string, email: string, password: string, studentType?: string, phoneNumber?: string) =>
  api.post('/api/auth/signup', { name, email, password, studentType, phoneNumber });
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
export const updateSubmission = (taskId: string, data: object) => api.put(`/api/user/submissions`, { taskId, ...data });
export const getUserAttendance = () => api.get('/api/user/attendance');
export const updateProfile = (data: { name?: string; avatarData?: string }) =>
  api.put('/api/user/profile', data);
export const changePassword = (currentPassword: string, newPassword: string) =>
  api.put('/api/user/change-password', { currentPassword, newPassword });

// Admin
export const getAdminDashboard = () => api.get('/api/admin/dashboard');
export const getAdminUsers = () => api.get('/api/admin/users');
export const getAdminUser = (userId: string) => api.get(`/api/admin/users/${userId}`);
export const updateUserDomain = (userId: string, domain: string | null) =>
  api.patch(`/api/admin/users/${userId}/domain`, { domain });
export const deleteUser = (userId: string) => api.delete(`/api/admin/users/${userId}`);
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
export const getAdminAttendanceUsers = (date?: string) => 
  api.get(`/api/admin/attendance${date ? `?date=${encodeURIComponent(date)}` : ''}`);
export const saveAttendance = (date: string, records: object[]) =>
  api.post('/api/admin/attendance', { date, records });

// Admin Export CSV
export const exportAttendanceCSV = () => api.get('/api/admin/export/attendance', { responseType: 'text' });
export const exportSubmissionsCSV = () => api.get('/api/admin/export/submissions', { responseType: 'text' });
export const exportUsersCSV = (userIds?: string[]) => {
  const params = userIds ? `?userIds=${userIds.join(',')}` : '';
  return api.get(`/api/admin/export/users${params}`, { responseType: 'text' });
};
export const exportUserDataCSV = (userId: string) =>
  api.get(`/api/admin/export/users/${userId}`, { responseType: 'text' });

// Submission Comments
export const getSubmissionComments = (submissionId: string) =>
  api.get(`/api/submissions/${submissionId}/comments`);
export const addSubmissionComment = (submissionId: string, message: string) =>
  api.post(`/api/submissions/${submissionId}/comments`, { message });

// Notifications
export const getNotifications = () => api.get('/api/notifications');
export const markNotificationRead = (id: string) => api.put(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/api/notifications/read-all');
export const deleteNotification = (id: string) => api.delete(`/api/notifications/${id}`);
export const broadcastNotification = (title: string, body: string) => 
  api.post('/api/notifications/broadcast', { title, body });
export const getUserDirectory = () => api.get('/api/user/directory');

export const forgotPassword = (email: string) =>
  api.post('/api/auth/forgot-password', { email });
export const resetPassword = (email: string, otp: string, newPassword: string) =>
  api.post('/api/auth/reset-password', { email, otp, newPassword });
export const updatePassword = (currentPassword: string, newPassword: string) =>
  api.put('/api/user/change-password', { currentPassword, newPassword });
export const updateAvatar = (avatarData: string) =>
  api.patch('/api/user/avatar', { avatarData });
export const savePushToken = (pushToken: string) =>
  api.patch('/api/user/push-token', { pushToken });

export default api;
