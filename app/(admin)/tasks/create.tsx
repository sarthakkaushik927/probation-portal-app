import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask } from '../../../services/api';
import { DOMAINS } from '../../../constants/domains';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import GlassCard from '../../../components/GlassCard';
import { useTabBackHandler } from '../../../hooks/useTabBackHandler';
import { useColorScheme } from 'nativewind';
import * as DocumentPicker from 'expo-document-picker';
import { uploadToCloudinary } from '../../../utils/cloudinary';

export default function CreateTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('COMMON');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [toastMessage, setToastMessage] = useState<{title: string, message: string, type: 'success' | 'error'} | null>(null);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#fff' : '#000';

  useTabBackHandler('/(admin)/tasks');

  const createMutation = useMutation({
    mutationFn: () => createTask({ title, description, domain, deadline: deadline.toISOString(), attachments: attachment ? [attachment] : [] }),
    onSuccess: () => {
      setToastMessage({ title: 'Success', message: 'Task created successfully', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['adminTasks'] });
      setTimeout(() => {
        router.replace('/(admin)/tasks');
      }, 1500);
    },
    onError: (error: any) => {
      setToastMessage({ title: 'Error', message: error.response?.data?.error || 'Failed to create task', type: 'error' });
      setTimeout(() => setToastMessage(null), 3000);
    }
  });

  const handleCreate = () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    createMutation.mutate();
  };

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950 px-5">
      <Stack.Screen options={{ title: 'Create Task' }} />
      {toastMessage && (
        <Animated.View 
          entering={FadeInUp.springify()} 
          exiting={FadeOutUp.duration(300)}
          className="absolute top-12 left-5 right-5 z-[999]"
          style={{ elevation: 99 }}
        >
          <GlassCard className={`flex-row items-center p-4 border-2 shadow-sm ${toastMessage.type === 'success' ? 'border-green-500' : toastMessage.type === 'error' ? 'border-red-500' : 'border-black dark:border-white'}`} intensity={90}>
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
      
      <ScrollView contentContainerStyle={{ paddingTop: 130, paddingBottom: 120, paddingHorizontal: 20 }}>
        <Stack.Screen options={{ title: 'Create Task', headerTransparent: true }} />
        
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => router.replace('/(admin)/tasks')}
          className="flex-row items-center mb-6 bg-zinc-100 dark:bg-zinc-900 self-start px-3 py-2 rounded-full border border-black dark:border-white"
        >
          <MaterialIcons name="arrow-back" size={18} color={iconColor} />
          <Text className="ml-1.5 font-bold text-xs uppercase tracking-widest text-zinc-900 dark:text-white">Back to Tasks</Text>
        </TouchableOpacity>

        <View className="mb-4">
        <Text className="text-gray-700 dark:text-slate-300 font-semibold mb-2 ml-1">Title</Text>
        <TextInput
          className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border-[3px] border-black dark:border-white text-zinc-900 dark:text-white font-mono"
          placeholder="Task title"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 dark:text-slate-300 font-semibold mb-2 ml-1">Description</Text>
        <TextInput
          className="w-full bg-white dark:bg-zinc-900 p-5 rounded-xl border-[3px] border-black dark:border-white text-zinc-900 dark:text-white font-mono min-h-[120px]"
          placeholder="Detailed task description..."
          placeholderTextColor="#9ca3af"
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 dark:text-slate-300 font-semibold mb-2 ml-1">Domain</Text>
        <View className="flex-row flex-wrap gap-2">
          {DOMAINS.map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDomain(d)}
              className={`px-4 py-2.5 rounded-xl border-[3px] border-black dark:border-white ${
                domain === d 
                  ? 'bg-blue-500' 
                  : 'bg-white dark:bg-zinc-900'
              }`}
            >
              <Text className={`font-mono font-bold text-xs uppercase tracking-wider ${domain === d ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-gray-700 dark:text-slate-300 font-semibold mb-2 ml-1">Deadline</Text>
        {Platform.OS === 'web' ? (
          <View className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border-[3px] border-black dark:border-white items-center flex-row justify-center">
            {/* @ts-ignore */}
            <input
              type="datetime-local"
              value={new Date(deadline.getTime() - deadline.getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
              onChange={(e: any) => {
                if (e.target.value) {
                  setDeadline(new Date(e.target.value));
                }
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: isDark ? '#ffffff' : '#000000',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                outline: 'none',
                fontSize: 16,
              }}
            />
          </View>
        ) : (
          <>
            <TouchableOpacity 
              className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border-[3px] border-black dark:border-white items-center flex-row justify-center"
              onPress={() => {
                setPickerMode('date');
                setShowDatePicker(true);
              }}
            >
              <Text className="text-zinc-900 dark:text-white font-mono font-bold uppercase tracking-widest">{deadline.toLocaleDateString()} {deadline.toLocaleTimeString()}</Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={deadline}
                mode={Platform.OS === 'ios' ? 'datetime' : pickerMode}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    if (event.type === 'set' && selectedDate) {
                      setDeadline(selectedDate);
                      if (pickerMode === 'date') {
                        setPickerMode('time');
                      } else {
                        setShowDatePicker(false);
                      }
                    } else {
                      setShowDatePicker(false);
                    }
                  } else {
                    setShowDatePicker(false);
                    if (selectedDate) setDeadline(selectedDate);
                  }
                }}
              />
            )}
          </>
        )}
      </View>

      <View className="mb-8">
        <Text className="text-gray-700 dark:text-slate-300 font-semibold mb-2 ml-1">Attachment</Text>
        <TouchableOpacity 
          className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border-[3px] border-black dark:border-white items-center flex-row justify-center"
          onPress={async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                setIsUploading(true);
                const asset = result.assets[0];
                const uri = asset.uri;
                const type = asset.name.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'raw';
                const url = await uploadToCloudinary(uri, type, asset.name, asset.mimeType);
                setAttachment(url);
              }
            } catch (e) {
              Alert.alert('Upload Failed', 'Failed to upload attachment to Cloudinary');
            } finally {
              setIsUploading(false);
            }
          }}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={iconColor} style={{ marginRight: 8 }} />
          ) : attachment ? (
            <MaterialIcons name="check-circle" size={20} color="#10b981" style={{ marginRight: 8 }} />
          ) : (
            <MaterialIcons name="attach-file" size={20} color={iconColor} style={{ marginRight: 8 }} />
          )}
          <Text className="text-zinc-900 dark:text-white font-mono font-bold uppercase tracking-widest">
            {isUploading ? 'Uploading...' : attachment ? 'File Attached' : 'Attach File'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        className={`w-full py-4 px-6 rounded-xl items-center mb-12 border-[3px] border-black dark:border-white ${createMutation.isPending || isUploading ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-[#e0e7ff] dark:bg-blue-900'} flex-row justify-center`}
        onPress={handleCreate}
        disabled={createMutation.isPending || isUploading}
      >
        {createMutation.isPending && (
          <ActivityIndicator size="small" color="#71717a" style={{ marginRight: 8 }} />
        )}
        <Text className="text-zinc-900 dark:text-white font-mono text-lg font-bold uppercase tracking-widest mr-2">
          {createMutation.isPending ? 'Creating...' : 'Create Task'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
}
