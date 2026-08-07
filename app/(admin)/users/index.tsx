import { useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminUsers, deleteUser, exportUsersCSV } from '../../../services/api';
import UserCard from '../../../components/UserCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { Stack, useRouter } from 'expo-router';
import Background from '../../../components/Background';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function AdminUsersList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#fff' : '#000';
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const { data: users, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => getAdminUsers().then(res => res.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      Alert.alert('Success', 'User deleted successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to delete user');
    }
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (!users) return;
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u: any) => u.id));
    }
  };

  const handleExportSelected = async () => {
    try {
      const ids = selectedIds.length > 0 ? selectedIds : undefined;
      const res = await exportUsersCSV(ids);
      const fileUri = (FileSystem as any).documentDirectory + 'users_export.csv';
      await FileSystem.writeAsStringAsync(fileUri, res.data);
      await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
    } catch (e) {
      Alert.alert('Error', 'Failed to export users');
    }
  };

  const handleDelete = (userId: string, userName: string) => {
    Alert.alert('Delete User', `Are you sure you want to delete ${userName}? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(userId) }
    ]);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Background>
      <Stack.Screen options={{ title: 'All Users', headerShown: true }} />
      
      {/* Toolbar */}
      <View className="flex-row items-center justify-between px-4 pt-[90px] pb-2">
        <TouchableOpacity 
          onPress={() => { setIsSelectMode(!isSelectMode); setSelectedIds([]); }}
          className="flex-row items-center bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded-lg border border-black dark:border-white"
        >
          <MaterialIcons name={isSelectMode ? "close" : "checklist"} size={16} color={iconColor} />
          <Text className="ml-1.5 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest">
            {isSelectMode ? 'Cancel' : 'Select'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row gap-2">
          {isSelectMode && (
            <TouchableOpacity 
              onPress={selectAll}
              className="flex-row items-center bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded-lg border border-black dark:border-white"
            >
              <MaterialIcons name={selectedIds.length === (users?.length || 0) ? "deselect" : "select-all"} size={16} color={iconColor} />
              <Text className="ml-1.5 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest">
                {selectedIds.length === (users?.length || 0) ? 'None' : 'All'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={handleExportSelected}
            className="flex-row items-center bg-black dark:bg-white px-3 py-2 rounded-lg"
          >
            <MaterialIcons name="file-download" size={16} color={isDark ? '#000' : '#fff'} />
            <Text className="ml-1.5 text-xs font-bold text-white dark:text-black uppercase tracking-widest">
              {selectedIds.length > 0 ? `Export (${selectedIds.length})` : 'Export All'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={<EmptyState title="No users found" message="There are no users registered yet." />}
        renderItem={({ item }: { item: any }) => (
          <View className="mb-3">
            {isSelectMode && (
              <View className="flex-row items-center mb-1">
                <TouchableOpacity onPress={() => toggleSelect(item.id)} className="mr-2">
                  <MaterialIcons 
                    name={selectedIds.includes(item.id) ? "check-box" : "check-box-outline-blank"} 
                    size={24} 
                    color={selectedIds.includes(item.id) ? (isDark ? '#fff' : '#000') : '#a1a1aa'} 
                  />
                </TouchableOpacity>
                {item.role !== 'ADMIN' && (
                  <TouchableOpacity onPress={() => handleDelete(item.id, item.name || item.email)} className="ml-auto">
                    <MaterialIcons name="delete-outline" size={22} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            <UserCard 
              user={item} 
              onPress={() => router.push(`/(admin)/users/${item.id}`)}
            />
          </View>
        )}
      />
    </Background>
  );
}
