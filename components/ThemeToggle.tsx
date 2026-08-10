import { TouchableOpacity, View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    setColorScheme(newTheme);
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={toggleTheme}
      className="items-center justify-center w-full h-full"
    >
      <MaterialIcons
        name={isDark ? 'light-mode' : 'dark-mode'}
        size={22}
        color={isDark ? '#f59e0b' : '#6366f1'}
      />
    </TouchableOpacity>
  );
}
