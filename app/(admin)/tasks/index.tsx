import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAdminTasks } from '../../../services/api';
import TaskCard from '../../../components/TaskCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Background from '../../../components/Background';
import TaskTypeModal from '../../../components/TaskTypeModal';
import * as Haptics from 'expo-haptics';
import { shouldUseRefreshControl } from '../../../hooks/useTabRefresh';


export default function AdminTasksList() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showTypeModal, setShowTypeModal] = useState(false);
  const { data: tasks, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminTasks'],
    queryFn: () => getAdminTasks().then(res => res.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Background>
      <FlatList
        data={tasks}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 140, paddingTop: 130 }}
        refreshControl={
          shouldUseRefreshControl() ? (
            <RefreshControl 
              refreshing={isRefetching} 
              onRefresh={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                refetch();
              }} 
            />
          ) : undefined
        }
        ListEmptyComponent={<EmptyState title="No tasks" message="Create a task to get started" />}
        renderItem={({ item }: { item: any }) => (
          <TaskCard 
            task={item} 
            onPress={() => router.push(`/(admin)/tasks/${item.id}` as any)}
          />
        )}
      />
      <TouchableOpacity 
        className="absolute bottom-32 right-6 w-14 h-14 bg-black dark:bg-white rounded-full items-center justify-center border-2 border-black dark:border-white shadow-lg"
        style={{ elevation: 5 }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowTypeModal(true);
        }}
      >
        <MaterialIcons name="add" size={28} color={isDark ? '#000000' : '#ffffff'} />
      </TouchableOpacity>

      <TaskTypeModal
        visible={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelectIndividual={() => {
          setShowTypeModal(false);
          router.push('/(admin)/tasks/create' as any);
        }}
        onSelectTeam={() => {
          setShowTypeModal(false);
          router.push('/(admin)/tasks/create-team' as any);
        }}
      />
    </Background>
  );
}
