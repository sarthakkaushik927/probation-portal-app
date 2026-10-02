import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTeamLink, removeTeamLink } from '../services/api';
import * as Linking from 'expo-linking';
import { useColorScheme } from 'nativewind';

interface TeamTaskSubmissionProps {
  taskId: string;
  teamSubmission: any;
  members: any[];
  setToastMessage: (msg: any) => void;
}

export default function TeamTaskSubmission({ taskId, teamSubmission, members, setToastMessage }: TeamTaskSubmissionProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const queryClient = useQueryClient();
  
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addLinkMutation = useMutation({
    mutationFn: () => addTeamLink(taskId, linkName, linkUrl),
    onSuccess: () => {
      setToastMessage({ title: 'Success', message: 'Link added successfully!', type: 'success' });
      setLinkName('');
      setLinkUrl('');
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ['userTask', taskId] });
    },
    onError: (error: any) => {
      setToastMessage({ title: 'Error', message: error.response?.data?.error || 'Failed to add link', type: 'error' });
    }
  });

  const removeLinkMutation = useMutation({
    mutationFn: (index: number) => removeTeamLink(taskId, index),
    onSuccess: () => {
      setToastMessage({ title: 'Success', message: 'Link removed successfully!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['userTask', taskId] });
    },
    onError: (error: any) => {
      setToastMessage({ title: 'Error', message: error.response?.data?.error || 'Failed to remove link', type: 'error' });
    }
  });

  const handleAddLink = () => {
    if (!linkName.trim() || !linkUrl.trim()) {
      setToastMessage({ title: 'Error', message: 'Please provide both name and URL', type: 'error' });
      return;
    }
    addLinkMutation.mutate();
  };

  const openLink = (url: string) => {
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    Linking.openURL(formattedUrl).catch(err => console.error("An error occurred", err));
  };

  return (
    <View>
      <GlassCard className="p-6 mb-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-bold text-zinc-900 dark:text-white">Team Submission</Text>
          <View className={`self-start flex-row items-center px-4 py-1.5 rounded-md border ${
            teamSubmission.status === 'APPROVED' ? 'border-solid border-white' :
            teamSubmission.status === 'REJECTED' ? 'border-dashed border-zinc-500' :
            'border-dotted border-zinc-500'
          }`}>
            <Text className={`font-mono tracking-widest uppercase text-[10px] ${
              teamSubmission.status === 'APPROVED' ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
            }`}>{teamSubmission.status}</Text>
          </View>
        </View>

        <Text className="text-zinc-500 font-bold uppercase text-xs mb-3">Submission Links</Text>
        
        {teamSubmission.links && teamSubmission.links.length > 0 ? (
          teamSubmission.links.map((link: any, idx: number) => (
            <View key={idx} className="flex-row items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-3 rounded-lg mb-3">
              <TouchableOpacity 
                className="flex-1 flex-row items-center"
                onPress={() => openLink(link.url)}
              >
                <MaterialIcons name="link" size={18} color={isDark ? '#FFFFFF' : '#000000'} style={{ marginRight: 10 }} />
                <View className="flex-1">
                  <Text className="text-zinc-900 dark:text-white font-mono text-[10px] font-bold uppercase tracking-widest">{link.name}</Text>
                  <Text className="text-blue-500 dark:text-blue-400 text-xs mt-0.5" numberOfLines={1}>{link.url}</Text>
                </View>
              </TouchableOpacity>
              {teamSubmission.status !== 'APPROVED' && (
                <TouchableOpacity 
                  className="p-2"
                  onPress={() => removeLinkMutation.mutate(idx)}
                >
                  <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text className="text-zinc-400 italic mb-4 text-sm">No links added yet.</Text>
        )}

        {teamSubmission.status !== 'APPROVED' && (
          isAdding ? (
            <View className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-dashed border-zinc-400 dark:border-zinc-700 mt-2">
              <Text className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider mb-2">Link Name (e.g. GitHub, Figma)</Text>
              <TextInput
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-4 py-3 rounded-lg text-zinc-900 dark:text-white font-medium mb-3"
                placeholder="Name"
                placeholderTextColor="#9ca3af"
                value={linkName}
                onChangeText={setLinkName}
              />
              <Text className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider mb-2">URL</Text>
              <TextInput
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-4 py-3 rounded-lg text-zinc-900 dark:text-white font-medium mb-4"
                placeholder="https://..."
                placeholderTextColor="#9ca3af"
                keyboardType="url"
                autoCapitalize="none"
                value={linkUrl}
                onChangeText={setLinkUrl}
              />
              <View className="flex-row justify-end space-x-3 gap-3">
                <TouchableOpacity 
                  className="px-4 py-2"
                  onPress={() => setIsAdding(false)}
                >
                  <Text className="text-zinc-500 font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="px-4 py-2 bg-black dark:bg-white rounded-lg flex-row items-center"
                  onPress={handleAddLink}
                  disabled={addLinkMutation.isPending}
                >
                  {addLinkMutation.isPending ? (
                    <ActivityIndicator color={isDark ? '#000000' : '#ffffff'} size="small" />
                  ) : (
                    <Text className="text-white dark:text-black font-bold">Add Link</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              className="flex-row items-center justify-center bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-600 p-4 rounded-xl mt-2"
              onPress={() => setIsAdding(true)}
            >
              <MaterialIcons name="add" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text className="ml-2 font-bold text-zinc-900 dark:text-white uppercase tracking-widest text-xs">Add Link</Text>
            </TouchableOpacity>
          )
        )}
      </GlassCard>

      <View className="mb-6">
        <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-3 ml-1">Team Members</Text>
        <View className="flex-row flex-wrap gap-2">
          {members.map((member: any) => (
            <View key={member.id} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-3 py-1.5 rounded-full flex-row items-center mr-2 mb-2">
              <MaterialIcons name="person" size={14} color="#71717a" />
              <Text className="ml-1.5 text-zinc-900 dark:text-white font-mono text-xs">{member.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
