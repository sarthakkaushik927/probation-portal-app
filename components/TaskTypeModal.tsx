import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface TaskTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectIndividual: () => void;
  onSelectTeam: () => void;
}

export default function TaskTypeModal({ visible, onClose, onSelectIndividual, onSelectTeam }: TaskTypeModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#ffffff' : '#000000';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onClose}
      >
        <Pressable onPress={e => e.stopPropagation()}>
          <View className="mx-4 mb-8 rounded-2xl overflow-hidden border-2 border-black dark:border-white">
            <BlurView 
              tint={isDark ? 'dark' : 'light'} 
              intensity={80}
              style={{ backgroundColor: isDark ? 'rgba(9, 9, 11, 0.85)' : 'rgba(255, 255, 255, 0.9)' }}
            >
              <View className="p-6">
                <Text className="text-xl font-black text-zinc-900 dark:text-white mb-1 text-center uppercase tracking-widest">
                  Create Task
                </Text>
                <Text className="text-zinc-500 dark:text-zinc-400 text-center text-xs mb-6 font-medium">
                  What type of task do you want to create?
                </Text>

                {/* Individual Task Option */}
                <TouchableOpacity
                  className="flex-row items-center p-5 rounded-xl border-2 border-black dark:border-white mb-3 bg-zinc-50 dark:bg-zinc-900"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelectIndividual();
                  }}
                  activeOpacity={0.7}
                >
                  <View className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center mr-4 border border-black dark:border-white">
                    <MaterialIcons name="person" size={24} color={iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                      Individual Task
                    </Text>
                    <Text className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                      Assign to users by domain
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#71717a" />
                </TouchableOpacity>

                {/* Team Task Option */}
                <TouchableOpacity
                  className="flex-row items-center p-5 rounded-xl border-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-900"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelectTeam();
                  }}
                  activeOpacity={0.7}
                >
                  <View className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center mr-4 border border-black dark:border-white">
                    <MaterialIcons name="groups" size={24} color={iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                      Team Task
                    </Text>
                    <Text className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                      Assign specific members to a team
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#71717a" />
                </TouchableOpacity>

                {/* Cancel */}
                <TouchableOpacity
                  className="mt-4 py-3 items-center"
                  onPress={onClose}
                >
                  <Text className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
